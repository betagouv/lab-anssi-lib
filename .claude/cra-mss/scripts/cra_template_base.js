const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, ExternalHyperlink, ImageRun
} = require('docx');
const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, 'logo_mss.png');
const logoData = fs.existsSync(logoPath) ? fs.readFileSync(logoPath) : null;
const fallbackPath = path.join(__dirname, 'logo_fallback.png');
const fallbackData = fs.existsSync(fallbackPath) ? fs.readFileSync(fallbackPath) : null;

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };

const headerColor = "0079D0";
const lightBlue = "D6EEFF";
const midBlue = "005EA8";

function cell(children, opts = {}) {
  return new TableCell({
    borders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 160, right: 160 },
    verticalAlign: VerticalAlign.CENTER,
    children,
  });
}

function boldCell(text, fill) {
  return cell([
    new Paragraph({
      children: [new TextRun({ text, bold: true, color: fill === headerColor ? "FFFFFF" : "0079D0", size: 20, font: "Arial" })],
    })
  ], { fill });
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: "0079D0", font: "Arial" })],
    spacing: { before: 240, after: 60 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "005EA8", space: 1 } },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: opts.size || 20, font: "Arial", bold: opts.bold, color: opts.color })],
    spacing: { before: opts.before || 40, after: opts.after || 40 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
  });
}

// =======================================
// DONNÉES COMPLÈTES — vue pair-programming
// =======================================

const prs = [
  {
    num: "#2771",
    titre: "[SPA] Ajoute la page Homologuer",
    url: "https://github.com/betagouv/mon-service-securise/pull/2771",
    date: "22–23 avr. 2026",
    statut: "Mergée",
    role: "Co-auteure (pair)",
    commits_nephtys: [
      "Ajoute le bouton de suppression de dossier courant",
      "Ajoute le bouton de téléchargement des documents pour un dossier en cours",
      "Met à jour les badges d'homologation sur le tableau de bord (couleurs DSFR)",
      "[SOIN] Supprime l'ancienne modale encart homologation (suite migration Svelte)",
      "+ 5 commits co-écrits avec Thibaud (affichage des dossiers, onglets vides, modale félicitations, bouton création/reprise…)",
    ],
    description: "PR principale de la semaine. Stéfanie est co-auteure de 9 des 15 commits : implémentation des boutons d'action (suppression, téléchargement), mise à jour des badges DSFR sur le tableau de bord, suppression de l'ancienne modale Pug/jQuery migrée en Svelte, et développement en pair des vues dossiers, onglets et modale félicitations.",
  },
  {
    num: "#2774",
    titre: "[CORRECTION] Corrige des typos",
    url: "https://github.com/betagouv/mon-service-securise/pull/2774",
    date: "22 avr. 2026",
    statut: "Mergée",
    role: "Auteure + mergeuse",
    commits_nephtys: ["Corrige des typos (commit unique)"],
    description: "Correction de typos introduites lors de la migration SPA. PR ouverte et mergée par Stéfanie.",
  },
  {
    num: "#2776",
    titre: "[CORRECTION] Ne suggère pas de continuer la simulation si le service est déjà en v2",
    url: "https://github.com/betagouv/mon-service-securise/pull/2776",
    date: "27 avr. 2026",
    statut: "Mergée",
    role: "Relectrice + mergeuse",
    commits_nephtys: [],
    description: "PR de Christophe corrigeant une désynchro entre l'état du service (v2) et la table simulation_migration_referentiel en BDD. Stéfanie a relu, renommé le titre pour le clarifier et mergé.",
  },
  {
    num: "#2777",
    titre: "[CORRECTION] Reporte en Svelte la modale de démarche indicative",
    url: "https://github.com/betagouv/mon-service-securise/pull/2777",
    date: "23 avr. 2026",
    statut: "Mergée",
    role: "Auteure + mergeuse",
    commits_nephtys: ["Migration de la modale démarche indicative en composant Svelte"],
    description: "Réécriture de la modale « démarche indicative » en Svelte pour remplacer l'ancienne implémentation jQuery/Pug, dans le cadre de la migration SPA.",
  },
  {
    num: "#2778",
    titre: "Corrections sur SPA Homologuer et Accueil (masquer suppression si pas le droit)",
    url: "https://github.com/betagouv/mon-service-securise/pull/2778",
    date: "27 avr. 2026",
    statut: "Mergée",
    role: "Co-auteure + mergeuse",
    commits_nephtys: ["[SOIN] Extrais la lecture de l'utilisateur courant", "[CORRECTION] Affiche le header en mode connecté même sur les pages publiques"],
    description: "PR ouverte par Christophe (masquage des boutons selon droits). Stéfanie a ajouté 2 commits : extraction de la lecture utilisateur courant et correction du header en mode connecté sur les pages publiques. Stéfanie a relu et mergé.",
  },
  {
    num: "#2779",
    titre: "[CORRECTION] Ne tente pas de charger le centre de notifications si la div conteneur n'est pas présente",
    url: "https://github.com/betagouv/mon-service-securise/pull/2779",
    date: "28 avr. 2026",
    statut: "Mergée",
    role: "Auteure + mergeuse",
    commits_nephtys: ["Fix centre de notifications sur pages non authentifiées"],
    description: "PR ouverte et mergée par Stéfanie, relue par Christophe. Correction d'une erreur JS sur les pages publiques : le composant Svelte du centre de notifications ne s'initialise plus si son élément DOM d'ancrage est absent.",
  },
  {
    num: "#2781",
    titre: "[CORRECTION] Répare la fuite CSS qui touchait les activités de mesure",
    url: "https://github.com/betagouv/mon-service-securise/pull/2781",
    date: "28 avr. 2026",
    statut: "Mergée",
    role: "Relectrice + mergeuse",
    commits_nephtys: [],
    description: "PR de Christophe corrigeant une fuite CSS de validation.css dans la SPA (sélecteurs trop larges causant des effets de bord sur le tiroir d'activités de mesure en PROD). Stéfanie a relu et mergé.",
  },
  {
    num: "#2775",
    titre: "Parcours homologuer en SPA",
    url: "https://github.com/betagouv/mon-service-securise/pull/2775",
    date: "24 avr. 2026 → en cours",
    statut: "En cours (ouverte)",
    role: "Contributrice principale (pair)",
    commits_nephtys: ["Nombreux commits en pair avec Christophe et Thibaud depuis le 24 avril"],
    description: "Refonte du parcours d'homologation complet en SPA Svelte. 51 commits au total, dont la grande majorité écrits ou co-écrits par Stéfanie en pair avec Christophe et Thibaud. Chantier central de la période, encore en revue.",
  },
  {
    
    titre: "[RENOVATE] Update @axe-core/playwright to v4.11.2",
    url: "https://github.com/betagouv/mon-service-securise/pull/2782",
    date: "28 avr. 2026",
    statut: "Mergée",
    role: "Relectrice + mergeuse",
    commits_nephtys: [],
    description: "PR Renovate (Xavier) de mise à jour de la dépendance axe-core/playwright (tests d'accessibilité automatisés). Stéfanie a relu et mergé.",
  },
];

const chantiers = [
  {
    titre: "SPA — Page Homologuer (dossiers)",
    prs: "#2771 (co-auteure), #2777",
    description: "Développement en pair de la nouvelle page /homologuer en SPA Svelte : composants dossiers, boutons d'action, badges DSFR, modale félicitations, migration modale démarche indicative.",
  },
  {
    titre: "SPA — Parcours homologuer (en cours)",
    prs: "#2775 (contributrice principale)",
    description: "Refonte du parcours d'homologation complet en SPA. Chantier collaboratif itératif actif sur toute la période.",
  },
  {
    titre: "Corrections frontend post-migration",
    prs: "#2774, #2776, #2778, #2779, #2781",
    description: "Corrections ciblées issues de la migration SPA : typos, désynchro BDD/état service, header connecté sur pages publiques, notifications, fuite CSS.",
  },
  {
    titre: "Maintenance & qualité",
    prs: "#2782 (Renovate)",
    description: "Mise à jour de la dépendance axe-core/playwright pour les tests d'accessibilité automatisés.",
  },
];

const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 540, hanging: 260 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 20 } } },
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, right: 1000, bottom: 1134, left: 1000 }
      }
    },
    children: [
      // EN-TÊTE : logo à gauche, titre à droite
      new Table({
        width: { size: 9906, type: WidthType.DXA },
        columnWidths: [2400, 7506],
        borders: {
          top:     { style: BorderStyle.SINGLE, size: 12, color: midBlue },
          bottom:  { style: BorderStyle.SINGLE, size: 12, color: midBlue },
          left:    { style: BorderStyle.NONE },
          right:   { style: BorderStyle.NONE },
          insideH: { style: BorderStyle.NONE },
          insideV: { style: BorderStyle.NONE },
        },
        rows: [new TableRow({ children: [
          // Colonne logo
          new TableCell({
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            shading: { fill: "FFFFFF", type: ShadingType.CLEAR },
            margins: { top: 140, bottom: 140, left: 200, right: 120 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({
              alignment: AlignmentType.LEFT,
              children: logoData ? [new ImageRun({
                type: "png",
                data: logoData,
                transformation: { width: 190, height: 67 },
                altText: { title: "Logo MonServiceSécurisé", description: "Logo MonServiceSécurisé", name: "logo_mss" },
                fallback: {
                  type: "png",
                  data: fallbackData,
                },
              })] : [new TextRun({ text: "MonServiceSécurisé", bold: true, size: 22, color: headerColor, font: "Arial" })],
            })],
          }),
          // Colonne titre
          new TableCell({
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            shading: { fill: headerColor, type: ShadingType.CLEAR },
            margins: { top: 120, bottom: 120, left: 260, right: 200 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 60 },
                children: [new TextRun({ text: "COMPTE RENDU D'ACTIVITÉ", bold: true, size: 34, color: "FFFFFF", font: "Arial" })],
              }),
              new Paragraph({
                alignment: AlignmentType.LEFT,
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "20 – 30 avril 2026", size: 22, color: "FFFFFF", font: "Arial", italics: true })],
              }),
            ],
          }),
        ]})],
      }),

      new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),

      // 1. INFORMATIONS GÉNÉRALES
      h2("1. Informations générales"),
      new Table({
        width: { size: 9906, type: WidthType.DXA },
        columnWidths: [2800, 7106],
        rows: [
          new TableRow({ children: [boldCell("Prestataire", lightBlue), cell([new Paragraph({ children: [new TextRun({ text: "Stéfanie Loiseleur", size: 20, font: "Arial" })] })]) ] }),
          new TableRow({ children: [boldCell("Entreprise", lightBlue), cell([new Paragraph({ children: [new TextRun({ text: "Atelier Teinei", size: 20, font: "Arial" })] })]) ] }),
          new TableRow({ children: [boldCell("Handle GitHub", lightBlue), cell([new Paragraph({ children: [new ExternalHyperlink({ link: "https://github.com/Nephtys", children: [new TextRun({ text: "Nephtys (github.com/Nephtys)", style: "Hyperlink", size: 20, font: "Arial" })] })] })]) ] }),
          new TableRow({ children: [boldCell("Projet", lightBlue), cell([new Paragraph({ children: [new ExternalHyperlink({ link: "https://github.com/betagouv/mon-service-securise", children: [new TextRun({ text: "betagouv/mon-service-securise", style: "Hyperlink", size: 20, font: "Arial" })] })] })]) ] }),
          new TableRow({ children: [boldCell("Période couverte", lightBlue), cell([new Paragraph({ children: [new TextRun({ text: "20 avril 2026 – 30 avril 2026", size: 20, font: "Arial" })] })]) ] }),
          new TableRow({ children: [boldCell("Date d'établissement", lightBlue), cell([new Paragraph({ children: [new TextRun({ text: "30 avril 2026", size: 20, font: "Arial" })] })]) ] }),
          new TableRow({ children: [boldCell("Nature de la prestation", lightBlue), cell([new Paragraph({ children: [new TextRun({ text: "Développement full-stack — Node.js / Svelte 5 / TypeScript / PostgreSQL", size: 20, font: "Arial" })] })]) ] }),
          new TableRow({ children: [boldCell("Modalité de travail", lightBlue), cell([new Paragraph({ children: [new TextRun({ text: "Pair programming — les contributions incluent des commits co-signés sur des PRs ouvertes par d'autres membres de l'équipe", size: 20, font: "Arial" })] })]) ] }),
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),

      // 2. SYNTHÈSE PAR CHANTIER
      h2("2. Synthèse des travaux réalisés"),
      p("Les développements s'articulent autour de quatre axes :"),
      new Paragraph({ children: [], spacing: { before: 60, after: 0 } }),

      new Table({
        width: { size: 9906, type: WidthType.DXA },
        columnWidths: [3000, 2000, 4906],
        rows: [
          new TableRow({
            children: [
              boldCell("Chantier", headerColor),
              boldCell("PRs associées", headerColor),
              boldCell("Description synthétique", headerColor),
            ]
          }),
          ...chantiers.map((c, i) => {
            const fill = i % 2 === 0 ? "F2F7FC" : "FFFFFF";
            return new TableRow({ children: [
              cell([new Paragraph({ children: [new TextRun({ text: c.titre, bold: true, size: 19, font: "Arial", color: "0079D0" })], spacing: { before: 40, after: 40 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: c.prs, size: 18, font: "Arial" })], spacing: { before: 40, after: 40 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: c.description, size: 18, font: "Arial" })], spacing: { before: 40, after: 40 } })], { fill }),
            ]});
          })
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),

      // 3. DÉTAIL DES PRs
      h2("3. Détail des Pull Requests et contributions"),
      new Paragraph({ children: [], spacing: { before: 100, after: 0 } }),

      new Table({
        width: { size: 9906, type: WidthType.DXA },
        columnWidths: [620, 2600, 1000, 900, 820, 3966],
        rows: [
          new TableRow({
            children: [
              boldCell("PR", headerColor),
              boldCell("Titre", headerColor),
              boldCell("Date", headerColor),
              boldCell("Statut", headerColor),
              boldCell("Rôle", headerColor),
              boldCell("Description", headerColor),
            ]
          }),
          ...prs.map((pr, i) => {
            const fill = i % 2 === 0 ? "F2F7FC" : "FFFFFF";
            const statusColor = pr.statut === "Mergée" ? "1a6b2a" : "7B3F00";
            return new TableRow({ children: [
              cell([new Paragraph({ children: [new ExternalHyperlink({ link: pr.url, children: [new TextRun({ text: pr.num, style: "Hyperlink", size: 17, font: "Arial" })] })], spacing: { before: 30, after: 30 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: pr.titre, size: 17, font: "Arial" })], spacing: { before: 30, after: 30 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: pr.date, size: 17, font: "Arial" })], spacing: { before: 30, after: 30 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: pr.statut, size: 17, font: "Arial", color: statusColor, bold: true })], spacing: { before: 30, after: 30 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: pr.role, size: 17, font: "Arial" })], spacing: { before: 30, after: 30 } })], { fill }),
              cell([new Paragraph({ children: [new TextRun({ text: pr.description, size: 17, font: "Arial" })], spacing: { before: 30, after: 30 } })], { fill }),
            ]});
          })
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),

      // 4. ATTESTATION
      h2("4. Attestation de service fait"),
      p("Je soussignée atteste avoir réalisé les prestations décrites ci-dessus dans le cadre de ma mission de développement sur MonServiceSécurisé pour la période du 20 au 30 avril 2026."),
      new Paragraph({ children: [], spacing: { before: 120, after: 0 } }),

      new Table({
        width: { size: 9906, type: WidthType.DXA },
        columnWidths: [4953, 4953],
        rows: [
          new TableRow({ children: [boldCell("Fait par le prestataire", headerColor), boldCell("Validation commanditaire", headerColor)] }),
          new TableRow({ children: [
            cell([
              new Paragraph({ children: [new TextRun({ text: "Nom : Stéfanie Loiseleur", size: 20, font: "Arial" })], spacing: { before: 40, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: "Date : 30 avril 2026", size: 20, font: "Arial" })], spacing: { before: 20, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: "Signature :", size: 20, font: "Arial" })], spacing: { before: 20, after: 140 } }),
            ]),
            cell([
              new Paragraph({ children: [new TextRun({ text: "Nom : ____________________", size: 20, font: "Arial" })], spacing: { before: 40, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: "Date : ____________________", size: 20, font: "Arial" })], spacing: { before: 20, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: "Signature :", size: 20, font: "Arial" })], spacing: { before: 20, after: 140 } }),
            ]),
          ]})
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),
      new Paragraph({
        children: [new TextRun({ text: "Document généré le 30 avril 2026 — MonServiceSécurisé / ANSSI / BetaGouv", size: 16, color: "888888", font: "Arial" })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 0 }
      }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('/home/claude/CRA_MSS_20-30_avril_2026_Stefanie_Loiseleur.docx', buf);
  console.log('Done');
});
