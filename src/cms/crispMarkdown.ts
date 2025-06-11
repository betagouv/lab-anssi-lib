import { Lexer, Marked, Parser, RendererObject, Tokens } from 'marked';
import { EntreeTableDesMatieres } from './types';

const extensionBoite = (regex: RegExp, nom: string, classe: string) => ({
  name: nom,
  level: 'block',
  start(src: string) {
    return src.match(regex)?.index;
  },
  tokenizer(this: { lexer: Lexer }, src: string) {
    const match = regex.exec(src);
    if (match) {
      const token = {
        type: nom,
        raw: match[0],
        text: match[1].trim(),
        tokens: [],
      };
      this.lexer.inline(token.text, token.tokens);
      return token;
    }
    return false;
  },
  renderer(this: { parser: Parser }, token: Tokens.Generic) {
    return `<div class='${classe}'>${this.parser.parseInline(
      token.tokens!
    )}</div>`;
  },
});

class CrispMarkdown {
  private contenuHTML: string | null = null;
  private aDejaParse: boolean = false;
  private tdm: EntreeTableDesMatieres[] = [];
  private marked: Marked;

  constructor(private contenuMarkdown: string) {
    const boiteAide = extensionBoite(/^\|([^|\n]+)/, 'boiteAide', 'aide');
    const boiteInfo = extensionBoite(
      /^\|\|([^||\n]+)/,
      'boiteInfo',
      'information'
    );
    const boiteAlerte = extensionBoite(
      /^\|\|\|([^|||\n]+)/,
      'boiteAlerte',
      'alerte'
    );

    const regexVideo = /^\${frame}\[(.*)\]\((.*)\)\n/;
    const video = {
      name: 'video',
      level: 'block',
      start(src: string) {
        return src.match(regexVideo)?.index;
      },
      tokenizer(src: string) {
        const match = regexVideo.exec(src);
        if (match) {
          return {
            type: 'video',
            raw: match[0],
            text: match[2].trim(),
            legende: match[1].trim(),
            tokens: [],
          };
        }
        return false;
      },
      renderer(token: Tokens.Generic) {
        return `<div class='conteneur-video'><video src='${token.text}' controls></video><p class='legende'>${token.legende}</p></div>`;
      },
    };

    // Source d'inspiration pour la gestion des sections :
    // https://github.com/markedjs/marked/discussions/2889
    let niveauDeSection = 0;
    const sectionRegexp = new RegExp(`^(# )[^]*?(?:\\n(?=\\1)|$)`);

    const section = {
      name: 'sectionBlock',
      level: 'block',
      start(source: string) {
        return source.match(/^#/m)?.index;
      },
      tokenizer(this: { lexer: Lexer }, source: string) {
        if (niveauDeSection > 0) return;
        const match = source.match(sectionRegexp);
        if (!match) {
          return;
        }

        niveauDeSection++;
        const tokens = this.lexer.blockTokens(match[0]);
        niveauDeSection--;

        return {
          type: 'sectionBlock',
          raw: match[0],
          level: 1,
          tokens,
        };
      },
      renderer(this: { parser: Parser }, token: Tokens.Generic) {
        return `<section>${this.parser.parse(token.tokens!)}</section>`;
      },
    };

    const moteurDeRendu = (that: CrispMarkdown): RendererObject => ({
      heading(this: RendererObject, ...[texte, profondeur]: any[]) {
        const slugDuTitre = texte.toLowerCase().replace(/\W+/g, '-');
        const profondeurAjustee = Math.min(Math.max(profondeur + 1, 2), 4);
        that.tdm.push({
          profondeur: profondeurAjustee,
          texte,
          id: slugDuTitre,
        });

        return `<h${profondeurAjustee} id='${slugDuTitre}'>${texte}</h${profondeurAjustee}>`;
      },
      link(this: RendererObject, ...[lien, _, texte]: any[]) {
        if (texte.includes('Télécharger'))
          return `<a href='${lien}' class='telechargement' target='_blank' rel='noreferrer nofollow'>${texte}</a>`;
        return `<a href='${lien}' target='_blank' rel='nofollow'>${texte}</a>`;
      },
    });

    this.marked = new Marked({
      renderer: moteurDeRendu(this),
      extensions: [boiteAide, boiteInfo, boiteAlerte, video, section],
    })
  }

  parseLeMarkdown() {
    const avecCorrectionLigneHorizontale = this.contenuMarkdown.replaceAll("\n---", "\n\n---");
    this.contenuHTML = this.marked.parse(avecCorrectionLigneHorizontale) as string;
    this.aDejaParse = true;
  }

  versHTML() {
    if (!this.aDejaParse) this.parseLeMarkdown();
    return this.contenuHTML;
  }

  tableDesMatieres() {
    if (!this.aDejaParse) this.parseLeMarkdown();
    return this.tdm;
  }
}

export default CrispMarkdown;
