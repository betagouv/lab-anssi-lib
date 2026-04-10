---
name: tdd
description: |
  Applique le cycle TDD (Rouge → Vert → Refactor) sur une tâche donnée, un comportement à la fois.
  DÉCLENCHER dès que l'utilisateur demande d'implémenter une fonctionnalité, d'écrire des tests,
  de suivre le TDD, ou mentionne Red/Green/Refactor, cycle TDD, baby steps, ou "test d'abord".
---

# Méthode TDD — Baby Steps stricts

Le principe fondamental : **un seul comportement à la fois, un seul test à la fois**.
Chaque baby step est complet en lui-même : test rouge → code minimal → tests verts → refactor → suivant.
On ne passe jamais à l'étape suivante sans avoir terminé et validé la précédente.

## Rythme : pause et validation après chaque étape

Le cycle TDD est collaboratif — l'utilisateur garde la main à chaque transition.
Après chaque étape, Claude s'arrête et pose **une question contextuelle courte**.

**Convention : si l'utilisateur répond `c`, on continue sans rien changer.**
Toute autre réponse est traitée comme une instruction à appliquer avant de passer à la suite.

### Questions à poser selon l'étape

Après **🔴 Rouge** (test écrit et rouge confirmé) :
> "Test rouge ✓ — tu veux modifier quelque chose avant que j'écrive le code ? (`c` pour continuer)"

Après **🟢 Vert** (tous les tests passent) :
> "Tests au vert ✓ — tu veux qu'on refactorise quelque chose en particulier ? (`c` pour passer au comportement suivant)"

Après **🔵 Refactor** (si un refactor a été fait) :
> "Refactor terminé ✓ — ça te convient ? (`c` pour passer au comportement suivant)"

Ne jamais enchaîner deux étapes sans avoir attendu la réponse. Une réponse vide ou `c` signifie
"validé, continue" — tout autre contenu est une instruction à intégrer.

---

## Priorité à l'intention de l'utilisateur

À chaque étape du cycle, **lire attentivement ce que l'utilisateur a écrit** avant d'agir.
Si sa demande indique un comportement précis à tester, un refactor particulier à faire, ou
une direction à prendre, s'y conformer en priorité plutôt que de décider seul.

Exemples :
- "Refactorise en extrayant une méthode `validate()`" → faire exactement ça, pas un autre nettoyage
- "Teste le cas où l'entrée est None" → écrire ce test-là, pas un autre
- "Garde l'implémentation naïve pour l'instant" → ne pas optimiser même si c'est tentant

En l'absence d'indication, proposer ce qui semble le plus pertinent et expliquer brièvement pourquoi.

---

## Le cycle : Rouge → Vert → Refactor

### 🔴 Étape Rouge — Écrire UN seul test qui échoue

**Prérequis :** tous les tests existants doivent être au vert avant d'écrire un nouveau test rouge.
Ne jamais démarrer un nouveau baby step si la suite de tests n'est pas entièrement verte.

1. Lire l'entrée utilisateur — si un comportement précis est demandé, le tester en priorité ;
   sinon, identifier le **comportement suivant** le plus petit et le plus utile
2. Écrire le test le plus simple possible qui décrit ce comportement
3. **Lancer les tests immédiatement** — vérifier que le nouveau test échoue, et identifier pourquoi
4. **Si le nouveau test passe immédiatement au vert → ne pas l'ajouter.** Le supprimer et s'arrêter.
   Un test vert dès l'écriture n'a aucune valeur TDD : il ne prouve pas que le comportement testé
   est manquant, il peut masquer une mauvaise assertion ou un test mort-né, et il pollue la suite
   sans jamais avoir guidé le code. Reprendre depuis le début : identifier un comportement vraiment
   absent, écrire un test qui échoue pour la bonne raison, puis seulement continuer.
5. Si d'autres tests existants se mettent à échouer à cette étape → comprendre la cause (conflit de design, effet de bord, fixture partagée…) et corriger avant de continuer

Un test = un comportement observable. Pas une méthode entière, pas un scénario complet — juste la prochaine chose la plus petite qui peut être vérifiée.

### 🟢 Étape Vert — Écrire le minimum de code pour passer le test

1. Écrire **uniquement le code nécessaire** pour faire passer ce test et rien de plus
2. Résister à l'envie d'anticiper les prochains tests ou de généraliser — ce sera fait au bon moment
3. **Lancer les tests immédiatement** — vérifier que tous les tests passent (pas seulement le nouveau)
4. Si un test existant se met à échouer → corriger le **code**, jamais le test

### 🔵 Étape Refactor — Améliorer sans casser

1. Si l'utilisateur a indiqué un refactor précis à faire, l'appliquer en priorité
2. Sinon, nettoyer ce qui en a le plus besoin (duplication, nommage, lisibilité) **sans changer le comportement**
3. **Lancer les tests après chaque micro-modification** du refactor
4. Si un test casse → annuler la dernière modification, comprendre pourquoi, recommencer plus finement
5. Le refactor est terminé quand le code est propre et tous les tests passent

### 🔁 Retour à l'étape Rouge — Comportement suivant

Recommencer avec le comportement suivant, aussi petit que possible.

---

## Règles impératives

Ces règles ne sont pas des recommandations — elles définissent ce qu'est le TDD :

- **Modifier un test existant est rare et doit être explicitement confirmé par l'utilisateur** —
  un test qui passe encode un comportement acquis, et le toucher sans réfléchir efface cette mémoire.
  Si un tel besoin se présente, le traiter pendant l'étape Refactor (jamais pendant Rouge ou Vert),
  expliquer pourquoi la modification est justifiée, et attendre la validation avant de procéder.

- **Ne jamais écrire du code de production sans avoir d'abord un test rouge** — le code sans
  test rouge n'est pas du TDD, c'est du code avec des tests ajoutés après.

- **Ne jamais ajouter un test qui passe au vert immédiatement** — un test vert dès l'écriture
  n'est pas un test TDD, c'est du bruit. Si c'est le cas, ne pas l'ajouter au projet, prendre
  du recul, et reposer la question : quel comportement est réellement absent du code ?

- **Exécuter les tests après chaque étape Rouge ET chaque étape Vert** — "ça devrait marcher"
  n'est pas suffisant. Les tests sont la seule preuve.

- **Si un test existant se met à échouer après une modification** → corriger le code, pas le test.
  Le test a raison, il protège un comportement acquis.

- **Un seul test à la fois** — jamais plusieurs tests rouges en même temps. Cela brouille le
  signal et rend le diagnostic difficile.

---

## Rituel de lancement des tests

Entre **chaque baby step**, relancer la suite complète de tests. Pas juste le nouveau test.
Cette habitude est fondamentale : elle garantit qu'aucun comportement acquis n'est cassé
sans que l'on s'en aperçoive immédiatement.

Le signal est clair :
- **Tous verts** → on peut avancer
- **Au moins un rouge** → on s'arrête, on comprend, on corrige avant d'aller plus loin

---

## Vérification de l'environnement

Avant de démarrer, s'assurer que la commande de test fonctionne :

```bash
# Exemples selon l'environnement
pytest         # Python
pnpm test      # Node.js — ne jamais utiliser npm test dans ce projet
```

Si la commande échoue sur un projet vide → créer le premier test fictif et vérifier que
l'outillage fonctionne (rouge attendu) avant de commencer le vrai travail.

---

## Exemple de session TDD

```
Comportement : "get(key) retourne None si la clé n'existe pas"

🔴 Rouge
  → Écrire test_get_returns_none_for_missing_key()
  → Lancer les tests → ROUGE (KeyError levée au lieu de None)
  ✓ Le test échoue pour la bonne raison

🟢 Vert
  → Modifier get() pour retourner None si clé absente
  → Lancer les tests → TOUS VERTS

🔵 Refactor
  → Nommage de la variable intermédiaire plus clair
  → Lancer les tests → TOUS VERTS
  ✓ Aucun comportement changé

🔁 Suivant
  → Comportement suivant : "set(key, value) stocke la valeur, get(key) la retourne"
```

---

## Ce que ce skill ne fait PAS

- Il n'implémente pas plusieurs comportements en une seule fois
- Il ne saute pas l'étape de test rouge pour "aller plus vite"
- Il n'accepte pas de tests d'intégration ou E2E dans ce cycle (uniquement des TU)