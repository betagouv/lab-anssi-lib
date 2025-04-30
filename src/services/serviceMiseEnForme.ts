const decoupeTableau = <T>(tableau: T[], taille: number): T[][] => {
    if (taille <= 0) throw new RangeError();

    const resultat: T[][] = [];
    for (let i = 0; i < tableau.length; i += taille) {
        resultat.push(tableau.slice(i, i + taille));
    }
    return resultat;
};

export { decoupeTableau };