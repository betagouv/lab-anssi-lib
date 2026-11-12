import { describe, it } from 'node:test';
import { Telephone } from '../src/telephone';
import assert from 'assert';

// Source : décision ARCEP n° 2025-2215 (JORF du 22 mai 2026, texte 103 sur 151),
// annexe 1, partie 2 « Plan de numérotation téléphonique (E.164) ».
// Format national : 0ZABPQMCDU. Format international : +CC(C) ZABPQMCDU (le « 0 » initial disparaît).
describe('Les numéros de télephone', () => {
  describe('se déclinent en format international', () => {
    describe('lorsqu’ils sont en France métropolitaine (+33)', () => {
      it('pour un numéro mobile en 06', () => {
        const telephoneInternational = new Telephone('0612345678').auFormatInternational();

        assert.equal(telephoneInternational, '+33612345678');
      });

      it('pour un numéro mobile en 07', () => {
        const telephoneInternational = new Telephone('0778123456').auFormatInternational();

        assert.equal(telephoneInternational, '+33778123456');
      });

      it('pour un numéro fixe en 01', () => {
        const telephoneInternational = new Telephone('0123456789').auFormatInternational();

        assert.equal(telephoneInternational, '+33123456789');
      });

      it('pour un numéro polyvalent en 09', () => {
        const telephoneInternational = new Telephone('0911223344').auFormatInternational();

        assert.equal(telephoneInternational, '+33911223344');
      });

      it('pour les mobiles en 0695, 0698 et 0699, rattachés à la métropole', () => {
        assert.equal(new Telephone('0695123456').auFormatInternational(), '+33695123456');
        assert.equal(new Telephone('0698123456').auFormatInternational(), '+33698123456');
        assert.equal(new Telephone('0699123456').auFormatInternational(), '+33699123456');
      });
    });

    describe('lorsqu’ils sont en outre-mer, le code pays du territoire remplace le « 0 » initial', () => {
      describe('à la Guadeloupe, Saint-Martin et Saint-Barthélemy (+590)', () => {
        it('pour un numéro mobile en 0690 ou 0691', () => {
          assert.equal(new Telephone('0690123456').auFormatInternational(), '+590690123456');
          assert.equal(new Telephone('0691123456').auFormatInternational(), '+590691123456');
        });

        it('pour un numéro fixe en 0590 ou 0591', () => {
          assert.equal(new Telephone('0590123456').auFormatInternational(), '+590590123456');
          assert.equal(new Telephone('0591123456').auFormatInternational(), '+590591123456');
        });
      });

      describe('en Guyane (+594)', () => {
        it('pour un numéro mobile en 0694', () => {
          assert.equal(new Telephone('0694123456').auFormatInternational(), '+594694123456');
        });

        it('pour un numéro fixe en 0594', () => {
          assert.equal(new Telephone('0594123456').auFormatInternational(), '+594594123456');
        });
      });

      describe('en Martinique (+596)', () => {
        it('pour un numéro mobile en 0696 ou 0697', () => {
          assert.equal(new Telephone('0696123456').auFormatInternational(), '+596696123456');
          assert.equal(new Telephone('0697123456').auFormatInternational(), '+596697123456');
        });

        it('pour un numéro fixe en 0596 ou 0597', () => {
          assert.equal(new Telephone('0596123456').auFormatInternational(), '+596596123456');
          assert.equal(new Telephone('0597123456').auFormatInternational(), '+596597123456');
        });
      });

      describe('à La Réunion (+262)', () => {
        it('pour un numéro mobile en 0692 ou 0693', () => {
          assert.equal(new Telephone('0692123456').auFormatInternational(), '+262692123456');
          assert.equal(new Telephone('0693123456').auFormatInternational(), '+262693123456');
        });

        it('pour un numéro fixe en 0262', () => {
          assert.equal(new Telephone('0262123456').auFormatInternational(), '+262262123456');
        });
      });

      describe('à Mayotte (+262, comme La Réunion)', () => {
        it('pour un numéro mobile de 06390 à 06398', () => {
          assert.equal(new Telephone('0639012345').auFormatInternational(), '+262639012345');
          assert.equal(new Telephone('0639812345').auFormatInternational(), '+262639812345');
        });

        it('pour un numéro fixe en 0269', () => {
          assert.equal(new Telephone('0269123456').auFormatInternational(), '+262269123456');
        });
      });

      describe('à Saint-Pierre-et-Miquelon (+508)', () => {
        it('pour un numéro mobile de 070840 à 070845 ou de 070850 à 070855', () => {
          assert.equal(new Telephone('0708401234').auFormatInternational(), '+508708401234');
          assert.equal(new Telephone('0708501234').auFormatInternational(), '+508708501234');
        });

        it('au format international abrégé « +508 PQMCDU » pour un numéro polyvalent', () => {
          // Numéro polyvalent en 05080 : P = 0, Q = 1, M = 2, C = 3, D = 4, U = 5
          assert.equal(new Telephone('0508012345').auFormatInternational(), '+508012345');
        });
      });
    });

    it('et restent vides lorsqu’aucun numéro n’est fourni', () => {
      assert.equal(new Telephone().auFormatInternational(), '');
    });
  });
});
