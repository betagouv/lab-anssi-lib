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
  chemin: string;
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

  recupereArticleParChemin = async (
    chemin: string
  ): Promise<ArticleMarkdownCrisp> => {
    const reponseMetadata = await axios.get<{
      data: { title: string; description: string | null };
    }>(
      `${this.urlBase}helpdesk/tree/metadata/fr/articles/${chemin}`,
      this.enteteCrisp
    );
    const reponseContenu = await axios.get<{ data: { content: string } }>(
      `${this.urlBase}helpdesk/tree/content/fr/articles/${chemin}`,
      this.enteteCrisp
    );
    const { description, title } = reponseMetadata.data.data;
    return {
      contenuMarkdown: reponseContenu.data.data.content,
      titre: title,
      description: description ?? '',
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
          .map((a) => ({
            estPublie: a.state.published,
            slug: a.slug,
            titre: a.title,
            section,
            chemin: `${chemin}/${a.slug}`,
          })),
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
