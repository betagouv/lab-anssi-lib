import {decode} from "html-entities";
import {decoupeTableau} from "../services/serviceMiseEnForme";

type Profil = {
    nom: string,
    prenom: string,
    email: string,
    entite: { nom: string, departement: string, siret: string },
    telephone?: string,
    domainesSpecialite: string[]
}

type ProfilsAInscrire = (Profil & { dateInscription: Date })[]

class ErreurFetch extends Error {
    status: number;

    constructor(message: string, status: number) {
        super(message);
        this.status = status;
    }
}

export class AdaptateurProfilAnssi {
    readonly entete: { [cle: string]: string };

    constructor(private urlBase: string, cleApi: string) {
        this.entete = {
            Authorization: `Bearer ${cleApi}`
        };
    }

    async metsAJour({nom, prenom, email, entite, telephone, domainesSpecialite}: Profil) {
        const urlProfil = `${this.urlBase}/profil/${email}`;
        await fetch(
            urlProfil,
            {
                method: 'PUT',
                headers: this.entete,
                body: JSON.stringify({
                    nom: decode(nom),
                    prenom: decode(prenom),
                    entite,
                    telephone,
                    domainesSpecialite,
                })
            }
        );
    };

    async recupere(email: string) {
        const urlProfil = `${this.urlBase}/profil/${email}`;
        try {
            const reponse = await fetch(urlProfil, {
                method: 'GET',
                headers: this.entete,
            });
            if (!reponse.ok) {
                throw new ErreurFetch(await reponse.json(),reponse.status);
            }
            return await reponse.json();
        } catch (e) {
            if(e instanceof ErreurFetch) {
                if(e.status === 404) return undefined;
                throw e;
            }
        }
    };

    async inscris(profils: ProfilsAInscrire) {
        const urlInscriptions = `${this.urlBase}/inscriptions`;
        const profilsParTrancheDe500 = decoupeTableau(profils, 500);

        const promesses = profilsParTrancheDe500.map(profils => fetch(
            urlInscriptions,
            {
                method: 'POST',
                headers: this.entete,
                body: JSON.stringify(profils)
            }
        ));

        await Promise.all(promesses);
    }
}