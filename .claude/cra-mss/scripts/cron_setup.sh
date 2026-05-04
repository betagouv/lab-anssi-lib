#!/usr/bin/env bash
# =============================================================================
# cron_setup.sh — Configure la génération automatique mensuelle du CRA MSS
# Atelier Teinei / Stéfanie Loiseleur
#
# Usage : bash cron_setup.sh
# =============================================================================

# Le script Python ci-dessous calcule le bon jour de déclenchement.
# Principe : dernier jour du mois, mais si c'est un vendredi/sam/dim → jeudi précédent.
# Stéfanie ne travaille pas le vendredi, samedi, dimanche.

# On utilise une entrée cron mensuelle (le 28 de chaque mois) qui calcule
# dynamiquement si aujourd'hui est le bon jour avant d'agir.
# Pourquoi le 28 ? C'est le seul jour qui existe dans tous les mois.
# Le script se ré-évalue chaque jour du 28 au dernier jour du mois.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENERATE_SCRIPT="$SCRIPT_DIR/generer_cra.py"
LOG_FILE="$HOME/.cra-mss/cra.log"
CLAUDE_CMD="claude"  # ajuster si claude n'est pas dans le PATH

# Créer le répertoire de logs
mkdir -p "$HOME/.cra-mss"

# --------------------------------------------------------------------
# Script Python embarqué — calcul du jour de déclenchement
# --------------------------------------------------------------------
CHECKER=$(cat << 'PYEOF'
import sys
from datetime import date, timedelta
import calendar

def dernier_jour_ouvre(annee, mois):
    dernier = date(annee, mois, calendar.monthrange(annee, mois)[1])
    # 4=vendredi, 5=samedi, 6=dimanche → reculer au jeudi (3)
    jours_a_reculer = {4: 1, 5: 2, 6: 3}
    delta = jours_a_reculer.get(dernier.weekday(), 0)
    return dernier - timedelta(days=delta)

aujourd_hui = date.today()
cible = dernier_jour_ouvre(aujourd_hui.year, aujourd_hui.month)

if aujourd_hui == cible:
    print("GO")
else:
    print(f"SKIP — cible={cible}, aujourd_hui={aujourd_hui}")
PYEOF
)

# --------------------------------------------------------------------
# Wrapper de déclenchement (appelé par cron)
# --------------------------------------------------------------------
WRAPPER_PATH="$HOME/.cra-mss/run_if_last_workday.sh"

cat > "$WRAPPER_PATH" << WRAPPER
#!/usr/bin/env bash
# Généré par cron_setup.sh — ne pas modifier manuellement

LOG="$LOG_FILE"
CLAUDE="$CLAUDE_CMD"

result=\$(python3 - << 'PYEOF'
$CHECKER
PYEOF
)

echo "\$(date '+%Y-%m-%d %H:%M') — \$result" >> "\$LOG"

if [[ "\$result" == "GO" ]]; then
    MOIS=\$(date '+%B %Y')
    echo "\$(date '+%Y-%m-%d %H:%M') — Lancement génération CRA \$MOIS" >> "\$LOG"
    "\$CLAUDE" "Génère mon CRA pour le mois de \$MOIS" >> "\$LOG" 2>&1
    echo "\$(date '+%Y-%m-%d %H:%M') — Terminé" >> "\$LOG"
fi
WRAPPER

chmod +x "$WRAPPER_PATH"

# --------------------------------------------------------------------
# Installation de l'entrée cron
# Tourne du 28 au 31 de chaque mois à 17h00
# Le script lui-même vérifie si c'est le bon jour
# --------------------------------------------------------------------
CRON_LINE="0 17 28-31 * * $WRAPPER_PATH"

# Vérifier si l'entrée existe déjà
if crontab -l 2>/dev/null | grep -qF "run_if_last_workday.sh"; then
    echo "✓ Entrée cron déjà présente, pas de doublon."
else
    # Ajouter à la crontab existante
    (crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -
    echo "✓ Entrée cron installée : $CRON_LINE"
fi

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  CRA MSS — Routine mensuelle configurée"
echo "  Déclenchement : dernier jeudi ou avant (lun-jeu) du mois"
echo "  Heure         : 17h00"
echo "  Logs          : $LOG_FILE"
echo "  Vérifier avec : crontab -l"
echo "═══════════════════════════════════════════════════════"
echo ""

# Afficher le prochain déclenchement prévu
python3 - << PYEOF
from datetime import date, timedelta
import calendar

def dernier_jour_ouvre(annee, mois):
    dernier = date(annee, mois, calendar.monthrange(annee, mois)[1])
    jours_a_reculer = {4: 1, 5: 2, 6: 3}
    delta = jours_a_reculer.get(dernier.weekday(), 0)
    return dernier - timedelta(days=delta)

jours_fr = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche']
mois_fr = ['', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
           'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

aujourd_hui = date.today()

# Prochain déclenchement (ce mois ou le mois prochain)
cible = dernier_jour_ouvre(aujourd_hui.year, aujourd_hui.month)
if cible < aujourd_hui:
    if aujourd_hui.month == 12:
        cible = dernier_jour_ouvre(aujourd_hui.year + 1, 1)
    else:
        cible = dernier_jour_ouvre(aujourd_hui.year, aujourd_hui.month + 1)

print(f"  Prochain CRA   : {jours_fr[cible.weekday()]} {cible.day} {mois_fr[cible.month]} {cible.year} à 17h00")
PYEOF
