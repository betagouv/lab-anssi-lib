#!/usr/bin/env python3
"""
generer_cra.py — Génération du CRA mensuel MSS pour Atelier Teinei
Stéfanie Loiseleur / betagouv/mon-service-securise

Usage :
    python3 generer_cra.py                    # mois courant
    python3 generer_cra.py --mois 2026-04     # mois spécifique
    python3 generer_cra.py --dry-run          # affiche la période sans générer

Ce script :
  1. Calcule la période (1er du mois → dernier jour ouvré lun-jeu)
  2. Interroge GitHub pour collecter les PRs et commits de Nephtys
  3. Génère le DOCX via Node.js (template cra_template.js)
  4. Valide et copie dans le répertoire de sortie

Prérequis :
    npm install -g docx
    pip install requests --break-system-packages
"""

import argparse
import calendar
import json
import os
import subprocess
import sys
import time
from datetime import date, timedelta

import requests

# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────
GITHUB_REPO   = "betagouv/mon-service-securise"
GITHUB_USER   = "Nephtys"
GITHUB_TOKEN  = os.environ.get("GITHUB_TOKEN", "")  # optionnel mais recommandé

NOMS_REELS = {
    "CadiChris":    "Christophe",
    "ThibaudMZN":   "Thibaud",
    "Pamplemousse": "Xavier",
    "Nephtys":      "Stéfanie",
}

JOURS_FR  = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
MOIS_FR   = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
             'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

OUTPUT_DIR    = os.path.expanduser("~/CRA-MSS")
TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "cra_template.js")


# ─────────────────────────────────────────────
# Calcul de la période
# ─────────────────────────────────────────────

def dernier_jour_ouvre(annee: int, mois: int) -> date:
    """
    Dernier jour ouvré du mois pour Stéfanie (lun-jeu uniquement).
    Si le dernier jour du mois est vendredi/sam/dim → jeudi précédent.
    """
    dernier = date(annee, mois, calendar.monthrange(annee, mois)[1])
    reculer = {4: 1, 5: 2, 6: 3}  # vendredi=4, samedi=5, dimanche=6
    delta = reculer.get(dernier.weekday(), 0)
    return dernier - timedelta(days=delta)


def periode_du_mois(annee: int, mois: int):
    debut = date(annee, mois, 1)
    fin   = dernier_jour_ouvre(annee, mois)
    return debut, fin


def formater_date_fr(d: date) -> str:
    return f"{d.day} {MOIS_FR[d.month]} {d.year}"


# ─────────────────────────────────────────────
# Accès GitHub
# ─────────────────────────────────────────────

def gh_headers():
    h = {"Accept": "application/vnd.github+json"}
    if GITHUB_TOKEN:
        h["Authorization"] = f"Bearer {GITHUB_TOKEN}"
    return h


def gh_get(url: str, params=None) -> dict | list:
    """GET GitHub API avec gestion du rate limit."""
    while True:
        r = requests.get(url, headers=gh_headers(), params=params, timeout=15)
        if r.status_code == 403 and "rate limit" in r.text.lower():
            reset = int(r.headers.get("X-RateLimit-Reset", time.time() + 60))
            wait = max(reset - int(time.time()), 5)
            print(f"  ⏳ Rate limit GitHub — attente {wait}s…", file=sys.stderr)
            time.sleep(wait)
            continue
        r.raise_for_status()
        return r.json()


def prs_de_la_periode(debut: date, fin: date) -> list[dict]:
    """
    Retourne toutes les PRs fermées/mergées dont la période chevauche [debut, fin]
    ET qui impliquent Nephtys (auteure ou co-auteure de commits).
    """
    print(f"  🔍 Recherche des PRs du {formater_date_fr(debut)} au {formater_date_fr(fin)}…")

    # 1. PRs créées par Nephtys sur la période
    prs_trouvees: dict[int, dict] = {}

    url = f"https://api.github.com/repos/{GITHUB_REPO}/pulls"
    for state in ("closed", "open"):
        page = 1
        while True:
            data = gh_get(url, params={
                "state": state, "per_page": 100, "page": page,
                "sort": "created", "direction": "desc"
            })
            if not data:
                break
            for pr in data:
                created = date.fromisoformat(pr["created_at"][:10])
                if created < debut:
                    # Les PRs sont triées par date décroissante : on peut arrêter
                    goto_next_state = True
                    break
                merged_at = pr.get("merged_at")
                merged = date.fromisoformat(merged_at[:10]) if merged_at else None
                # Garder si créée OU mergée dans la période
                in_period = (debut <= created <= fin) or (merged and debut <= merged <= fin)
                if in_period:
                    prs_trouvees[pr["number"]] = pr
            else:
                page += 1
                continue
            break

    # 2. Pour chaque PR de la période (toutes, pas seulement celles de Nephtys),
    #    vérifier si Nephtys a des commits dedans
    # On récupère aussi les PRs ouvertes par d'autres membres
    all_prs_url = f"https://api.github.com/repos/{GITHUB_REPO}/pulls"
    for state in ("closed", "open"):
        page = 1
        while True:
            data = gh_get(all_prs_url, params={
                "state": state, "per_page": 100, "page": page,
                "sort": "updated", "direction": "desc"
            })
            if not data:
                break
            stop = False
            for pr in data:
                updated = date.fromisoformat(pr["updated_at"][:10])
                if updated < debut - timedelta(days=5):
                    stop = True
                    break
                if pr["number"] in prs_trouvees:
                    continue
                merged_at = pr.get("merged_at")
                merged = date.fromisoformat(merged_at[:10]) if merged_at else None
                in_period = (
                    (debut <= date.fromisoformat(pr["created_at"][:10]) <= fin) or
                    (merged and debut <= merged <= fin)
                )
                if not in_period:
                    continue
                # Vérifier si Nephtys a des commits
                commits_url = f"https://api.github.com/repos/{GITHUB_REPO}/pulls/{pr['number']}/commits"
                commits = gh_get(commits_url, params={"per_page": 100})
                for c in commits:
                    login = (c.get("author") or {}).get("login", "")
                    if login == GITHUB_USER:
                        prs_trouvees[pr["number"]] = pr
                        break
                time.sleep(0.3)  # politesse envers l'API
            if stop:
                break
            page += 1

    print(f"  ✓ {len(prs_trouvees)} PRs impliquant {GITHUB_USER} trouvées")
    return sorted(prs_trouvees.values(), key=lambda p: p["number"])


def enrichir_pr(pr: dict, debut: date, fin: date) -> dict | None:
    """
    Pour une PR donnée, détermine le rôle exact de Nephtys.
    Retourne None si Nephtys n'a aucune implication (ni commit, ni review,
    ni commentaire, ni merge).
    """
    numero = pr["number"]
    print(f"    📋 PR #{numero} — {pr['title'][:60]}…")

    # Commits
    commits_url = f"https://api.github.com/repos/{GITHUB_REPO}/pulls/{numero}/commits"
    commits = gh_get(commits_url, params={"per_page": 100})

    commits_nephtys = []
    commits_autres  = []
    for c in commits:
        login = (c.get("author") or {}).get("login", "")
        msg   = c["commit"]["message"].split("\n")[0]
        coauthors = []
        for line in c["commit"]["message"].split("\n"):
            if "Co-authored-by:" in line:
                coauthors.append(line)

        is_nephtys = login == GITHUB_USER
        is_co      = any(GITHUB_USER.lower() in co.lower() for co in coauthors)

        if is_nephtys or is_co:
            commits_nephtys.append(msg)
        else:
            commits_autres.append(msg)

    # Reviews (approbations, demandes de changements, reviews commentées)
    reviews_url = f"https://api.github.com/repos/{GITHUB_REPO}/pulls/{numero}/reviews"
    reviews     = gh_get(reviews_url)
    a_approuve  = any(
        r["state"] == "APPROVED" and (r.get("user") or {}).get("login") == GITHUB_USER
        for r in reviews
    )
    a_commente_review = any(
        (r.get("user") or {}).get("login") == GITHUB_USER
        for r in reviews
    )

    # Commentaires généraux sur la PR (fil de discussion)
    comments_url = f"https://api.github.com/repos/{GITHUB_REPO}/issues/{numero}/comments"
    comments     = gh_get(comments_url, params={"per_page": 100})
    a_commente   = any(
        (c.get("user") or {}).get("login") == GITHUB_USER
        for c in comments
    )

    # Merger
    merged_by   = (pr.get("merged_by") or {}).get("login", "")
    a_merge     = merged_by == GITHUB_USER

    # Auteur de la PR
    auteur_pr   = (pr.get("user") or {}).get("login", "")
    est_auteure = auteur_pr == GITHUB_USER

    # Exclure les PRs sans aucune implication réelle
    impliquee = est_auteure or commits_nephtys or a_approuve or a_commente_review or a_commente or a_merge
    if not impliquee:
        print(f"      ↳ aucune implication — ignorée")
        return None

    # Déterminer le rôle
    if est_auteure and commits_nephtys and not commits_autres:
        role = "Auteure + mergeuse" if a_merge else "Auteure"
    elif commits_nephtys and not est_auteure:
        role = "Co-auteure + mergeuse" if a_merge else "Co-auteure"
    elif est_auteure:
        role = "Auteure + mergeuse" if a_merge else "Auteure"
    elif a_approuve and a_merge:
        role = "Relectrice + mergeuse"
    elif a_approuve:
        role = "Relectrice"
    elif (a_commente_review or a_commente) and a_merge:
        role = "Relectrice + mergeuse"
    elif a_commente_review or a_commente:
        role = "Relectrice"
    elif a_merge:
        role = "Mergeuse"
    else:
        role = "Contributrice"

    # Dates
    merged_at   = pr.get("merged_at")
    date_iso    = merged_at[:10] if merged_at else pr["created_at"][:10]
    date_str    = date.fromisoformat(date_iso).strftime("%d/%m")

    auteur_reel = NOMS_REELS.get(auteur_pr, auteur_pr)

    return {
        "numero":            f"#{numero}",
        "titre":             pr["title"],
        "url":               pr["html_url"],
        "date":              date_str,
        "date_iso":          date_iso,
        "statut":            "Mergée" if pr.get("merged_at") else "En cours (ouverte)",
        "role":              role,
        "commits_nephtys":   commits_nephtys,
        "auteur_pr":         auteur_reel,
        "n_commits_total":   len(commits),
        "n_commits_nephtys": len(commits_nephtys),
    }


# ─────────────────────────────────────────────
# Génération DOCX via Node.js
# ─────────────────────────────────────────────

def generer_docx(prs_enrichies: list[dict], debut: date, fin: date, output_dir: str) -> str:
    """Passe les données au template Node.js et retourne le chemin du fichier généré."""
    os.makedirs(output_dir, exist_ok=True)

    nom_fichier = f"CRA_MSS_{debut.year}-{debut.month:02d}_Stefanie_Loiseleur.docx"
    output_path = os.path.join(output_dir, nom_fichier)

    payload = {
        "prs":         prs_enrichies,
        "date_debut":  formater_date_fr(debut),
        "date_fin":    formater_date_fr(fin),
        "output_path": output_path,
        "mois_annee":  f"{MOIS_FR[debut.month].capitalize()} {debut.year}",
    }

    payload_path = "/tmp/cra_payload.json"
    with open(payload_path, "w") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

    result = subprocess.run(
        ["node", TEMPLATE_PATH, payload_path],
        capture_output=True, text=True
    )
    if result.returncode != 0:
        print("ERREUR Node.js :", result.stderr, file=sys.stderr)
        sys.exit(1)

    print(f"  ✓ DOCX généré : {output_path}")
    return output_path


# ─────────────────────────────────────────────
# Point d'entrée
# ─────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Génère le CRA MSS mensuel")
    parser.add_argument("--mois",    help="Mois cible YYYY-MM (défaut: mois courant)")
    parser.add_argument("--debut",   help="Date de début YYYY-MM-DD (remplace --mois)")
    parser.add_argument("--fin",     help="Date de fin YYYY-MM-DD (remplace --mois)")
    parser.add_argument("--dry-run", action="store_true", help="Affiche la période sans générer")
    parser.add_argument("--output",  default=OUTPUT_DIR, help="Répertoire de sortie")
    args = parser.parse_args()

    # Déterminer la période
    if args.debut and args.fin:
        debut = date.fromisoformat(args.debut)
        fin   = date.fromisoformat(args.fin)
    elif args.mois:
        annee, mois = map(int, args.mois.split("-"))
        debut, fin = periode_du_mois(annee, mois)
    else:
        aujourd_hui = date.today()
        annee, mois = aujourd_hui.year, aujourd_hui.month
        debut, fin = periode_du_mois(annee, mois)

    print(f"\n{'═'*60}")
    print(f"  CRA MSS — Atelier Teinei / Stéfanie Loiseleur")
    print(f"  Période : {formater_date_fr(debut)} → {formater_date_fr(fin)}")
    print(f"  Dernier jour : {JOURS_FR[fin.weekday()]}")
    print(f"{'═'*60}\n")

    if args.dry_run:
        print("Mode dry-run — arrêt avant collecte GitHub.")
        return

    if not GITHUB_TOKEN:
        print("⚠️  GITHUB_TOKEN non défini — risque de rate limiting (60 req/h).")
        print("   Définir : export GITHUB_TOKEN=ghp_xxx\n")

    # Collecter et enrichir les PRs
    prs_brutes    = prs_de_la_periode(debut, fin)
    prs_enrichies = []
    for pr in prs_brutes:
        enrichie = enrichir_pr(pr, debut, fin)
        if enrichie is not None:
            prs_enrichies.append(enrichie)
        time.sleep(0.5)

    print(f"\n  {len(prs_enrichies)} PRs avec implication de {GITHUB_USER} retenues.")

    # Générer le DOCX
    output_path = generer_docx(prs_enrichies, debut, fin, args.output)

    # Valider
    validate_script = os.path.expanduser(
        "~/.npm-global/lib/node_modules/../../../mnt/skills/public/docx/scripts/office/validate.py"
    )
    # Chemin standard dans l'environnement Claude
    validate_script = "/mnt/skills/public/docx/scripts/office/validate.py"
    if os.path.exists(validate_script):
        result = subprocess.run(
            ["python3", validate_script, output_path],
            capture_output=True, text=True
        )
        if "PASSED" in result.stdout:
            print("  ✓ Validation DOCX : OK")
        else:
            print("  ⚠️  Validation DOCX :", result.stdout[-200:])

    print(f"\n  📄 Fichier final : {output_path}\n")


if __name__ == "__main__":
    main()
