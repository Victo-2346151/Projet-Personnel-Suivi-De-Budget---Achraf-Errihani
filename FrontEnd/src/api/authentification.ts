import { appelApi, appelApiPost } from './client';
import type { IUtilisateurSansMotDePasse } from '../types';

/**
 * Inscrit un nouvel utilisateur et ouvre sa session.
 */
export async function inscrire(
  nom: string,
  courriel: string,
  motDePasse: string
): Promise<IUtilisateurSansMotDePasse> {
  return appelApiPost<IUtilisateurSansMotDePasse>('/inscription', { nom, courriel, motDePasse });
}

/**
 * Connecte un utilisateur existant et ouvre sa session.
 */
export async function connecter(
  courriel: string,
  motDePasse: string
): Promise<IUtilisateurSansMotDePasse> {
  return appelApiPost<IUtilisateurSansMotDePasse>('/connexion', { courriel, motDePasse });
}

/**
 * Déconnecte l'utilisateur actuellement connecté.
 */
export async function deconnecter(): Promise<void> {
  return appelApiPost<void>('/deconnexion');
}

/**
 * Récupère l'utilisateur actuellement connecté à partir de la session,
 * ou lance une erreur si personne n'est connecté.
 */
export async function recupererUtilisateurConnecte(): Promise<IUtilisateurSansMotDePasse> {
  return appelApi<IUtilisateurSansMotDePasse>('/moi');
}
