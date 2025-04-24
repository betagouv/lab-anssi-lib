import { Lexer, marked, Parser, RendererObject, Tokens } from 'marked';

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
  private tdm: any[] = [];

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

    marked.use({
      renderer: moteurDeRendu(this),
      extensions: [boiteAide, boiteInfo, boiteAlerte, video],
    });
  }

  parseLeMarkdown() {
    this.contenuHTML = marked.parse(this.contenuMarkdown) as string;
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
