import { ErreurArticleCrispIntrouvable } from '../erreurs';
import { AdaptateurCmsCrisp, ResumeArticleCrisp } from './adaptateurCmsCrisp';
import { fabriqueAdaptateurHttp } from './adaptateurHttp';
import CrispMarkdown from './crispMarkdown';
import {
  ArticleCrispAvecSection,
  PageHtmlCrisp,
  ResumeArticleCrispAvecSlug,
  SectionCrisp,
} from './types';

export class CmsCrisp {
  adaptateurCmsCrisp: AdaptateurCmsCrisp;
  constructeurCrispMarkdown: (contenuMarkdown: string) => CrispMarkdown;

  constructor(idSite: string, cleApi: string) {
    this.adaptateurCmsCrisp = new AdaptateurCmsCrisp(idSite, cleApi);
    this.constructeurCrispMarkdown = (contenuMarkdown: string) =>
      new CrispMarkdown(contenuMarkdown, fabriqueAdaptateurHttp());
  }

  async recupereArticle(id: string): Promise<PageHtmlCrisp> {
    const article = await this.adaptateurCmsCrisp.recupereArticle(id);
    const {
      titre,
      contenuMarkdown,
      description,
      datePublication,
      dateMiseAJour,
    } = article;
    let crispMarkdown = this.constructeurCrispMarkdown(contenuMarkdown);
    return {
      titre,
      contenu: await crispMarkdown.versHTML(),
      description,
      tableDesMatieres: await crispMarkdown.tableDesMatieres(),
      ...(datePublication ? { datePublication } : {}),
      ...(dateMiseAJour ? { dateMiseAJour } : {}),
    };
  }

  async recupereArticleCategorie(
    slug: string,
    idCategorie: string
  ): Promise<ArticleCrispAvecSection> {
    const articles =
      await this.adaptateurCmsCrisp.recupereArticlesParChemin(idCategorie);
    const article = articles.find((a) => a.slug === slug);
    if (!article) {
      throw new ErreurArticleCrispIntrouvable();
    }
    const articleCrisp = await this.recupereArticle(article.slug);
    return {
      ...articleCrisp,
      section: { id: article.section?.id, nom: article.section?.nom },
    };
  }

  async recupereSectionsCategorie(
    idCategorie: string
  ): Promise<SectionCrisp[]> {
    return this.adaptateurCmsCrisp.recupereSectionsCategorie(idCategorie);
  }

  async recupereArticlesCategorie(
    idCategorie: string
  ): Promise<ResumeArticleCrispAvecSlug[]> {
    return await this.adaptateurCmsCrisp.recupereArticlesParChemin(idCategorie);
  }
}
