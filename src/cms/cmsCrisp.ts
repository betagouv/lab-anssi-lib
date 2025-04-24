import { AdaptateurCmsCrisp } from './adaptateurCmsCrisp';
import CrispMarkdown from './crispMarkdown';

export type PageHtmlCrisp = {
  titre: string;
  contenu: string | null;
  description: string;
  tableDesMatieres: any[];
};

export class CmsCrisp {
  adaptateurCmsCrisp: AdaptateurCmsCrisp;
  constructeurCrispMarkdown: (contenuMarkdown: string) => CrispMarkdown;

  constructor(idSite: string, cleApi: string) {
    this.adaptateurCmsCrisp = new AdaptateurCmsCrisp(idSite, cleApi);
    this.constructeurCrispMarkdown = (contenuMarkdown: string) =>
      new CrispMarkdown(contenuMarkdown);
  }

  async recupereArticle(id: string): Promise<PageHtmlCrisp> {
    const article = await this.adaptateurCmsCrisp.recupereArticle(id);
    const { titre, contenuMarkdown, description } = article;
    let crispMarkdown = this.constructeurCrispMarkdown(contenuMarkdown);
    return {
      titre,
      contenu: crispMarkdown.versHTML(),
      description,
      tableDesMatieres: crispMarkdown.tableDesMatieres(),
    };
  }
}
