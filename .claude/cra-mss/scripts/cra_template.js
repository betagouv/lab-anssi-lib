/**
 * cra_template.js — Template Node.js de génération DOCX pour le CRA MSS
 * Atelier Teinei / Stéfanie Loiseleur
 *
 * Usage : node cra_template.js /tmp/cra_payload.json
 *
 * Le payload JSON doit contenir :
 *   - prs           : liste de PRs enrichies (voir generer_cra.py)
 *   - date_debut    : string "1 avril 2026"
 *   - date_fin      : string "30 avril 2026"
 *   - mois_annee    : string "Avril 2026"
 *   - output_path   : chemin absolu du fichier .docx à créer
 */

'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
  VerticalAlign, LevelFormat, ExternalHyperlink, ImageRun,
} = require('docx');
const fs = require('fs');
const path = require('path');

// ─── Payload ────────────────────────────────────────────────────────────────
const payloadPath = process.argv[2];
if (!payloadPath) { console.error('Usage: node cra_template.js <payload.json>'); process.exit(1); }
const { prs, date_debut, date_fin, mois_annee, output_path } = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

// ─── Couleurs & helpers ──────────────────────────────────────────────────────
const BLEU_MARINE = '1F3864';  // header, fond en-tête document
const BLEU_MSS    = '0079D0';  // titres de section, en-têtes de tableaux
const BLEU_LIGHT  = 'D6EEFF';  // libellés table infos générales
const ZEBRE_A     = 'F2F7FC';
const VERT        = '1a6b2a';
const ORANGE      = '7B3F00';

const LOGO_PATH   = path.join(__dirname, 'logo_mss.png');
const logoData    = fs.readFileSync(LOGO_PATH);

const bord  = { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' };
const bords = { top: bord, bottom: bord, left: bord, right: bord };

function cell(children, opts = {}) {
  return new TableCell({
    borders: bords,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.fill ? { fill: opts.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 160, right: 160 },
    verticalAlign: VerticalAlign.CENTER,
    children,
  });
}

function hCell(text, fill = BLEU_MSS) {
  const darkFill = fill === BLEU_MARINE || fill === BLEU_MSS;
  return cell([new Paragraph({
    children: [new TextRun({ text, bold: true, color: darkFill ? 'FFFFFF' : BLEU_MSS, size: 20, font: 'Arial' })],
  })], { fill });
}

function tCell(text, fill, opts = {}) {
  return cell([new Paragraph({
    children: [new TextRun({ text: String(text), size: opts.size || 17, font: 'Arial',
      color: opts.color, bold: opts.bold })],
    spacing: { before: 30, after: 30 },
  })], fill ? { fill } : {});
}

function linkCell(text, url, fill) {
  return cell([new Paragraph({
    children: [new ExternalHyperlink({ link: url,
      children: [new TextRun({ text, style: 'Hyperlink', size: 17, font: 'Arial' })] })],
    spacing: { before: 30, after: 30 },
  })], fill ? { fill } : {});
}

function h2(text) {
  return new Paragraph({
    children: [new TextRun({ text, bold: true, size: 22, color: BLEU_MSS, font: 'Arial' })],
    spacing: { before: 240, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BLEU_MSS, space: 1 } },
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, size: opts.size || 20, font: 'Arial', color: opts.color })],
    spacing: { before: opts.before || 40, after: opts.after || 40 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.LEFT,
  });
}

// ─── Regroupement des PRs par chantier fonctionnel ──────────────────────────
// Heuristique simple basée sur les titres
function detecterChantier(pr) {
  const t = pr.titre.toLowerCase();
  if (t.includes('spa') || t.includes('homologuer') || t.includes('accueil') || t.includes('home'))
    return 'Migration SPA';
  if (t.includes('renovation') || t.includes('renovate') || t.includes('dependabot') || t.includes('bump'))
    return 'Maintenance & qualité';
  if (t.includes('[correction]') || t.includes('fix') || t.includes('bug') || t.includes('css') || t.includes('typo'))
    return 'Corrections & bugfixes';
  if (t.includes('accessib') || t.includes('a11y') || t.includes('axe'))
    return 'Accessibilité';
  return 'Autres développements';
}

// ─── Construction du document ────────────────────────────────────────────────

// PRs triées par numéro croissant
const prsTries = [...prs].sort((a, b) => parseInt(a.numero) - parseInt(b.numero));

// Descriptions fonctionnelles par chantier
const DESC_CHANTIERS = {
  'Migration SPA':        'Migration progressive de l\'application vers une Single Page Application en Svelte 5 — refonte des pages de service, d\'accueil et du parcours d\'homologation pour offrir une navigation fluide côté client.',
  'Maintenance & qualité':'Mise à jour régulière des dépendances (TypeScript, ESLint, Svelte, Vite, pnpm, GitHub Actions…) afin de maintenir la sécurité, la compatibilité et la qualité du projet.',
  'Corrections & bugfixes':'Résolution de régressions et de comportements inattendus : CSS, droits d\'accès, paramètres de navigation, typos et logique d\'affichage.',
  'Accessibilité':         'Vérifications et corrections d\'accessibilité à l\'aide d\'outils automatisés (axe-core, Playwright) pour garantir la conformité RGAA.',
  'Autres développements': 'Développements fonctionnels divers ne relevant pas des chantiers principaux.',
};

const chantiers = {};
for (const pr of prsTries) {
  const c = detecterChantier(pr);
  if (!chantiers[c]) chantiers[c] = [];
  chantiers[c].push(pr);
}

const lignesChantiers = Object.entries(chantiers).map(([nom, liste], i) => {
  const fill = i % 2 === 0 ? ZEBRE_A : 'FFFFFF';
  const refs = liste.map(p => p.numero).join(', ');
  const desc = DESC_CHANTIERS[nom] || liste.map(p => p.titre.replace(/^\[.*?\]\s*/, '')).join(', ');
  return new TableRow({ children: [
    cell([new Paragraph({ children: [new TextRun({ text: nom, bold: true, size: 19, font: 'Arial', color: BLEU_MSS })], spacing: { before: 40, after: 40 } })], { fill }),
    cell([new Paragraph({ children: [new TextRun({ text: refs, size: 18, font: 'Arial' })], spacing: { before: 40, after: 40 } })], { fill }),
    cell([new Paragraph({ children: [new TextRun({ text: desc, size: 17, font: 'Arial' })], spacing: { before: 40, after: 40 } })], { fill }),
  ]});
});

const lignesPRs = prsTries.map((pr, i) => {
  const fill = i % 2 === 0 ? ZEBRE_A : 'FFFFFF';
  const statusColor = pr.statut === 'Mergée' ? VERT : ORANGE;
  const n = pr.n_commits_nephtys;
  const t = pr.n_commits_total;
  const detail = n > 0
    ? `${n} commit${n > 1 ? 's' : ''} sur ${t}`
    : `Relecture${pr.auteur_pr && pr.auteur_pr !== 'Stéfanie' ? ` (PR de ${pr.auteur_pr})` : ''}`;
  return new TableRow({ children: [
    linkCell(pr.numero, pr.url, fill),
    tCell(pr.titre, fill),
    tCell(pr.statut, fill, { color: statusColor, bold: true }),
    tCell(pr.role, fill),
    tCell(detail, fill, { size: 16 }),
  ]});
});

const doc = new Document({
  numbering: { config: [{ reference: 'bullets', levels: [{
    level: 0, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 540, hanging: 260 } } }
  }] }] },
  styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, right: 1000, bottom: 1134, left: 1000 },
      }
    },
    children: [
      // ── En-tête : logo à gauche, titre + dates à droite ──
      new Table({
        width: { size: 9906, type: WidthType.DXA },
        columnWidths: [2200, 7706],
        borders: {
          top:    { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left:   { style: BorderStyle.NONE },
          right:  { style: BorderStyle.NONE },
          insideH: { style: BorderStyle.NONE },
          insideV: { style: BorderStyle.NONE },
        },
        rows: [new TableRow({ children: [
          // Colonne logo
          new TableCell({
            shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                       left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            verticalAlign: VerticalAlign.CENTER,
            children: [new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new ImageRun({
                data: logoData,
                transformation: { width: 130, height: 46 },
              })],
            })],
          }),
          // Colonne titre + dates
          new TableCell({
            shading: { fill: BLEU_MSS, type: ShadingType.CLEAR },
            borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE },
                       left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } },
            margins: { top: 160, bottom: 160, left: 300, right: 300 },
            verticalAlign: VerticalAlign.CENTER,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "COMPTE RENDU D'ACTIVITÉ", bold: true, size: 36, color: 'FFFFFF', font: 'Arial' })],
                spacing: { before: 0, after: 60 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: `${date_debut} – ${date_fin}`, size: 24, color: 'FFFFFF', font: 'Arial', italics: true })],
                spacing: { before: 0, after: 0 },
              }),
            ],
          }),
        ]})],
      }),

      new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),

      // ── 1. Infos générales ──
      h2('1. Informations générales'),
      new Table({
        width: { size: 9906, type: WidthType.DXA }, columnWidths: [2800, 7106],
        rows: [
          new TableRow({ children: [hCell('Prestataire', BLEU_LIGHT), tCell('Stéfanie Loiseleur', null, { size: 20 })] }),
          new TableRow({ children: [hCell('Entreprise', BLEU_LIGHT), tCell('Atelier Teinei', null, { size: 20 })] }),
          new TableRow({ children: [hCell('Handle GitHub', BLEU_LIGHT),
            cell([new Paragraph({ children: [new ExternalHyperlink({ link: 'https://github.com/Nephtys',
              children: [new TextRun({ text: 'Nephtys (github.com/Nephtys)', style: 'Hyperlink', size: 20, font: 'Arial' })] })] })]) ] }),
          new TableRow({ children: [hCell('Projet', BLEU_LIGHT),
            cell([new Paragraph({ children: [new ExternalHyperlink({ link: 'https://github.com/betagouv/mon-service-securise',
              children: [new TextRun({ text: 'betagouv/mon-service-securise', style: 'Hyperlink', size: 20, font: 'Arial' })] })] })]) ] }),
          new TableRow({ children: [hCell('Période couverte', BLEU_LIGHT), tCell(`${date_debut} – ${date_fin}`, null, { size: 20 })] }),
          new TableRow({ children: [hCell("Date d'établissement", BLEU_LIGHT), tCell(date_fin, null, { size: 20 })] }),
          new TableRow({ children: [hCell('Nature de la prestation', BLEU_LIGHT), tCell('Développement full-stack — Node.js / Svelte 5 / TypeScript / PostgreSQL', null, { size: 20 })] }),
          new TableRow({ children: [hCell('Modalité de travail', BLEU_LIGHT), tCell('Pair programming — contributions incluant des commits co-signés sur des PRs ouvertes par d\'autres membres', null, { size: 20 })] }),
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),

      // ── 2. Synthèse par chantier ──
      h2('2. Synthèse des travaux réalisés'),
      new Table({
        width: { size: 9906, type: WidthType.DXA }, columnWidths: [2800, 1800, 5306],
        rows: [
          new TableRow({ children: [hCell('Chantier'), hCell('PRs'), hCell('Description synthétique')] }),
          ...lignesChantiers,
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),

      // ── 3. Détail des PRs ──
      h2('3. Détail des Pull Requests et contributions'),
      new Table({
        width: { size: 9906, type: WidthType.DXA }, columnWidths: [800, 3800, 850, 1400, 3056],
        rows: [
          new TableRow({ children: [hCell('PR'), hCell('Titre'), hCell('Statut'), hCell('Rôle'), hCell('Détail')] }),
          ...lignesPRs,
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 240, after: 0 } }),

      // ── 4. Attestation ──
      h2('4. Attestation de service fait'),
      p("Je soussignée atteste avoir réalisé les prestations décrites ci-dessus dans le cadre de ma mission de développement sur MonServiceSécurisé."),
      new Paragraph({ children: [], spacing: { before: 120, after: 0 } }),
      new Table({
        width: { size: 9906, type: WidthType.DXA }, columnWidths: [4953, 4953],
        rows: [
          new TableRow({ children: [hCell('Fait par le prestataire'), hCell('Validation commanditaire')] }),
          new TableRow({ children: [
            cell([
              new Paragraph({ children: [new TextRun({ text: 'Nom : Stéfanie Loiseleur', size: 20, font: 'Arial' })], spacing: { before: 40, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: `Date : ${date_fin}`, size: 20, font: 'Arial' })], spacing: { before: 20, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: 'Signature :', size: 20, font: 'Arial' })], spacing: { before: 20, after: 140 } }),
            ]),
            cell([
              new Paragraph({ children: [new TextRun({ text: 'Nom : ____________________', size: 20, font: 'Arial' })], spacing: { before: 40, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: 'Date : ____________________', size: 20, font: 'Arial' })], spacing: { before: 20, after: 20 } }),
              new Paragraph({ children: [new TextRun({ text: 'Signature :', size: 20, font: 'Arial' })], spacing: { before: 20, after: 140 } }),
            ]),
          ]})
        ]
      }),

      new Paragraph({ children: [], spacing: { before: 200, after: 0 } }),
      p(`Document généré automatiquement le ${date_fin} — MonServiceSécurisé / ANSSI / BetaGouv`, { size: 16, color: '888888', center: true }),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(output_path, buf);
  console.log(`OK: ${output_path}`);
}).catch(err => {
  console.error('ERREUR:', err);
  process.exit(1);
});
