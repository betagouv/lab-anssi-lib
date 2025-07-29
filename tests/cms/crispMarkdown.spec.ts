import assert from 'assert';
import { describe, it } from 'node:test';
import {
  AdaptateurHttp,
  fabriqueAdaptateurHttp,
} from '../../src/cms/adaptateurHttp';
import CrispMarkdown from '../../src/cms/crispMarkdown';

const fabriqueCrispMarkdown = (
  entree: string,
  adaptateurHttp?: AdaptateurHttp
) => new CrispMarkdown(entree, adaptateurHttp ?? fabriqueAdaptateurHttp());

describe('Le convertisseur de Markdown Crisp', () => {
  it('sait parser une "boite" de niveau "aide"', async () => {
    const entree = '| Une aide.\n';
    const crispMarkdown = fabriqueCrispMarkdown(entree);

    const resultat = await crispMarkdown.versHTML();

    assert.equal(resultat, "<div class='aide'>Une aide.</div>");
  });

  it('sait parser une "boite" de niveau "information"', async () => {
    const entree = '|| Une information.\n';
    const crispMarkdown = fabriqueCrispMarkdown(entree);

    const resultat = await crispMarkdown.versHTML();

    assert.equal(resultat, "<div class='information'>Une information.</div>");
  });

  it('sait parser une "boite" de niveau "alerte"', async () => {
    const entree = '||| Une alerte.\n';
    const crispMarkdown = fabriqueCrispMarkdown(entree);

    const resultat = await crispMarkdown.versHTML();

    assert.equal(resultat, "<div class='alerte'>Une alerte.</div>");
  });

  describe('concernant les vidéos', () => {
    it('sait parser une vidéo avec une légende', async () => {
      // eslint-disable-next-line no-template-curly-in-string
      const entree = '${frame}[LEGENDE](http://url.video.mp4)\n';
      const fauxAdaptateurHttp = {
        ressourceExiste: async (url: string) => false,
      };
      const crispMarkdown = fabriqueCrispMarkdown(entree, fauxAdaptateurHttp);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<div class='conteneur-video'>" +
          "<video controls>" +
          "<source src='http://url.video.mp4' type='video/mp4' />" +
          "</video>" +
          "<p class='legende'>LEGENDE</p>" +
          '</div>'
      );
    });

    it("sait ajouter les sous-titres lorsqu'ils sont disponibles", async () => {
      // eslint-disable-next-line no-template-curly-in-string
      const entree = '${frame}[LEGENDE](http://url.video.mp4)\n';
      const fauxAdaptateurHttp = {
        ressourceExiste: async (url: string) => true,
      };
      const crispMarkdown = fabriqueCrispMarkdown(entree, fauxAdaptateurHttp);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<div class='conteneur-video'>" +
          "<video controls>" +
          "<source src='http://url.video.mp4' type='video/mp4' />" +
          "<track kind='captions' src='http://url.video.vtt' srclang='fr' default />" +
          '</video>' +
          "<p class='legende'>LEGENDE</p>" +
          '</div>'
      );
    });
  });

  it("reste robuste lorsqu'une image est suivie d'une ligne horizontale", async () => {
    const entree = '![](https://uneUrl.com)\n---\n';
    const crispMarkdown = fabriqueCrispMarkdown(entree);

    const resultat = await crispMarkdown.versHTML();

    assert.equal(
      resultat,
      '<p><img src="https://uneUrl.com" alt=""></p>\n' + '<hr>\n'
    );
  });

  describe('concernant les titres', () => {
    it("diminue d'un niveau la hierarchie des titres afin de réserver le h1 pour le titre de la page", async () => {
      const entree = '# Un titre';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2></section>"
      );
    });

    it('contrains les niveaux de hierarchie entre 2 et 4', async () => {
      const entree = '# Un titre\n###### Un autre titre';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2><h4 id='un-autre-titre'>Un autre titre</h4></section>"
      );
    });

    it('ajoute un slug sur le titre', async () => {
      const entree = '# Un titre';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2></section>"
      );
    });
  });

  describe('concernant les liens', () => {
    it('ajoute une cible et une classe "telechargement" si le lien comporte le texte "Télécharger"', async () => {
      const entree = '[Télécharger un document](http://url.video)';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<p><a href='http://url.video' class='telechargement' target='_blank' rel='noreferrer nofollow'>Télécharger un document</a></p>\n"
      );
    });

    it('reste robuste pour les autres types de lien', async () => {
      const entree = '[Un lien](http://url.video)';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<p><a href='http://url.video' target='_blank' rel='nofollow'>Un lien</a></p>\n"
      );
    });
  });

  describe('sur demande de la table des matières', () => {
    it('sait construire une table des matières', async () => {
      const entree = '# Un titre\n## Un sous titre';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const tdm = await crispMarkdown.tableDesMatieres();

      assert.deepEqual(tdm, [
        {
          profondeur: 2,
          texte: 'Un titre',
          id: 'un-titre',
        },
        {
          profondeur: 3,
          texte: 'Un sous titre',
          id: 'un-sous-titre',
        },
      ]);
    });
  });

  describe('concernant les sections', () => {
    it('ajoute une section pour chaque titre', async () => {
      const entree = '# Un titre\ncontenu de la section';
      const crispMarkdown = fabriqueCrispMarkdown(entree);

      const resultat = await crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2><p>contenu de la section</p>\n</section>"
      );
    });
  });
});
