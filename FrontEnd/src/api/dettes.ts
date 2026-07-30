import { appelApi, appelApiDelete, appelApiPost, appelApiPut } from './client';
import type { IDette, IResumeDettes } from '../types';

/**
 * Liste les dettes de l'utilisateur connecté, triées par statut (non
 * réglées en premier) puis par date de création décroissante.
 */
export async function listerDettes(): Promise<IDette[]> {
  return appelApi<IDette[]>('/dettes');
}

/**
 * Récupère le résumé des dettes non réglées : total que l'utilisateur
 * doit et total qu'on lui doit.
 */
export async function recupererResumeDettes(): Promise<IResumeDettes> {
  return appelApi<IResumeDettes>('/dettes/resume');
}

/**
 * Crée une nouvelle dette.
 */
export async function creerDette(
  personne: string,
  montant: number,
  direction: 'je_dois' | 'on_me_doit',
  description: string | null,
  dateCreation: string
): Promise<IDette> {
  return appelApiPost<IDette>('/dettes', { personne, montant, direction, description, dateCreation });
}

/**
 * Modifie une dette existante.
 */
export async function modifierDette(
  id: number,
  personne: string,
  montant: number,
  direction: 'je_dois' | 'on_me_doit',
  description: string | null,
  dateCreation: string
): Promise<IDette> {
  return appelApiPut<IDette>(`/dettes/${id}`, { personne, montant, direction, description, dateCreation });
}

/**
 * Change rapidement le statut d'une dette (Réglée / Non réglée).
 */
export async function changerStatutDette(id: number, statut: 'Réglée' | 'Non réglée'): Promise<IDette> {
  return appelApiPut<IDette>(`/dettes/${id}/statut`, { statut });
}

/**
 * Supprime une dette.
 */
export async function supprimerDette(id: number): Promise<void> {
  return appelApiDelete(`/dettes/${id}`);
}
