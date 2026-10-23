import axios, { HttpStatusCode } from 'axios';
import { SectionCrisp } from './types';

export type ArticleMarkdownCrisp = {
  titre: string;
  contenuMarkdown: string;
  description: string;
  datePublication?: string;
  dateMiseAJour?: string;
};

type ArticleMarkdownAPI = {
  data: {
    content: string;
    title: string;
    description: string;
    created_at?: number;
    updated_at?: number;
    published_at?: number;
  };
};

const enISO = (epochMillisecondes?: number): string | undefined =>
  epochMillisecondes ? new Date(epochMillisecondes).toISOString() : undefined;

export type ResumeArticleCrisp = {
  estPublie: boolean;
  slug: string;
  titre: string;
  section?: {
    id: string;
    nom: string;
  };
};

export type ResumesArticlesAPI = {
  data: {
    type: 'file' | 'directory';
    slug: string;
    title: string;
    state: {
      published: boolean;
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
    const datePublication = enISO(
      donnees.data.published_at ?? donnees.data.created_at
    );
    const dateMiseAJour = enISO(donnees.data.updated_at);
    return {
      contenuMarkdown: donnees.data.content,
      titre: donnees.data.title,
      description: donnees.data.description,
      ...(datePublication ? { datePublication } : {}),
      ...(dateMiseAJour ? { dateMiseAJour } : {}),
    };
  };

  recupereArticlesParChemin = async (
    chemin: string
  ): Promise<ResumeArticleCrisp[]> => {
    return await this.recupereArticleParCheminRecursivement(chemin);
  };

  recupereSectionsCategorie = async (
    idCategorie: string
  ): Promise<SectionCrisp[]> => {
    const params = new URLSearchParams({
      sub_path: idCategorie,
    });
    let termine = false;
    let pageActuelle = 1;
    let donnees: SectionCrisp[] = [];
    while (!termine) {
      const reponse = await axios.get<ResumesArticlesAPI>(
        `${this.urlBase}helpdesk/tree/list/fr/articles/${pageActuelle}?${params}`,
        this.enteteCrisp
      );

      donnees = [
        ...donnees,
        ...reponse.data.data
          .filter((entité) => entité.type === 'directory')
          .map((a) => {
            return {
              id: a.slug,
              nom: a.title,
            };
          }),
      ];

      if (reponse.status !== HttpStatusCode.PartialContent) termine = true;
      pageActuelle += 1;
    }
    return donnees;
  };

  private async recupereArticleParCheminRecursivement(
    chemin: string,
    section?: { id: string; nom: string }
  ) {
    const params = new URLSearchParams({
      sub_path: chemin,
    });

    let termine = false;
    let pageActuelle = 1;
    let donnees: ResumeArticleCrisp[] = [];
    while (!termine) {
      const reponse = await axios.get<ResumesArticlesAPI>(
        `${this.urlBase}helpdesk/tree/list/fr/articles/${pageActuelle}?${params}`,
        this.enteteCrisp
      );

      donnees = [
        ...donnees,
        ...reponse.data.data
          .filter((entité) => entité.type === 'file')
          .map((a) => {
            return {
              estPublie: a.state.published,
              slug: a.slug,
              titre: a.title,
              section,
            };
          }),
      ];

      const sousArticles = await Promise.all(
        reponse.data.data
          .filter((entité) => entité.type === 'directory')
          .map((dossier) =>
            this.recupereArticleParCheminRecursivement(
              chemin + '/' + dossier.slug,
              {
                id: dossier.slug,
                nom: dossier.title,
              }
            )
          )
      );

      donnees = donnees.concat(sousArticles.flat());

      if (reponse.status !== HttpStatusCode.PartialContent) termine = true;
      pageActuelle += 1;
    }

    return donnees;
  }
}
