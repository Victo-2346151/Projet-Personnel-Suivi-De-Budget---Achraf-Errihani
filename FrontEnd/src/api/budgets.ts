import { appelApi } from './client';
import type { IBudgetCategorie } from '../types';

/**
 * Récupère l'état d'utilisation du budget limite de chaque catégorie de
 * dépense de l'utilisateur connecté, pour le mois calendaire courant.
 */
export async function recupererBudgets(): Promise<IBudgetCategorie[]> {
  return appelApi<IBudgetCategorie[]>('/categories/budgets');
}
