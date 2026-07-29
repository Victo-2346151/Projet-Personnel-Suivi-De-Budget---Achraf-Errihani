import { NextFunction, Request, Response } from 'express';

/**
 * Middleware qui vérifie que l'utilisateur a une session active.
 * Retourne 401 si aucun utilisateur n'est connecté, sinon passe au
 * gestionnaire de route suivant.
 */
function estConnecte(requete: Request, reponse: Response, suivant: NextFunction): void {
  if (requete.session.utilisateurId === undefined) {
    reponse.status(401).json({ message: 'Vous devez être connecté.' });
    return;
  }

  suivant();
}

export default estConnecte;
