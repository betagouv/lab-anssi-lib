import assert from 'assert';
import axios, { HttpStatusCode } from 'axios';
import { afterEach, beforeEach, describe, it, Mock } from 'node:test';
import {
  AdaptateurCmsCrisp,
  ResumesArticlesAPI,
} from '../../src/cms/adaptateurCmsCrisp';

describe("L'adaptateur CMS Crisp", () => {
  let mockAxiosGet: Mock<any>;

  beforeEach((contexte) => {
    if ('mock' in contexte) {
      mockAxiosGet = contexte.mock.method(axios, 'get', async () => ({}));
    }
  });

  afterEach((contexte) => {
    if ('mock' in contexte) {
      contexte.mock.reset();
    }
  });

  describe("sur récupération d'un article", () => {
    beforeEach(() => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: {
          data: {
            title: 'Un Titre',
            description: 'Une description',
            content: '# Un contenu markdown',
          },
        },
      }));
    });

    it('utilise Axios pour faire un appel API', async () => {
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      await adaptateurCmsCrisp.recupereArticle('ID_ARTICLE');

      assert.equal(mockAxiosGet.mock.callCount(), 1);
      const urlUtilisee = mockAxiosGet.mock.calls[0].arguments[0];
      const headerUtilise = mockAxiosGet.mock.calls[0].arguments[1]?.headers;
      assert.strictEqual(
        urlUtilisee,
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/locale/fr/article/ID_ARTICLE'
      );
      assert.deepEqual(headerUtilise, {
        'X-Crisp-Tier': 'plugin',
        Authorization: 'Basic Q0xFX0FQSQ==',
      });
    });

    it("retourne le contenu de l'article", async () => {
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse = await adaptateurCmsCrisp.recupereArticle('ID_ARTICLE');
      assert.equal(reponse.titre, 'Un Titre');
      assert.equal(reponse.description, 'Une description');
      assert.equal(reponse.contenuMarkdown, '# Un contenu markdown');
    });
  });

  describe("sur récupération de tous les articles d'un chemin", () => {
    let reponseAxios: ResumesArticlesAPI = {
      data: [
        {
          slug: 'SLUG_ARTICLE',
          state: {
            published: true,
          },
          title: 'TITRE_ARTICLE',
          type: 'file',
        },
        {
          slug: 'SLUG_SECTION',
          state: {
            published: true,
          },
          title: 'TITRE_SECTION',
          type: 'directory',
        },
      ],
    };

    it("utilise l'identifiant de la catégorie pour la requête", async () => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: reponseAxios,
        status: 200,
      }));
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: { data: [] },
        status: 200,
      }));
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');
      await adaptateurCmsCrisp.recupereArticlesParChemin('CHEMIN_CATEGORIE');

      const urlUtilisee = mockAxiosGet.mock.calls[0].arguments[0];
      assert.strictEqual(
        urlUtilisee,
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/tree/list/fr/articles/1?sub_path=CHEMIN_CATEGORIE'
      );
    });

    it('retourne le resumé des articles', async () => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: {
          data: [
            {
              slug: 'SLUG_ARTICLE',
              state: {
                published: true,
              },
              title: 'TITRE_ARTICLE',
              type: 'file',
            },
          ],
        },
        status: 200,
      }));

      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse =
        await adaptateurCmsCrisp.recupereArticlesParChemin('CHEMIN_CATEGORIE');
      assert.equal(reponse[0].estPublie, true);
      assert.equal(reponse[0].slug, 'SLUG_ARTICLE');
      assert.equal(reponse[0].titre, 'TITRE_ARTICLE');
    });

    it('aggrège les articles paginés', async () => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: {
          data: [
            {
              slug: 'SLUG_ARTICLE',
              state: {
                published: true,
              },
              title: 'TITRE_ARTICLE',
              type: 'file',
            },
          ],
        },
        status: HttpStatusCode.PartialContent,
      }));

      mockAxiosGet.mock.mockImplementationOnce(
        async () => ({
          data: {
            data: [
              {
                slug: 'SLUG_ARTICLE',
                state: {
                  published: true,
                },
                title: 'TITRE_ARTICLE',
                type: 'file',
              },
            ],
          },
          status: 200,
        }),
        1
      );

      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse =
        await adaptateurCmsCrisp.recupereArticlesParChemin('CHEMIN_CATEGORIE');

      assert.equal(mockAxiosGet.mock.callCount(), 2);
      assert.equal(
        mockAxiosGet.mock.calls[0].arguments[0],
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/tree/list/fr/articles/1?sub_path=CHEMIN_CATEGORIE'
      );
      assert.equal(
        mockAxiosGet.mock.calls[1].arguments[0],
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/tree/list/fr/articles/2?sub_path=CHEMIN_CATEGORIE'
      );
      assert.equal(reponse.length, 2);
    });

    it('ne résume pas les dossiers', async () => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: {
          data: [
            {
              slug: 'SLUG_SECTION',
              state: {
                published: true,
              },
              title: 'TITRE_SECTION',
              type: 'directory',
            },
          ],
        },
        status: 200,
      }));
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: {
          data: [],
        },
        status: 200,
      }));
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse =
        await adaptateurCmsCrisp.recupereArticlesParChemin('CHEMIN_CATEGORIE');
      assert.equal(reponse.length, 0);
    });

    it('récupère aussi les articles des sous répertoires', async () => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: reponseAxios,
        status: 200,
      }));
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: reponseAxios,
        status: 200,
      }));
      mockAxiosGet.mock.mockImplementationOnce(
        async () => ({
          data: {
            data: [
              {
                slug: 'SLUG_ARTICLE_SECTION_1',
                state: {
                  published: true,
                },
                title: 'TITRE_ARTICLE_SECTION_1',
                type: 'file',
              },
            ],
          },
          status: 200,
        }),
        1
      );
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');
      const reponse =
        await adaptateurCmsCrisp.recupereArticlesParChemin('CHEMIN_CATEGORIE');
      assert.equal(reponse.length, 2);
      assert.equal(reponse[1].slug, 'SLUG_ARTICLE_SECTION_1');
      assert.deepEqual(reponse[1].section, {
        id: 'SLUG_SECTION',
        nom: 'TITRE_SECTION',
      });
    });
  });

  describe("sur récupération de toutes les sections d'une catégorie", () => {
    beforeEach(() => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: {
          data: [
            { slug: 'ID_SECTION', title: 'NOM_SECTION', type: 'directory' },
            { slug: 'ID_ARTICLE', title: 'NOM_ARTICLE', type: 'file' },
          ],
        },
      }));
    });

    it("utilise l'identifiant de la catégorie pour la requête des sections", async () => {
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      await adaptateurCmsCrisp.recupereSectionsCategorie('BLOG');

      const urlUtilisee = mockAxiosGet.mock.calls[0].arguments[0];
      assert.strictEqual(
        urlUtilisee,
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/tree/list/fr/articles/1?sub_path=BLOG'
      );
    });

    it('retourne les sections', async () => {
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse =
        await adaptateurCmsCrisp.recupereSectionsCategorie('ID_CATEGORIE');

      assert.equal(reponse[0].id, 'ID_SECTION');
      assert.equal(reponse[0].nom, 'NOM_SECTION');
    });
  });
});
