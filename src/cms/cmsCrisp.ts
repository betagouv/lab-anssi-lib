import {
  AdaptateurCmsCrisp,
  ResumeArticleCrisp,
  SectionCrisp,
} from './adaptateurCmsCrisp';
import CrispMarkdown from './crispMarkdown';
import { ErreurArticleCrispIntrouvable } from '../erreurs';

export type PageHtmlCrisp = {
  titre: string;
  contenu: string | null;
  description: string;
  tableDesMatieres: any[];
};

type ArticleMarkdownCrispAvecSection = {
  titre: string;
  contenuMarkdown: string;
  description: string;
  section: {
    id?: string;
    nom?: string;
  };
};

type ResumeArticleCrispAvecSlug = ResumeArticleCrisp & { slug: string | null };

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

  async recupereArticleCategorie(
    slug: string,
    idCategorie: string
  ): Promise<ArticleMarkdownCrispAvecSection> {
    const articles =
      await this.adaptateurCmsCrisp.recupereArticlesCategorie(idCategorie);
    const article = articles.find((a) => this.extraitSlugArticle(a) === slug);
    if (!article) {
      throw new ErreurArticleCrispIntrouvable();
    }
    const articleCrisp = await this.adaptateurCmsCrisp.recupereArticle(
      article.id
    );
    return {
      ...articleCrisp,
      section: { id: article.section.id, nom: article.section.nom },
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
    const articles =
      await this.adaptateurCmsCrisp.recupereArticlesCategorie(idCategorie);
    return articles.map((article) => {
      const slug = this.extraitSlugArticle(article);
      return { ...article, slug: slug || null };
    });
  }

  private extraitSlugArticle(article: ResumeArticleCrisp) {
    try {
      const regex = /\/article\/(.*)-[a-zA-Z0-9]{1,10}\//gm;
      return regex.exec(article.url)?.[1];
    } catch (e) {
      return null;
    }
  }
}
