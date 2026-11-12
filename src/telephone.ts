// Source : décision ARCEP n° 2025-2215, annexe 1, partie 2 « Plan de numérotation téléphonique (E.164) ».
type Territoire = {
  codePays: string;
  racines: RegExp[];
  racinesAuFormatAbrege?: RegExp[];
};

const FRANCE_METROPOLITAINE = '33';

const TERRITOIRES_D_OUTRE_MER: Territoire[] = [
  { codePays: '590', racines: [/^069[01]/, /^059[01]/] },
  { codePays: '594', racines: [/^0694/, /^0594/] },
  { codePays: '596', racines: [/^069[67]/, /^059[67]/] },
  {
    codePays: '262',
    racines: [/^069[23]/, /^026[239]/, /^0639[0-8]/, /^06399[0-79]/],
  },
  {
    codePays: '508',
    racines: [/^07084[0-5]/, /^07085[0-5]/],
    // À Saint-Pierre-et-Miquelon, les numéros polyvalents s’écrivent « +508 PQMCDU ».
    racinesAuFormatAbrege: [/^0508/],
  },
];

// « 0ZAB » : le 0 national et les trois chiffres ZAB (0508) précèdent les chiffres PQMCDU.
const LONGUEUR_DU_PREFIXE_NATIONAL_ABREGE = 4;

export class Telephone {
  constructor(private readonly telephone?: string) {}

  auFormatInternational(): string {
    if (!this.telephone) return '';

    const territoire = TERRITOIRES_D_OUTRE_MER.find((t) => t.racines.some((racine) => racine.test(this.telephone!)));
    if (territoire) return `+${territoire.codePays}${this.telephone.substring(1)}`;

    const territoireAbrege = TERRITOIRES_D_OUTRE_MER.find((t) =>
      t.racinesAuFormatAbrege?.some((racine) => racine.test(this.telephone!))
    );
    if (territoireAbrege)
      return `+${territoireAbrege.codePays}${this.telephone.substring(LONGUEUR_DU_PREFIXE_NATIONAL_ABREGE)}`;

    return `+${FRANCE_METROPOLITAINE}${this.telephone.substring(1)}`;
  }
}
