import 'express-session';

/**
 * Étend le type SessionData d'express-session pour y ajouter
 * l'identifiant de l'utilisateur actuellement connecté.
 */
declare module 'express-session' {
  interface SessionData {
    utilisateurId?: number;
  }
}
