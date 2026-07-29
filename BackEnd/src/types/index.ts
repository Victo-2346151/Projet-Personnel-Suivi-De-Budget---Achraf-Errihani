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
