import { formaterDate } from './formatage';
import type { ITransactionAvecCategorie } from '../types';

/**
 * Échappe une valeur pour l'insertion dans un champ CSV : l'entoure de
 * guillemets si elle contient une virgule, un guillemet ou un saut de
 * ligne, en doublant les guillemets internes.
 */
function echapperChampCsv(valeur: string): string {
  if (valeur.includes(',') || valeur.includes('"') || valeur.includes('\n')) {
    return `"${valeur.replace(/"/g, '""')}"`;
  }

  return valeur;
}

/**
 * Convertit une liste de transactions en chaîne CSV (colonnes : Date,
 * Description, Catégorie, Type, Montant).
 */
export function genererCsvTransactions(transactions: ITransactionAvecCategorie[]): string {
  const entetes = ['Date', 'Description', 'Catégorie', 'Type', 'Montant'];

  const lignes = transactions.map((transaction) =>
    [
      formaterDate(transaction.dateTransaction),
      transaction.description ?? '',
      transaction.categorieNom,
      transaction.type === 'revenu' ? 'Revenu' : 'Dépense',
      transaction.montant.toFixed(2),
    ]
      .map(echapperChampCsv)
      .join(',')
  );

  return [entetes.join(','), ...lignes].join('\n');
}

/**
 * Déclenche le téléchargement d'une chaîne CSV sous forme de fichier,
 * via un lien temporaire et un Blob (aucune librairie externe). Ajoute
 * un BOM UTF-8 pour que les accents s'affichent correctement dans Excel.
 */
export function telechargerCsv(contenuCsv: string, nomFichier: string): void {
  const blob = new Blob(['﻿', contenuCsv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement('a');

  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  document.body.removeChild(lien);
  URL.revokeObjectURL(url);
}
