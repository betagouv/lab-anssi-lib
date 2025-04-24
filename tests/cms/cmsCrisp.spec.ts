import { beforeEach, describe, it } from 'node:test';
import { CmsCrisp } from '../../src/cms/cmsCrisp';
import assert from 'assert';
import CrispMarkdown from '../../src/cms/crispMarkdown';

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
      adaptateurCmsCrisp.enteteCrisp['Authorization'],
      'Basic Y2xlLWFwaQ=='
    );
  });

  describe("sur demande de récupération d'article", () => {
    let cmsCrisp: CmsCrisp;
    beforeEach(() => {
      cmsCrisp = new CmsCrisp('id-site', 'cle-api');
      cmsCrisp.adaptateurCmsCrisp = {
        urlBase: '',
        enteteCrisp: {},
        recupereArticle: async (_: string) => donneesParDefautAdaptateur,
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
});
