import assert from 'assert';
import { describe, it } from 'node:test';
import { tailleEntite, typeEntite } from '../../src/entites/categoriseEntite';

const entites = {
  communeDeLyon: {
    nature_juridique: '7210',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '53',
    finances: null,
    complements: {
      collectivite_territoriale: { code: '69123', niveau: 'Commune' },
      est_association: false,
      identifiant_association: null,
      est_administration: true,
    },
  },
  regionIleDeFrance: {
    nature_juridique: '7230',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '53',
    finances: null,
    complements: {
      collectivite_territoriale: { code: '11', niveau: 'Région' },
      est_association: false,
      identifiant_association: null,
      est_administration: true,
    },
  },
  collectiviteDeSaintMartin: {
    nature_juridique: '7225',
    categorie_entreprise: 'PME',
    tranche_effectif_salarie: 'NN',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: true,
    },
  },
  anssi: {
    nature_juridique: '7160',
    categorie_entreprise: 'ETI',
    tranche_effectif_salarie: '41',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: true,
    },
  },
  ministereDeLInterieur: {
    nature_juridique: '7113',
    categorie_entreprise: 'ETI',
    tranche_effectif_salarie: '51',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: true,
    },
  },
  ugap: {
    nature_juridique: '4110',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '42',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: true,
    },
  },
  restosDuCoeur: {
    nature_juridique: '9230',
    categorie_entreprise: 'PME',
    tranche_effectif_salarie: '31',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: true,
      identifiant_association: 'W751074179',
      est_administration: false,
    },
  },
  associationFranceJapon: {
    nature_juridique: '9210',
    categorie_entreprise: null,
    tranche_effectif_salarie: 'NN',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: true,
      identifiant_association: null,
      est_administration: false,
    },
  },
  croixRougeFrancaise: {
    nature_juridique: '9230',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '53',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: true,
      identifiant_association: 'W751004076',
      est_administration: false,
    },
  },
  orange: {
    nature_juridique: '5599',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '53',
    finances: { '2025': { ca: 40396000000, resultat_net: 1139000000 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  decathlonFrance: {
    nature_juridique: '5710',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '53',
    finances: { '2025': { ca: 3944371232, resultat_net: 63215297 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  decathlonOutdoor: {
    nature_juridique: '5710',
    categorie_entreprise: 'GE',
    tranche_effectif_salarie: '12',
    finances: { '2025': { ca: 269238, resultat_net: -10161420 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  boulangerieDuQuartier: {
    nature_juridique: '5710',
    categorie_entreprise: 'PME',
    tranche_effectif_salarie: '03',
    finances: { '2021': { ca: 295856, resultat_net: 4637 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  boulangerieValentino: {
    nature_juridique: '5710',
    categorie_entreprise: 'PME',
    tranche_effectif_salarie: '03',
    finances: null,
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  rainbowHolding: {
    nature_juridique: '5710',
    categorie_entreprise: 'PME',
    tranche_effectif_salarie: '03',
    finances: { '2024': { ca: 90208000, resultat_net: -27695000 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  ordisysInformatique: {
    nature_juridique: '5499',
    categorie_entreprise: 'PME',
    tranche_effectif_salarie: '12',
    finances: { '2024': { ca: 5788474, resultat_net: 121350 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  sasBellegrave: {
    nature_juridique: '5710',
    categorie_entreprise: null,
    tranche_effectif_salarie: '03',
    finances: { '2024': { ca: 0, resultat_net: 4390 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
    },
  },
  genesDiffusion: {
    nature_juridique: '5710',
    categorie_entreprise: null,
    tranche_effectif_salarie: '22',
    finances: { '2024': { ca: 38845333, resultat_net: 1005789 } },
    complements: {
      collectivite_territoriale: null,
      est_association: false,
      identifiant_association: null,
      est_administration: false,
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
        nature_juridique: null,
        complements: { ...entites.restosDuCoeur.complements, est_association: false },
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
      const entiteVide = { ...entites.orange, nature_juridique: null, complements: undefined };

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
          finances: { '2021': { ca: 2_000_000, resultat_net: 4637 } },
        };

        assert.equal(tailleEntite(caAuPlafond), 'TPE');
      });

      it("utilise le CA de l'exercice le plus récent", () => {
        const plusieursExercices = {
          ...entites.rainbowHolding,
          finances: {
            '2024': { ca: 90208000, resultat_net: -27695000 },
            '2019': { ca: 150000, resultat_net: 1000 },
          },
        };

        assert.equal(tailleEntite(plusieursExercices), 'PME');
      });

      it("retourne PME quand l'effectif n'est pas connu", () => {
        const sansEffectif = { ...entites.boulangerieValentino, tranche_effectif_salarie: null };

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
        const sansCategorie = { ...entites.anssi, categorie_entreprise: null };

        assert.equal(tailleEntite(sansCategorie), 'ETI');
      });

      it('estime GE à partir de 5 000 salariés', () => {
        const sansCategorie = { ...entites.decathlonFrance, categorie_entreprise: null };

        assert.equal(tailleEntite(sansCategorie), 'GE');
      });

      it('estime TPE pour une unité non employeuse (tranche NN)', () => {
        assert.equal(tailleEntite(entites.associationFranceJapon), 'TPE');
      });

      it("retourne null quand l'effectif n'est pas connu", () => {
        const sansEffectif = { ...entites.genesDiffusion, tranche_effectif_salarie: null };

        assert.equal(tailleEntite(sansEffectif), null);
      });
    });
  });
});
