import { appelApi, appelApiDelete, appelApiPost, appelApiPut } from './client';
import type { ISolde, ITransactionAvecCategorie } from '../types';

/**
 * Liste les transactions de l'utilisateur connecté, triées par date
 * décroissante, avec le nom de la catégorie associée.
 */
export async function listerTransactions(): Promise<ITransactionAvecCategorie[]> {
  return appelApi<ITransactionAvecCategorie[]>('/transactions');
}

/**
 * Récupère le solde total (revenus moins dépenses) de l'utilisateur
 * connecté.
 */
export async function recupererSolde(): Promise<ISolde> {
  return appelApi<ISolde>('/transactions/solde');
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
