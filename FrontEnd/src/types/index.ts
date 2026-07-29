/**
 * Représente un utilisateur sans son mot de passe, tel que retourné
 * par le backend.
 */
export interface IUtilisateurSansMotDePasse {
  id: number;
  nom: string;
  courriel: string;
  dateCreation: string;
}
