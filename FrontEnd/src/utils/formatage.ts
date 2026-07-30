/**
 * Formate un montant en devise canadienne (ex. 1 234,50 $).
 */
export function formaterMontant(montant: number): string {
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(montant);
}

/**
 * Formate une date (ISO ou "YYYY-MM-DD") en format court fr-CA
 * (ex. 15 juill. 2026).
 */
export function formaterDate(dateIso: string): string {
  const date = new Date(`${dateIso.slice(0, 10)}T00:00:00`);

  return date.toLocaleDateString('fr-CA', { day: 'numeric', month: 'short', year: 'numeric' });
}
