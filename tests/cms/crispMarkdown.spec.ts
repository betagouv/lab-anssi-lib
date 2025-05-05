import assert from 'assert';
import { describe, it } from 'node:test';
import CrispMarkdown from '../../src/cms/crispMarkdown';

describe('Le convertisseur de Markdown Crisp', () => {
  it('sait parser une "boite" de niveau "aide"', () => {
    const entree = '| Une aide.\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    assert.equal(resultat, "<div class='aide'>Une aide.</div>");
  });

  it('sait parser une "boite" de niveau "information"', () => {
    const entree = '|| Une information.\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    assert.equal(resultat, "<div class='information'>Une information.</div>");
  });

  it('sait parser une "boite" de niveau "alerte"', () => {
    const entree = '||| Une alerte.\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    assert.equal(resultat, "<div class='alerte'>Une alerte.</div>");
  });

  it('sait parser une vidéo avec une légende', () => {
    // eslint-disable-next-line no-template-curly-in-string
    const entree = '${frame}[LEGENDE](http://url.video)\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    assert.equal(
      resultat,
      "<div class='conteneur-video'>" +
        "<video src='http://url.video' controls></video>" +
        "<p class='legende'>LEGENDE</p>" +
        '</div>'
    );
  });

  it("reste robuste lorsqu'une image est suivie d'une ligne horizontale", () => {
    const entree = '![](https://uneUrl.com)\n---\n';
    const crispMarkdown = new CrispMarkdown(entree);

    const resultat = crispMarkdown.versHTML();

    assert.equal(
        resultat,
        '<p><img src="https://uneUrl.com" alt=""></p>\n' +
        '<hr>\n'
    );

  });

  describe('concernant les titres', () => {
    it("diminue d'un niveau la hierarchie des titres afin de réserver le h1 pour le titre de la page", () => {
      const entree = '# Un titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2></section>"
      );
    });

    it('contrains les niveaux de hierarchie entre 2 et 4', () => {
      const entree = '# Un titre\n###### Un autre titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2><h4 id='un-autre-titre'>Un autre titre</h4></section>"
      );
    });

    it('ajoute un slug sur le titre', () => {
      const entree = '# Un titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2></section>"
      );
    });
  });

  describe('concernant les liens', () => {
    it('ajoute une cible et une classe "telechargement" si le lien comporte le texte "Télécharger"', () => {
      const entree = '[Télécharger un document](http://url.video)';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<p><a href='http://url.video' class='telechargement' target='_blank' rel='noreferrer nofollow'>Télécharger un document</a></p>\n"
      );
    });

    it('reste robuste pour les autres types de lien', () => {
      const entree = '[Un lien](http://url.video)';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<p><a href='http://url.video' target='_blank' rel='nofollow'>Un lien</a></p>\n"
      );
    });
  });

  describe('sur demande de la table des matières', () => {
    it('sait construire une table des matières', () => {
      const entree = '# Un titre\n## Un sous titre';
      const crispMarkdown = new CrispMarkdown(entree);

      const tdm = crispMarkdown.tableDesMatieres();

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
    it('ajoute une section pour chaque titre', () => {
      const entree = '# Un titre\ncontenu de la section';
      const crispMarkdown = new CrispMarkdown(entree);

      const resultat = crispMarkdown.versHTML();

      assert.equal(
        resultat,
        "<section><h2 id='un-titre'>Un titre</h2><p>contenu de la section</p>\n</section>"
      );
    });
  });
});
