import assert from 'assert';
import { beforeEach, describe, it } from 'node:test';
import { EntreeTableDesMatieres, ResumeArticleCrispAvecSlug } from '../../src';
import { CmsCrisp } from '../../src/cms/cmsCrisp';
import CrispMarkdown from '../../src/cms/crispMarkdown';
import { ErreurArticleCrispIntrouvable } from '../../src/erreurs';

class MockCrispMarkdown extends CrispMarkdown {
  constructor(private contenu: string) {
    super(contenu, { ressourceExiste: async () => true });
  }

  versHTML = async () => this.contenu + '-en-html';
  tableDesMatieres = async () =>
    this.contenu.split(';') as unknown as EntreeTableDesMatieres[];
}

describe('Le CMS Crisp', () => {
  const donneesParDefautAdaptateur = {
    contenuMarkdown: '',
    titre: '',
    description: '',
  };

  it('construit un adaptateur cms', () => {
    const cmsCrisp = new CmsCrisp('id-site', 'cle-api');

    const adaptateurCmsCrisp = cmsCrisp.adaptateurCmsCrisp;

    assert.notEqual(adaptateurCmsCrisp, undefined);
    assert.equal(
      adaptateurCmsCrisp.urlBase,
      `https://api.crisp.chat/v1/website/id-site/`
    );
    assert.equal(
      adaptateurCmsCrisp.enteteCrisp.headers['Authorization'],
      'Basic Y2xlLWFwaQ=='
    );
  });

  describe("sur demande de récupération d'article", () => {
    let cmsCrisp: CmsCrisp;
    beforeEach(() => {
      cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async (
        _: string
      ) => donneesParDefautAdaptateur;
    });

    it('récupère le titre et la description', async () => {
      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async (
        id: string
      ) =>
        id === '23'
          ? {
              contenuMarkdown: '',
              titre: 'titre',
              description: 'description',
            }
          : donneesParDefautAdaptateur;

      const article = await cmsCrisp.recupereArticle('23');

      assert.equal(article.titre, 'titre');
      assert.equal(article.description, 'description');
    });

    it('transmet les dates de publication et de mise à jour', async () => {
      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async () => ({
        contenuMarkdown: '',
        titre: 'titre',
        description: 'description',
        datePublication: '2024-01-01T00:00:00.000Z',
        dateMiseAJour: '2024-02-01T00:00:00.000Z',
      });

      const article = await cmsCrisp.recupereArticle('23');

      assert.equal(article.datePublication, '2024-01-01T00:00:00.000Z');
      assert.equal(article.dateMiseAJour, '2024-02-01T00:00:00.000Z');
    });

    it('récupère le markdown converti en html', async () => {
      cmsCrisp.constructeurCrispMarkdown = (contenuMarkdown) =>
        new MockCrispMarkdown(contenuMarkdown);

      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async (
        _: string
      ) => ({
        contenuMarkdown: 'contenu markdown',
        titre: '',
        description: '',
      });

      const article = await cmsCrisp.recupereArticle('23');

      assert.equal(article.contenu, 'contenu markdown-en-html');
    });

    it('récupère la table des matières', async () => {
      cmsCrisp.constructeurCrispMarkdown = (contenuMarkdown) =>
        new MockCrispMarkdown(contenuMarkdown);

      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async (
        _: string
      ) => ({
        contenuMarkdown: 'Partie 1;Partie 2',
        titre: 'titre',
        description: 'description',
      });

      const article = await cmsCrisp.recupereArticle('23');

      assert.deepEqual(article.tableDesMatieres, ['Partie 1', 'Partie 2']);
    });
  });

  describe("sur demande d'un article d'une catégorie ", () => {
    let cmsCrisp: CmsCrisp;
    beforeEach(() => {
      cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async (
        _: string
      ) => donneesParDefautAdaptateur;
    });

    it("récupère l'article selon son slug", async () => {
      let cheminPasse;
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesParChemin = async (
        chemin
      ) => {
        cheminPasse = chemin;
        return [
          {
            chemin: 'un-slug',
            estPublie: true,
            slug: 'un-slug',
            titre: 'Un titre',
            section: { id: 'id_1', nom: 'uneSection' },
          },
          {
            chemin: 'un-autre-slug',
            estPublie: true,
            slug: 'un-autre-slug',
            titre: 'Un Deuxième titre',
            section: { id: 'id_2', nom: 'uneAutreSection' },
          },
        ];
      };
      let idPasse;
      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async (
        idArticle
      ) => {
        idPasse = idArticle;
        return donneesParDefautAdaptateur;
      };

      await cmsCrisp.recupereArticleCategorie('un-slug', 'UneCategorie');

      assert.equal(idPasse, 'un-slug');
      assert.equal(cheminPasse, 'UneCategorie');
    });

    it('retourne une erreur si aucun article ne correspond au slug', async () => {
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesParChemin = async () => [
        {
          chemin: 'un-slug',
          estPublie: true,
          slug: 'un-slug',
          titre: 'Un Titre',
        },
      ];

      await assert.rejects(
        cmsCrisp.recupereArticleCategorie(
          'un-slug-introuvable',
          'UneCategorie'
        ),
        ErreurArticleCrispIntrouvable
      );
    });

    it("retourne tout le contenu de l'article, en ajoutant les données de section", async () => {
      cmsCrisp.adaptateurCmsCrisp.recupereArticleParChemin = async () => ({
        contenuMarkdown: '# Un contenu',
        titre: 'Un titre',
        description: 'Une description',
      });
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesParChemin = async () => [
        {
          chemin: 'un-slug',
          estPublie: true,
          slug: 'un-slug',
          titre: 'Un Titre',
          section: { id: 'id_1', nom: 'uneSection' },
        },
      ];

      const resultat = await cmsCrisp.recupereArticleCategorie(
        'un-slug',
        'UneCategorie'
      );

      assert.deepEqual(resultat, {
        titre: 'Un titre',
        contenu: "<section><h2 id='un-contenu'>Un contenu</h2></section>",
        description: 'Une description',
        tableDesMatieres: [
          { texte: 'Un contenu', id: 'un-contenu', profondeur: 2 },
        ],
        section: {
          id: 'id_1',
          nom: 'uneSection',
        },
      });
    });
  });

  describe("sur demande des sections d'une catégorie", () => {
    it("délègue à l'adaptateur la récupération des sections", async () => {
      const cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp.recupereSectionsCategorie = async (
        idCategorie
      ) => {
        return idCategorie === 'UneCategorie'
          ? [{ id: '1', nom: 'uneSection' }]
          : [];
      };

      const sections = await cmsCrisp.recupereSectionsCategorie('UneCategorie');

      assert.deepEqual(sections, [{ id: '1', nom: 'uneSection' }]);
    });
  });

  describe("sur demande des articles d'une catégorie", () => {
    it("délègue à l'adaptateur la récupération des articles", async () => {
      const cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesParChemin = async (
        chemin
      ) => {
        return chemin === 'UneCategorie'
          ? [
              {
                chemin: 'un-slug',
                estPublie: true,
                slug: 'un-slug',
                titre: 'unArticle',
                section: { id: 'A', nom: 'uneSection' },
              },
            ]
          : [];
      };

      const articles = await cmsCrisp.recupereArticlesCategorie('UneCategorie');

      assert.deepEqual(articles, [
        {
          chemin: 'un-slug',
          estPublie: true,
          slug: 'un-slug',
          titre: 'unArticle',
          section: { id: 'A', nom: 'uneSection' },
        },
      ] satisfies ResumeArticleCrispAvecSlug[]);
    });
  });
});
