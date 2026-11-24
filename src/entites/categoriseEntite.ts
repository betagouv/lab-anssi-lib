export type TypeStructure = 'collectivite' | 'servicePublic' | 'association' | 'entreprise';

export type Taille = 'TPE' | 'PME' | 'ETI' | 'GE';

type Entite = {
  natureJuridique: string | null;
  categorieEntreprise: 'PME' | 'ETI' | 'GE' | null;
  trancheEffectifSalarie: string | null;
  finances?: Record<string, { ca: number | null; resultatNet: number | null }> | null;
  complements?: {
    collectiviteTerritoriale?: { code: string; niveau: string } | null;
    estAssociation?: boolean | null;
    identifiantAssociation?: string | null;
    estAdministration?: boolean | null;
  } | null;
};

type Finances = Entite['finances'];

const EFFECTIF_MAX_PAR_TRANCHE = {
  NN: 0,
  '00': 0,
  '01': 2,
  '02': 5,
  '03': 9,
  '11': 19,
  '12': 49,
  '21': 99,
  '22': 199,
  '31': 249,
  '32': 499,
  '41': 999,
  '42': 1999,
  '51': 4999,
  '52': 9999,
  '53': Infinity,
} as const;
type TrancheEffecticSalarie = keyof typeof EFFECTIF_MAX_PAR_TRANCHE;

const PLAFOND_CA_TPE = 2_000_000;

const effectifMax = (trancheEffecticSalarie: TrancheEffecticSalarie | null): number | null => {
  if (!trancheEffecticSalarie) return null;
  return EFFECTIF_MAX_PAR_TRANCHE[trancheEffecticSalarie] ?? null;
};

const dernierCa = (finances: Finances | null): number | null => {
  const annees = Object.keys(finances ?? {}).sort();
  const derniere = annees.at(-1);
  return derniere ? (finances?.[derniere]?.ca ?? null) : null;
};

export const typeEntite = (entite: Entite): TypeStructure => {
  const complements = entite.complements ?? {};
  const natureJuridique = entite.natureJuridique ?? '';

  if (complements.collectiviteTerritoriale || natureJuridique.startsWith('72')) return 'collectivite';

  if (complements.estAdministration) return 'servicePublic';

  if (complements.estAssociation || complements.identifiantAssociation || natureJuridique.startsWith('92'))
    return 'association';

  return 'entreprise';
};

export function tailleEntite(entite: Entite): Taille | null {
  const effectif = effectifMax(entite.trancheEffectifSalarie as TrancheEffecticSalarie | null);
  const categorie = entite.categorieEntreprise;

  if (categorie === 'GE' || categorie === 'ETI') return categorie;

  if (categorie === 'PME') {
    const ca = dernierCa(entite.finances as Finances | null);
    const estTpe = effectif !== null && effectif < 10 && (ca === null || ca <= PLAFOND_CA_TPE);
    return estTpe ? 'TPE' : 'PME';
  }

  if (effectif === null) return null;
  return effectif < 10 ? 'TPE' : effectif < 250 ? 'PME' : effectif < 5000 ? 'ETI' : 'GE';
}
