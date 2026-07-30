/**
 * Représente un utilisateur tel qu'il est stocké dans la base de données,
 * avec son mot de passe haché.
 */
export interface IUtilisateur {
  id: number;
  nom: string;
  courriel: string;
  motDePasse: string;
  dateCreation: Date;
}

/**
 * Représente un utilisateur sans son mot de passe, pour ne jamais
 * renvoyer le mot de passe haché au frontend.
 */
export interface IUtilisateurSansMotDePasse {
  id: number;
  nom: string;
  courriel: string;
  dateCreation: Date;
}

/**
 * Représente une catégorie de revenu ou de dépense appartenant à un
 * utilisateur.
 */
export interface ICategorie {
  id: number;
  utilisateurId: number;
  nom: string;
  type: 'revenu' | 'depense';
  budgetLimite: number | null;
}

/**
 * Représente une transaction (revenu ou dépense) enregistrée par un
 * utilisateur.
 */
export interface ITransaction {
  id: number;
  utilisateurId: number;
  categorieId: number;
  montant: number;
  type: 'revenu' | 'depense';
  description: string | null;
  dateTransaction: Date;
}

/**
 * Représente une transaction accompagnée du nom de sa catégorie, tel
 * que renvoyé par GET /api/transactions (évite un aller-retour
 * supplémentaire pour récupérer le nom de la catégorie).
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
  dateCreation: Date;
  statut: 'Réglée' | 'Non réglée';
}

/**
 * Représente le résumé des dettes non réglées d'un utilisateur.
 */
export interface IResumeDettes {
  totalJeDois: number;
  totalOnMeDoit: number;
}
