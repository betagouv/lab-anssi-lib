import axios from "axios";

export type ArticleMarkdownCrisp = {
  titre: string;
  contenuMarkdown: string;
  description: string;
};

export class AdaptateurCmsCrisp {
  readonly urlBase: string;
  readonly enteteCrisp: { headers: { [cle: string]: string }};

  constructor(idSite: string, cleApi: string) {
    this.urlBase = `https://api.crisp.chat/v1/website/${idSite}/`;
    this.enteteCrisp = {
      headers: {
        Authorization: `Basic ${btoa(cleApi)}`,
        'X-Crisp-Tier': 'plugin',
      }
    };
  }

  recupereArticle = async (
    idArticle: string
  ): Promise<ArticleMarkdownCrisp> => {
    const reponse = await axios.get(
      `${this.urlBase}helpdesk/locale/fr/article/${idArticle}`,
      this.enteteCrisp
    );
    const donnees = reponse.data;
    return {
      contenuMarkdown: donnees.data.content,
      titre: donnees.data.title,
      description: donnees.data.description,
    };
  };
}
