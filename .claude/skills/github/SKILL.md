---
name: github
description: |
  Pratiques Git et GitHub de l'équipe lab-anssi-lib : nommage des branches, messages de commit,
  commits atomiques, workflow de contribution.
  DÉCLENCHER dès que l'utilisateur parle de commit, branche, PR, push, merge, ou demande
  comment contribuer au projet.
---

# Pratiques Git — lab-anssi-lib

Ce skill décrit les conventions en vigueur dans le projet, extraites de l'historique réel.
Les respecter garantit un historique lisible, des revues de code efficaces, et une intégration
sans friction.

---

## Règle absolue : jamais de push direct sur `main`

`main` est la branche de référence — elle ne reçoit du code que via Pull Request.
Tout développement, aussi petit soit-il, passe par une branche dédiée.

---

## Nommage des branches

Format : **kebab-case, tout en minuscules, descriptif**.

```
competences
publication-pnpm
version-2-1-4
```

Quelques principes :
- Décrire **ce que fait la branche**, pas qui la développe
- Pas de préfixe de type `feat/`, `fix/`, `chore/` — juste le sujet en clair
- Utiliser des tirets comme séparateurs, jamais de slash, underscore, ou majuscules
- Uniquement les caractères `[A-Za-z0-9]` et `-` — pas d'accents, pas de caractères spéciaux
- Rester court mais suffisamment explicite pour comprendre le sujet sans ouvrir la PR

---

## Messages de commit

### Structure

```
[CATEGORIE] Verbe impératif en français décrivant ce qui change
```

La catégorie est optionnelle. Quand elle est absente, le message commence directement
par le verbe impératif.

### Exemples tirés de l'historique

```
Ajoute une compétence TDD
Remplace `npm` par `pnpm` comme client pour gérer les paquets
Ajoute l'attribut crossorigin
Exporte l'erreur d'article crisp introuvable

[VERSION] Passe à la version 2.1.5
[SECURITE] Mets à jour axios suite alerte dependabot
[CORRECTION] Convertis les articles d'une catégorie en HTML
[CI] Fait passer les tests sur toutes les versions de Node
```

### Catégories connues

Extraites des deux repos (`lab-anssi-lib` et `anssi-portail`) :

| Catégorie          | Usage                                                             |
|--------------------|-------------------------------------------------------------------|
| `[VERSION]`        | Montée de version du paquet (`package.json`)                      |
| `[SECURITE]`       | Mise à jour de dépendance suite à une alerte de sécurité          |
| `[SECU]`           | Variante courte de `[SECURITE]`, même usage                       |
| `[CORRECTION]`     | Correction d'un bug                                               |
| `[BUG]`            | Variante de `[CORRECTION]`, même usage                            |
| `[CI]`             | Modification de la configuration d'intégration continue           |
| `[SOIN]`           | Nettoyage, refactoring, amélioration sans changement de comportement |

Des catégories métier peuvent aussi apparaître pour regrouper les commits d'une même
fonctionnalité en cours de développement (ex : `[INFOLETTRE]`, `[GESTION GUIDES]`).
Elles disparaissent naturellement une fois la fonctionnalité livrée.

Pour tout le reste (ajout de fonctionnalité isolé, documentation, tests…),
le message commence directement par le verbe, sans catégorie.

### Règles de style

- Verbe à l'impératif, en français — sans point final
- Le backtick `` ` `` est utilisé pour citer un nom de fichier, de fonction ou de paquet
- Une ligne suffit dans la grande majorité des cas ; un corps de message reste exceptionnel

### Verbes observés dans l'historique

Extraits des deux repos du projet (`lab-anssi-lib` et `anssi-portail`) :

| Verbe       | Verbe       | Verbe       | Verbe      |
|-------------|-------------|-------------|------------|
| `Ajoute`    | `Supprime`  | `Affiche`   | `Assure`   |
| `Corrige`   | `Remplace`  | `Renomme`   | `Adapte`   |
| `Mets à jour` | `Modifie` | `Extrais`   | `Valide`   |
| `Monte`     | `Importe`   | `Exporte`   | `Applique` |
| `Passe`     | `Utilise`   | `Vérifie`   | `Ajuste`   |
| `Parse`     | `Permet`    | `Récupère`  | `Navigue`  |
| `Appelle`   | `Pointe`    | `Retrouve`  | `Économise`|

Cette liste n'est pas exhaustive — tout verbe impératif clair et en français est acceptable.

---

## Commits atomiques

Chaque commit = **une seule intention**, compréhensible indépendamment des autres.

Un commit atomique :
- Compile et passe les tests à lui seul
- Ne mélange pas plusieurs sujets (pas de "Ajoute X et corrige Y et met à jour Z")
- Peut être relu, revert ou cherry-pické sans effets de bord

Si une modification implique naturellement plusieurs étapes (ex : ajout d'une dépendance
puis utilisation dans le code), les séparer en autant de commits distincts.

---

## Résumé rapide

| Quoi              | Convention                                              |
|-------------------|---------------------------------------------------------|
| Push sur `main`   | Interdit — toujours passer par une PR                   |
| Nom de branche    | `kebab-case-descriptif`                                 |
| Message de commit | `[CATEGORIE] Verbe impératif en français` (catégorie optionnelle) |
| Taille du commit  | Atomique — une seule intention par commit               |
