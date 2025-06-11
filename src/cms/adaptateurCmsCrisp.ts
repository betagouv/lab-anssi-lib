import axios, { HttpStatusCode } from 'axios';
import { SectionCrisp } from './types';

export type ArticleMarkdownCrisp = {
  titre: string;
  contenuMarkdown: string;
  description: string;
};

type ArticleMarkdownAPI = {
  data: {
    content: string;
    title: string;
    description: string;
  };
};

export type ResumeArticleCrisp = {
  id: string;
  url: string;
  titre: string;
  section: {
    id?: string;
    nom?: string;
  };
};

type ResumesArticlesAPI = {
  data: {
    article_id: string;
    url: string;
    title: string;
    category?: {
      section?: {
        section_id: string;
        name: string;
      };
    };
  }[];
};

type SectionsAPI = {
  data: {
    section_id: string;
    name: string;
  }[];
};

export class AdaptateurCmsCrisp {
  readonly urlBase: string;
  readonly enteteCrisp: { headers: { [cle: string]: string } };

  constructor(idSite: string, cleApi: string) {
    this.urlBase = `https://api.crisp.chat/v1/website/${idSite}/`;
    this.enteteCrisp = {
      headers: {
        Authorization: `Basic ${btoa(cleApi)}`,
        'X-Crisp-Tier': 'plugin',
      },
    };
  }

  recupereArticle = async (
    idArticle: string
  ): Promise<ArticleMarkdownCrisp> => {
    const reponse = await axios.get<ArticleMarkdownAPI>(
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

  recupereArticlesCategorie = async (
    idCategorie: string
  ): Promise<ResumeArticleCrisp[]> => {
    const params = new URLSearchParams({
      filter_category_id: idCategorie,
    });

    let termine = false;
    let pageActuelle = 1;
    let donnees: ResumeArticleCrisp[] = [];
    while (!termine) {
      const reponse = await axios.get<ResumesArticlesAPI>(
        `${this.urlBase}helpdesk/locale/fr/articles/${pageActuelle}?${params}`,
        this.enteteCrisp
      );

      donnees = [
        ...donnees,
        ...reponse.data.data.map((a) => ({
          id: a.article_id,
          url: a.url,
          titre: a.title,
          section: {
            id: a.category?.section?.section_id,
            nom: a.category?.section?.name,
          },
        })),
      ];

      if (reponse.status !== HttpStatusCode.PartialContent) termine = true;
      pageActuelle += 1;
    }

    return donnees;
  };

  recupereSectionsCategorie = async (
    idCategorie: string
  ): Promise<SectionCrisp[]> => {
    const reponse = await axios.get<SectionsAPI>(
      `${this.urlBase}helpdesk/locale/fr/category/${idCategorie}/sections/0`,
      this.enteteCrisp
    );

    return reponse.data.data.map((section) => ({
      id: section.section_id,
      nom: section.name,
    }));
  };
}
