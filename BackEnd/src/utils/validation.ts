/**
 * Valide qu'une valeur est une chaîne de date au format AAAA-MM-JJ
 * correspondant à une date qui existe réellement.
 */
export function estDateValide(valeur: unknown): valeur is string {
  if (typeof valeur !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valeur)) {
    return false;
  }

  return !Number.isNaN(Date.parse(valeur));
}

/**
 * Valide qu'une valeur est un texte non vide, une fois les espaces
 * superflus retirés.
 */
export function estTexteNonVide(valeur: unknown): valeur is string {
  return typeof valeur === 'string' && valeur.trim() !== '';
}
