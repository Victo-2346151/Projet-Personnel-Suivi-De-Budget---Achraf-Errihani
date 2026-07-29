import { useEffect, useState } from 'react';
import { appelApi } from '../api/client';

interface ReponseBonjour {
  message: string;
}

/**
 * Composante de démonstration "Hello World" pour l'audit de
 * l'environnement de développement (jour 2).
 * Va chercher le message de salutation auprès du backend et l'affiche.
 */
function Bonjour(): JSX.Element {
  const [message, setMessage] = useState<string>('Chargement...');

  useEffect(() => {
    appelApi<ReponseBonjour>('/bonjour')
      .then((donnees) => setMessage(donnees.message))
      .catch(() => setMessage('Erreur de connexion au serveur'));
  }, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
}

export default Bonjour;
