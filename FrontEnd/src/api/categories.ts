import { appelApi, appelApiDelete, appelApiPost, appelApiPut } from './client';
import type { ICategorie } from '../types';

/**
 * Liste les catégories de l'utilisateur connecté.
 */
export async function listerCategories(): Promise<ICategorie[]> {
  return appelApi<ICategorie[]>('/categories');
}

/**
 * Crée une nouvelle catégorie.
 */
export async function creerCategorie(
  nom: string,
  type: 'revenu' | 'depense',
  budgetLimite: number | null
): Promise<ICategorie> {
  return appelApiPost<ICategorie>('/categories', { nom, type, budgetLimite });
}

/**
 * Modifie une catégorie existante.
 */
export async function modifierCategorie(
  id: number,
  nom: string,
  type: 'revenu' | 'depense',
  budgetLimite: number | null
): Promise<ICategorie> {
  return appelApiPut<ICategorie>(`/categories/${id}`, { nom, type, budgetLimite });
}

/**
 * Supprime une catégorie.
 */
export async function supprimerCategorie(id: number): Promise<void> {
  return appelApiDelete(`/categories/${id}`);
}
