---
name: cra-mss
description: Génère le Compte Rendu d'Activité (CRA) mensuel de Stéfanie Loiseleur (Atelier Teinei) pour le projet MonServiceSécurisé (betagouv/mon-service-securise). Utilise ce skill dès que l'utilisateur demande à générer un CRA, un PV de service fait, un compte rendu d'activité, ou un rapport mensuel pour MSS. Déclenche aussi si l'utilisateur dit "génère mon CRA", "je veux mon CRA de [mois]", ou "rapport du mois".
---

# CRA MonServiceSécurisé — Atelier Teinei

Génère le Compte Rendu d'Activité mensuel de Stéfanie Loiseleur pour MonServiceSécurisé.

## Contexte métier

- **Prestataire** : Stéfanie Loiseleur — Atelier Teinei
- **Projet** : MonServiceSécurisé (`betagouv/mon-service-securise`)
- **Handle GitHub** : `Nephtys` (https://github.com/Nephtys)
- **Stack** : Node.js / Svelte 5 / TypeScript / PostgreSQL
- **Mode de travail** : pair programming — les contributions incluent des commits co-signés sur des PRs ouvertes par d'autres membres de l'équipe
- **Équipe** :
  - Christophe (CadiChris sur GitHub) — genre masculin
  - Thibaud (ThibaudMZN sur GitHub) — genre masculin
  - Xavier (Pamplemousse sur GitHub) — genre masculin
- **Genre** : Stéfanie est de genre féminin. Thibaud, Christophe et Xavier sont de genre masculin.

**Terminologie des rôles** (accorder selon le genre du sujet) :
- relectrice / relecteur (pas revieweuse/reviewer)
- contributrice / contributeur (pas contributeure)
- co-auteure / co-auteur
- **Jours travaillés** : lundi, mardi, mercredi, jeudi (pas de vendredi ni week-end)

## Ce que couvre le CRA

Pour chaque PR de la période, le CRA distingue :
- **Auteure + mergeuse** : PR ouverte et mergée par Stéfanie
- **Co-auteure** : PR contenant des commits signés par Stéfanie (pair programming), même si ouverte par quelqu'un d'autre
- **Relectrice + mergeuse** : PR d'un autre membre, relue et mergée par Stéfanie
- **Relectrice** : relecture ou commentaire seulement
- **Mergeuse** : merge sans review ni commit

Une PR est **exclue du CRA** si Nephtys n'a ni commité, ni reviewé (approbation, demande de changements, commentaire de review), ni commenté (fil de discussion), ni mergé.

⚠️ Ne jamais se limiter aux PRs dont Stéfanie est l'auteure GitHub — toujours vérifier les commits, reviews et commentaires de chaque PR ouverte par d'autres membres sur la période.

## Workflow de génération

### Étape 1 — Déterminer la période

Si la période n'est pas précisée, utiliser le mois écoulé.  
La période commence le **1er du mois** et se termine le **dernier jour ouvré** (voir règle ci-dessous).

Une période personnalisée peut être passée avec `--debut` et `--fin` (format `YYYY-MM-DD`).

**Règle du dernier jour ouvré** (Stéfanie ne travaille pas les vendredi, samedi, dimanche) :
- Trouver le dernier jour du mois
- Si ce jour est un vendredi, samedi ou dimanche → reculer au jeudi précédent
- Si ce jour est un lundi, mardi, mercredi ou jeudi → c'est le bon jour

### Étape 2 — Collecter les PRs via GitHub

Lancer le script Python :

```bash
# Mois courant
python3 scripts/generer_cra.py

# Mois spécifique
python3 scripts/generer_cra.py --mois 2026-04

# Période personnalisée
python3 scripts/generer_cra.py --debut 2026-04-20 --fin 2026-04-30

# Dry-run (période uniquement, sans collecte)
python3 scripts/generer_cra.py --dry-run
```

Définir `GITHUB_TOKEN` avant d'exécuter pour éviter le rate limit :
```bash
export GITHUB_TOKEN=ghp_xxx
```

⚠️ L'organisation `betagouv` bloque les fine-grained tokens avec une durée > 366 jours. Utiliser un token classique (scope `repo`) ou un fine-grained token ≤ 366 jours.

**Logique d'implication** : pour chaque PR de la période, le script vérifie dans l'ordre :
1. Commits signés par Nephtys (auteure ou co-auteure via `Co-authored-by`)
2. Reviews (APPROVED, CHANGES_REQUESTED, COMMENTED)
3. Commentaires généraux sur le fil de la PR
4. Merge par Nephtys

Si aucune de ces conditions n'est remplie → PR ignorée (non incluse au CRA).

### Étape 3 — Générer le fichier DOCX

Le script Python appelle automatiquement `cra_template.js` via Node.js.  
Prérequis : `npm install docx` dans le répertoire `scripts/`.

**Couleurs** :
- `#0079D0` (bleu MSS) : titres de sections, en-têtes de tableaux, en-tête document
- `#D6EEFF` : fond des libellés de la table infos générales
- `#F2F7FC` / blanc : lignes alternées des tableaux
- `#1a6b2a` vert : statut "Mergée" ; `#7B3F00` orange : statut "En cours"

**Structure du document** :
1. **En-tête** : table 2 colonnes — logo MSS (fond blanc) à gauche, "COMPTE RENDU D'ACTIVITÉ" + dates (fond `#0079D0`) à droite
2. **Informations générales** : tableau prestataire / entreprise / GitHub / projet / période / date d'établissement / nature / modalité
3. **Synthèse par chantier** : tableau 3 colonnes — Chantier / PRs / Description fonctionnelle du chantier
4. **Détail des PRs** : tableau 5 colonnes — PR / Titre / Statut / Rôle / Détail — trié par numéro de PR croissant ; colonne Détail = "X commits sur Y" ou "Relecture (PR de Prénom)"
5. **Attestation de service fait** : bloc signatures prestataire + commanditaire

**Conventions de style** :
- Police Arial, taille 20 (corps), 17-19 (cellules tableaux)
- En-têtes de tableaux principaux : fond `#0079D0`, texte blanc
- En-têtes table infos générales : fond `#D6EEFF`, texte `#0079D0`
- Espace sous les titres de section : 160 DXA
- Format A4, marges 1000 DXA

**Nom du fichier de sortie** :
```
CRA_MSS_{YYYY-MM}_{prenom}_{nom}.docx
```
Exemple : `CRA_MSS_2026-04_Stefanie_Loiseleur.docx`

Fichier écrit dans `~/CRA-MSS/`.

### Étape 4 — Vérification finale

Avant de livrer, vérifier :
- [ ] Seules les PRs avec implication réelle de Nephtys sont incluses
- [ ] Les rôles sont exacts (co-auteure vs relectrice vs auteure)
- [ ] Les noms réels sont utilisés (Christophe, Thibaud, Xavier — pas les handles GitHub)
- [ ] Le genre est respecté : **relectrice** (pas revieweuse), **contributrice** (pas contributeure)
- [ ] Les dates de début/fin de période sont correctes

## Règle de scheduling mensuel

Le CRA doit être généré le **dernier jour ouvré du mois** :

```python
from datetime import date
import calendar

def dernier_jour_ouvre(annee, mois):
    dernier = date(annee, mois, calendar.monthrange(annee, mois)[1])
    # 0=lundi … 3=jeudi, 4=vendredi, 5=samedi, 6=dimanche
    jours_a_reculer = {4: 1, 5: 2, 6: 3}
    delta = jours_a_reculer.get(dernier.weekday(), 0)
    return dernier - __import__('datetime').timedelta(days=delta)
```

Pour le scheduling cron, voir `scripts/cron_setup.sh`.
