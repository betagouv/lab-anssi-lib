import {decode} from "html-entities";
import {decoupeTableau} from "../services/serviceMiseEnForme";
import axios from "axios";

type Profil = {
    nom: string,
    prenom: string,
    email: string,
    entite: { nom: string, departement: string, siret: string },
    telephone?: string,
    domainesSpecialite: string[]
}
type ProfilsAInscrire = { dateInscription: Date, donneesProfil: Profil }[]

export class AdaptateurProfilAnssi {
    readonly entete: { headers: { [cle: string]: string } };

    constructor(private urlBase: string, cleApi: string) {
        this.entete = {
            headers: {
                Authorization: `Bearer ${cleApi}`
            }
        };
    }

    async metsAJour({nom, prenom, email, entite, telephone, domainesSpecialite}: Profil) {
        const urlProfil = `${this.urlBase}/profil/${email}`;
        await axios.put(
            urlProfil,
            {
                nom: decode(nom),
                prenom: decode(prenom),
                entite,
                telephone,
                domainesSpecialite,
            },
            this.entete
        );
    };

    async recupere(email: string) {
        const urlProfil = `${this.urlBase}/profil/${email}`;
        try {
            const reponse = await axios.get(urlProfil, this.entete);
            return reponse.data;
        } catch (e) {
            if (axios.isAxiosError(e) && e?.response?.status === 404)
                return undefined;
            throw e;
        }
    };

    async inscris(profils: ProfilsAInscrire) {
        const urlInscriptions = `${this.urlBase}/inscriptions`;
        const profilsParTrancheDe500 = decoupeTableau(profils, 500);

        const promesses = profilsParTrancheDe500.map(profils => axios.post(
            urlInscriptions,
            profils,
            this.entete
        ));

        await Promise.all(promesses);
    }
}