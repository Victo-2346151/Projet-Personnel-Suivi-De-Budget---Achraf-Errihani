import { appelApi, appelApiDelete, appelApiPost, appelApiPut } from './client';
import type { IResumeMois, ISolde, IStatistiqueMensuelle, ITransactionAvecCategorie } from '../types';

export interface IFiltresTransactions {
  categorieId?: number;
  dateDebut?: string;
  dateFin?: string;
  type?: 'revenu' | 'depense';
}

/**
 * Liste les transactions de l'utilisateur connecté, triées par date
 * décroissante, avec le nom de la catégorie associée. Les filtres
 * fournis (catégorie, date de début/fin, type) sont ajoutés à l'URL.
 */
export async function listerTransactions(
  filtres?: IFiltresTransactions
): Promise<ITransactionAvecCategorie[]> {
  const parametresUrl = new URLSearchParams();

  if (filtres?.categorieId !== undefined) {
    parametresUrl.set('categorieId', String(filtres.categorieId));
  }

  if (filtres?.dateDebut !== undefined && filtres.dateDebut !== '') {
    parametresUrl.set('dateDebut', filtres.dateDebut);
  }

  if (filtres?.dateFin !== undefined && filtres.dateFin !== '') {
    parametresUrl.set('dateFin', filtres.dateFin);
  }

  if (filtres?.type !== undefined) {
    parametresUrl.set('type', filtres.type);
  }

  const chaineParametres = parametresUrl.toString();

  return appelApi<ITransactionAvecCategorie[]>(
    chaineParametres === '' ? '/transactions' : `/transactions?${chaineParametres}`
  );
}

/**
 * Récupère le solde total (revenus moins dépenses) de l'utilisateur
 * connecté.
 */
export async function recupererSolde(): Promise<ISolde> {
  return appelApi<ISolde>('/transactions/solde');
}

/**
 * Récupère les totaux de revenus, de dépenses et le solde de
 * l'utilisateur connecté pour le mois calendaire courant uniquement.
 */
export async function recupererResumeMois(): Promise<IResumeMois> {
  return appelApi<IResumeMois>('/transactions/resumeMois');
}

/**
 * Récupère les totaux de revenus et de dépenses des 6 derniers mois de
 * l'utilisateur connecté, du plus ancien au plus récent.
 */
export async function recupererStatistiquesMensuelles(): Promise<IStatistiqueMensuelle[]> {
  return appelApi<IStatistiqueMensuelle[]>('/transactions/parMois');
}

/**
 * Crée une nouvelle transaction.
 */
export async function creerTransaction(
  categorieId: number,
  montant: number,
  type: 'revenu' | 'depense',
  description: string | null,
  dateTransaction: string
): Promise<ITransactionAvecCategorie> {
  return appelApiPost<ITransactionAvecCategorie>('/transactions', {
    categorieId,
    montant,
    type,
    description,
    dateTransaction,
  });
}

/**
 * Modifie une transaction existante.
 */
export async function modifierTransaction(
  id: number,
  categorieId: number,
  montant: number,
  type: 'revenu' | 'depense',
  description: string | null,
  dateTransaction: string
): Promise<ITransactionAvecCategorie> {
  return appelApiPut<ITransactionAvecCategorie>(`/transactions/${id}`, {
    categorieId,
    montant,
    type,
    description,
    dateTransaction,
  });
}

/**
 * Supprime une transaction.
 */
export async function supprimerTransaction(id: number): Promise<void> {
  return appelApiDelete(`/transactions/${id}`);
}
