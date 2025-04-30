import {describe, it} from 'node:test';
import assert from 'assert';
import {decoupeTableau} from "../../src/services/serviceMiseEnForme";

describe("Le service de mise en forme", () => {
    describe("sur demande du découpage (chunking) d'un tableau", () => {
        it("découpe le tableau d'entrée en morceaux de N", () => {
            const entree = new Array(5).fill(0);

            const sortie = decoupeTableau(entree, 2);

            assert.equal(sortie.length, 3);
            assert.equal(sortie[0].length, 2);
            assert.equal(sortie[1].length, 2);
            assert.equal(sortie[2].length, 1);
        });

        it("jette une erreur si la taille est nulle ou négative", () => {
            assert.throws(() => decoupeTableau([], 0), RangeError);
        });
    });
});