import { afterEach, beforeEach, describe, it, Mock, mock } from 'node:test';
import assert from 'assert';
import { AdaptateurCmsCrisp } from '../../src/cms/adaptateurCmsCrisp';
import axios, { HttpStatusCode } from 'axios';

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

  describe("sur récupération de tous les articles d'une catégorie", () => {
    let reponseAxios = {
      data: [
        {
          article_id: 'ID_ARTICLE',
          url: 'URL_ARTICLE',
          title: 'TITRE_ARTICLE',
          category: {
            section: { section_id: 'ID_SECTION', name: 'NOM_SECTION' },
          },
        },
      ],
    };

    beforeEach(() => {
      mockAxiosGet.mock.mockImplementationOnce(async () => ({
        data: reponseAxios,
        status: 200,
      }));
    });

    it("utilise l'identifiant de la catégorie pour la requête", async () => {
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');
      await adaptateurCmsCrisp.recupereArticlesCategorie('ID_CATEGORIE');

      const urlUtilisee = mockAxiosGet.mock.calls[0].arguments[0];
      assert.strictEqual(
        urlUtilisee,
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/locale/fr/articles/1?filter_category_id=ID_CATEGORIE'
      );
    });

    it('retourne le resumé des articles', async () => {
      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse =
        await adaptateurCmsCrisp.recupereArticlesCategorie('ID_CATEGORIE');

      assert.equal(reponse[0].id, 'ID_ARTICLE');
      assert.equal(reponse[0].url, 'URL_ARTICLE');
      assert.equal(reponse[0].titre, 'TITRE_ARTICLE');
      assert.deepEqual(reponse[0].section, {
        id: 'ID_SECTION',
        nom: 'NOM_SECTION',
      });
    });

    it('aggrège les articles paginés', async () => {
      mockAxiosGet.mock.mockImplementationOnce(
        async () => ({
          data: reponseAxios,
          status: HttpStatusCode.PartialContent,
        }),
        0
      );
      mockAxiosGet.mock.mockImplementationOnce(
        async () => ({
          data: reponseAxios,
          status: 200,
        }),
        1
      );

      const adaptateurCmsCrisp = new AdaptateurCmsCrisp('ID_SITE', 'CLE_API');

      const reponse =
        await adaptateurCmsCrisp.recupereArticlesCategorie('ID_CATEGORIE');

      assert.equal(mockAxiosGet.mock.callCount(), 2);
      assert.equal(
        mockAxiosGet.mock.calls[0].arguments[0],
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/locale/fr/articles/1?filter_category_id=ID_CATEGORIE'
      );
      assert.equal(
        mockAxiosGet.mock.calls[1].arguments[0],
        'https://api.crisp.chat/v1/website/ID_SITE/helpdesk/locale/fr/articles/2?filter_category_id=ID_CATEGORIE'
      );
      assert.equal(reponse.length, 2);
    });
  });
});
