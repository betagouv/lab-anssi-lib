import assert from 'assert';
import { describe, it } from 'node:test';
import { tailleEntite, typeEntite } from '../../src/entites/categoriseEntite';

const entites = {
  communeDeLyon: {
    natureJuridique: '7210',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '53',
    finances: null,
    complements: {
      collectiviteTerritoriale: { code: '69123', niveau: 'Commune' },
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
  },
  regionIleDeFrance: {
    natureJuridique: '7230',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '53',
    finances: null,
    complements: {
      collectiviteTerritoriale: { code: '11', niveau: 'Région' },
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
  },
  collectiviteDeSaintMartin: {
    natureJuridique: '7225',
    categorieEntreprise: 'PME',
    trancheEffectifSalarie: 'NN',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
  },
  anssi: {
    natureJuridique: '7160',
    categorieEntreprise: 'ETI',
    trancheEffectifSalarie: '41',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
  },
  ministereDeLInterieur: {
    natureJuridique: '7113',
    categorieEntreprise: 'ETI',
    trancheEffectifSalarie: '51',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
  },
  ugap: {
    natureJuridique: '4110',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '42',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: true,
    },
  },
  restosDuCoeur: {
    natureJuridique: '9230',
    categorieEntreprise: 'PME',
    trancheEffectifSalarie: '31',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: true,
      identifiantAssociation: 'W751074179',
      estAdministration: false,
    },
  },
  associationFranceJapon: {
    natureJuridique: '9210',
    categorieEntreprise: null,
    trancheEffectifSalarie: 'NN',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: true,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  croixRougeFrancaise: {
    natureJuridique: '9230',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '53',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: true,
      identifiantAssociation: 'W751004076',
      estAdministration: false,
    },
  },
  orange: {
    natureJuridique: '5599',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '53',
    finances: { '2025': { ca: 40396000000, resultatNet: 1139000000 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  decathlonFrance: {
    natureJuridique: '5710',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '53',
    finances: { '2025': { ca: 3944371232, resultatNet: 63215297 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  decathlonOutdoor: {
    natureJuridique: '5710',
    categorieEntreprise: 'GE',
    trancheEffectifSalarie: '12',
    finances: { '2025': { ca: 269238, resultatNet: -10161420 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  boulangerieDuQuartier: {
    natureJuridique: '5710',
    categorieEntreprise: 'PME',
    trancheEffectifSalarie: '03',
    finances: { '2021': { ca: 295856, resultatNet: 4637 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  boulangerieValentino: {
    natureJuridique: '5710',
    categorieEntreprise: 'PME',
    trancheEffectifSalarie: '03',
    finances: null,
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  rainbowHolding: {
    natureJuridique: '5710',
    categorieEntreprise: 'PME',
    trancheEffectifSalarie: '03',
    finances: { '2024': { ca: 90208000, resultatNet: -27695000 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  ordisysInformatique: {
    natureJuridique: '5499',
    categorieEntreprise: 'PME',
    trancheEffectifSalarie: '12',
    finances: { '2024': { ca: 5788474, resultatNet: 121350 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  sasBellegrave: {
    natureJuridique: '5710',
    categorieEntreprise: null,
    trancheEffectifSalarie: '03',
    finances: { '2024': { ca: 0, resultatNet: 4390 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
  genesDiffusion: {
    natureJuridique: '5710',
    categorieEntreprise: null,
    trancheEffectifSalarie: '22',
    finances: { '2024': { ca: 38845333, resultatNet: 1005789 } },
    complements: {
      collectiviteTerritoriale: null,
      estAssociation: false,
      identifiantAssociation: null,
      estAdministration: false,
    },
  },
} as const satisfies Record<string, Parameters<typeof typeEntite>[0]>;

describe('La catégorisation des entités', () => {
  describe("sur détermination du type d'entité", () => {
    it('reconnaît une commune comme une collectivité, même si elle est aussi une administration', () => {
      assert.equal(typeEntite(entites.communeDeLyon), 'collectivite');
    });

    it('reconnaît une région comme une collectivité', () => {
      assert.equal(typeEntite(entites.regionIleDeFrance), 'collectivite');
    });

    it("reconnaît une collectivité d'outre-mer par sa nature juridique (72xx) en l'absence de complément « collectivité territoriale »", () => {
      assert.equal(typeEntite(entites.collectiviteDeSaintMartin), 'collectivite');
    });

    it("reconnaît une autorité administrative comme l'ANSSI comme un service public", () => {
      assert.equal(typeEntite(entites.anssi), 'servicePublic');
    });

    it('reconnaît un ministère comme un service public', () => {
      assert.equal(typeEntite(entites.ministereDeLInterieur), 'servicePublic');
    });

    it('reconnaît un établissement public industriel et commercial comme un service public', () => {
      assert.equal(typeEntite(entites.ugap), 'servicePublic');
    });

    it('reconnaît une association déclarée', () => {
      assert.equal(typeEntite(entites.restosDuCoeur), 'association');
    });

    it('reconnaît une association sans identifiant RNA', () => {
      assert.equal(typeEntite(entites.associationFranceJapon), 'association');
    });

    it("reconnaît une association reconnue d'utilité publique", () => {
      assert.equal(typeEntite(entites.croixRougeFrancaise), 'association');
    });

    it('reconnaît une association par sa nature juridique (92xx) seule', () => {
      const sansComplements = { ...entites.restosDuCoeur, complements: null };

      assert.equal(typeEntite(sansComplements), 'association');
    });

    it('reconnaît une association par son seul identifiant RNA', () => {
      const avecIdentifiantSeul = {
        ...entites.restosDuCoeur,
        natureJuridique: null,
        complements: { ...entites.restosDuCoeur.complements, estAssociation: false },
      };

      assert.equal(typeEntite(avecIdentifiantSeul), 'association');
    });

    it('reconnaît une société anonyme comme une entreprise', () => {
      assert.equal(typeEntite(entites.orange), 'entreprise');
    });

    it('reconnaît une SAS comme une entreprise', () => {
      assert.equal(typeEntite(entites.boulangerieDuQuartier), 'entreprise');
    });

    it('considère par défaut une entité sans nature juridique ni compléments comme une entreprise', () => {
      const entiteVide = { ...entites.orange, natureJuridique: null, complements: undefined };

      assert.equal(typeEntite(entiteVide), 'entreprise');
    });
  });

  describe("sur détermination de la taille d'entité", () => {
    describe("quand l'INSEE fournit une catégorie GE ou ETI", () => {
      it('retourne GE pour une grande entreprise', () => {
        assert.equal(tailleEntite(entites.orange), 'GE');
      });

      it('retourne ETI pour une entreprise de taille intermédiaire', () => {
        assert.equal(tailleEntite(entites.anssi), 'ETI');
      });

      it("conserve la catégorie INSEE même si l'effectif propre est faible (filiale d'un groupe)", () => {
        assert.equal(tailleEntite(entites.decathlonOutdoor), 'GE');
      });
    });

    describe("quand l'INSEE fournit la catégorie PME", () => {
      it('retourne TPE pour moins de 10 salariés et un CA inférieur à 2 M€', () => {
        assert.equal(tailleEntite(entites.boulangerieDuQuartier), 'TPE');
      });

      it("retourne TPE pour moins de 10 salariés quand le CA n'est pas connu", () => {
        assert.equal(tailleEntite(entites.boulangerieValentino), 'TPE');
      });

      it('retourne PME pour moins de 10 salariés mais un CA supérieur à 2 M€', () => {
        assert.equal(tailleEntite(entites.rainbowHolding), 'PME');
      });

      it('retourne PME pour 10 salariés ou plus', () => {
        assert.equal(tailleEntite(entites.ordisysInformatique), 'PME');
      });

      it('retourne PME pour une association de 200 à 249 salariés', () => {
        assert.equal(tailleEntite(entites.restosDuCoeur), 'PME');
      });

      it('retourne TPE pour un CA de exactement 2 M€', () => {
        const caAuPlafond = {
          ...entites.boulangerieDuQuartier,
          finances: { '2021': { ca: 2_000_000, resultatNet: 4637 } },
        };

        assert.equal(tailleEntite(caAuPlafond), 'TPE');
      });

      it("utilise le CA de l'exercice le plus récent", () => {
        const plusieursExercices = {
          ...entites.rainbowHolding,
          finances: {
            '2024': { ca: 90208000, resultatNet: -27695000 },
            '2019': { ca: 150000, resultatNet: 1000 },
          },
        };

        assert.equal(tailleEntite(plusieursExercices), 'PME');
      });

      it("retourne PME quand l'effectif n'est pas connu", () => {
        const sansEffectif = { ...entites.boulangerieValentino, trancheEffectifSalarie: null };

        assert.equal(tailleEntite(sansEffectif), 'PME');
      });
    });

    describe("quand l'INSEE ne fournit pas de catégorie", () => {
      it('estime TPE pour moins de 10 salariés', () => {
        assert.equal(tailleEntite(entites.sasBellegrave), 'TPE');
      });

      it('estime PME entre 10 et 249 salariés', () => {
        assert.equal(tailleEntite(entites.genesDiffusion), 'PME');
      });

      it('estime ETI entre 250 et 4 999 salariés', () => {
        const sansCategorie = { ...entites.anssi, categorieEntreprise: null };

        assert.equal(tailleEntite(sansCategorie), 'ETI');
      });

      it('estime GE à partir de 5 000 salariés', () => {
        const sansCategorie = { ...entites.decathlonFrance, categorieEntreprise: null };

        assert.equal(tailleEntite(sansCategorie), 'GE');
      });

      it('estime TPE pour une unité non employeuse (tranche NN)', () => {
        assert.equal(tailleEntite(entites.associationFranceJapon), 'TPE');
      });

      it("retourne null quand l'effectif n'est pas connu", () => {
        const sansEffectif = { ...entites.genesDiffusion, trancheEffectifSalarie: null };

        assert.equal(tailleEntite(sansEffectif), null);
      });
    });
  });
});
