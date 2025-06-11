import { ResumeArticleCrisp } from './adaptateurCmsCrisp';

export type EntreeTableDesMatieres = {
  id: string;
  texte: string;
  profondeur: number;
};

export type PageHtmlCrisp = {
  titre: string;
  contenu: string | null;
  description: string;
  tableDesMatieres: EntreeTableDesMatieres[];
};

export type ResumeArticleCrispAvecSlug = ResumeArticleCrisp & {
  slug: string | null;
};

export type SectionCrisp = {
  id: string;
  nom: string;
};

export type ArticleCrispAvecSection = PageHtmlCrisp & {
  section: Partial<SectionCrisp>;
};
