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

/**
 * Représente une transaction (revenu ou dépense) telle que retournée
 * par le backend.
 */
export interface ITransaction {
  id: number;
  utilisateurId: number;
  categorieId: number;
  montant: number;
  type: 'revenu' | 'depense';
  description: string | null;
  dateTransaction: string;
}

/**
 * Représente une transaction accompagnée du nom de sa catégorie.
 */
export interface ITransactionAvecCategorie extends ITransaction {
  categorieNom: string;
}

/**
 * Représente le solde total (revenus moins dépenses) d'un utilisateur.
 */
export interface ISolde {
  solde: number;
}

/**
 * Représente une dette personnelle : de l'argent que l'utilisateur
 * doit à quelqu'un, ou que quelqu'un lui doit.
 */
export interface IDette {
  id: number;
  utilisateurId: number;
  personne: string;
  montant: number;
  direction: 'je_dois' | 'on_me_doit';
  description: string | null;
  dateCreation: string;
  statut: 'Réglée' | 'Non réglée';
}

/**
 * Représente le résumé des dettes non réglées d'un utilisateur.
 */
export interface IResumeDettes {
  totalJeDois: number;
  totalOnMeDoit: number;
}
