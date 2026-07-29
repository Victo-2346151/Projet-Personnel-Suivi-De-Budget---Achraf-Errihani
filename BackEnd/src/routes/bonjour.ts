import { Router } from 'express';

const routeurBonjour = Router();

/**
 * Route "Hello World"
 * Retourne un simple message de salutation.
 */
routeurBonjour.get('/bonjour', (_requete, reponse) => {
  reponse.json({ message: 'Hello World!' });
});

export default routeurBonjour;
