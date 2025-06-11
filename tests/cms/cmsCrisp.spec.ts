import { beforeEach, describe, it } from 'node:test';
import { CmsCrisp } from '../../src/cms/cmsCrisp';
import assert from 'assert';
import CrispMarkdown from '../../src/cms/crispMarkdown';
import { ErreurArticleCrispIntrouvable } from '../../src/erreurs';

class MockCrispMarkdown extends CrispMarkdown {
  constructor(private contenu: string) {
    super(contenu);
  }

  versHTML = () => this.contenu + '-en-html';
  tableDesMatieres = () => this.contenu.split(';');
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
      cmsCrisp.adaptateurCmsCrisp = {
        urlBase: '',
        enteteCrisp: { headers: {} },
        recupereArticle: async (_: string) => donneesParDefautAdaptateur,
        recupereArticlesCategorie: async (_: string) => [],
        recupereSectionsCategorie: async (_: string) => [],
      };
    });

    it('récupère le titre et la description', async () => {
      cmsCrisp.adaptateurCmsCrisp.recupereArticle = async (id: string) =>
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

    it('récupère le markdown converti en html', async () => {
      cmsCrisp.constructeurCrispMarkdown = (contenuMarkdown) =>
        new MockCrispMarkdown(contenuMarkdown);

      cmsCrisp.adaptateurCmsCrisp.recupereArticle = async (_: string) => ({
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

      cmsCrisp.adaptateurCmsCrisp.recupereArticle = async (_: string) => ({
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
      cmsCrisp.adaptateurCmsCrisp = {
        urlBase: '',
        enteteCrisp: { headers: {} },
        recupereArticle: async (_: string) => donneesParDefautAdaptateur,
        recupereArticlesCategorie: async (_: string) => [],
        recupereSectionsCategorie: async (_: string) => [],
      };
    });

    it("récupère l'article selon son slug", async () => {
      let categoriePassee;
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesCategorie = async (
        idCategorie
      ) => {
        categoriePassee = idCategorie;
        return [
          {
            id: '1',
            titre: 'Un titre',
            url: 'http://localhost://crisp/article/un-slug-1ab2c3/',
            section: {
              id: 'id_1',
              nom: 'uneSection',
            },
          },
          {
            id: '2',
            titre: 'Un Deuxième titre',
            url: 'http://localhost://crisp/article/un-autre-slug-1ab2c4/',
            section: {
              id: 'id_2',
              nom: 'uneAutreSection',
            },
          },
        ];
      };
      let idPasse;
      cmsCrisp.adaptateurCmsCrisp.recupereArticle = async (idArticle) => {
        idPasse = idArticle;
        return donneesParDefautAdaptateur;
      };

      await cmsCrisp.recupereArticleCategorie('un-slug', 'UneCategorie');

      assert.equal(idPasse, '1');
      assert.equal(categoriePassee, 'UneCategorie');
    });

    it('retourne une erreur si aucun article ne correspond au slug', async () => {
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesCategorie = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-1ab2c3/',
          titre: 'Un Titre',
          section: {},
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
      cmsCrisp.adaptateurCmsCrisp.recupereArticle = async () => ({
        contenuMarkdown: '# Un contenu',
        titre: 'Un titre',
        description: 'Une description',
      });
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesCategorie = async () => [
        {
          id: '1',
          url: 'http://localhost://crisp/article/un-slug-1ab2c3/',
          titre: 'Un Titre',
          section: {
            id: 'id_1',
            nom: 'uneSection',
          },
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
    it("délègue à l'adaptateur la récupération des articles et extrait le slug", async () => {
      const cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesCategorie = async (
        idCategorie
      ) => {
        return idCategorie === 'UneCategorie'
          ? [
              {
                id: '1',
                titre: 'unArticle',
                url: 'http://localhost/article/un-slug-abc123/',
                section: {
                  id: 'A',
                  nom: 'uneSection',
                },
              },
            ]
          : [];
      };

      const articles = await cmsCrisp.recupereArticlesCategorie('UneCategorie');

      assert.deepEqual(articles, [
        {
          id: 1,
          titre: 'unArticle',
          url: 'http://localhost/article/un-slug-abc123/',
          slug: 'un-slug',
          section: {
            id: 'A',
            nom: 'uneSection',
          },
        },
      ]);
    });

    it("reste robuste si l'url n'est pas définie", async () => {
      const cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp.recupereArticlesCategorie = async () => [
        {
          id: '1',
          url: '',
          titre: 'Un Titre',
          section: {},
        },
      ];

      const articles = await cmsCrisp.recupereArticlesCategorie('UneCategorie');

      assert.equal(articles[0].slug, null);
    });
  });
});
