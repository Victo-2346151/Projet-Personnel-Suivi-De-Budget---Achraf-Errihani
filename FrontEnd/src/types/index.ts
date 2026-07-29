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

/**
 * Représente une catégorie de revenu ou de dépense appartenant à
 * l'utilisateur connecté.
 */
export interface ICategorie {
  id: number;
  utilisateurId: number;
  nom: string;
  type: 'revenu' | 'depense';
  budgetLimite: number | null;
}
