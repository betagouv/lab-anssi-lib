export class AdaptateurCmsCrisp {
  private urlBase: string;
  private enteteCrisp: { [cle: string]: string };

  constructor(idSite: string, cleApi: string) {
    this.urlBase = `https://api.crisp.chat/v1/website/${idSite}/`;
    this.enteteCrisp = {
      Authorization: `Basic ${btoa(cleApi)}`,
      'X-Crisp-Tier': 'plugin',
    };
  }

  recupereArticle = async (idArticle: string) => {
    const reponse = await fetch(
      `${this.urlBase}helpdesk/locale/fr/article/${idArticle}`,
      {
        method: 'GET',
        headers: this.enteteCrisp,
      }
    );
    const donnees = await reponse.json();
    return {
      contenuMarkdown: donnees.data.content,
      titre: donnees.data.title,
      description: donnees.data.description,
    };
  };
}
