import { useEffect, useState } from 'react';
import { deconnecter, recupererUtilisateurConnecte } from './api/authentification';
import PageAuthentification from './pages/PageAuthentification';
import type { IUtilisateurSansMotDePasse } from './types';

/**
 * Composante racine de l'application.
 * Vérifie la session existante au démarrage, puis affiche soit la page
 * d'authentification, soit un écran simple pour l'utilisateur connecté.
 */
function App(): JSX.Element {
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<IUtilisateurSansMotDePasse | null>(
    null
  );
  const [verificationTerminee, setVerificationTerminee] = useState<boolean>(false);

  useEffect(() => {
    recupererUtilisateurConnecte()
      .then((utilisateur) => setUtilisateurConnecte(utilisateur))
      .catch(() => setUtilisateurConnecte(null))
      .finally(() => setVerificationTerminee(true));
  }, []);

  async function gererDeconnexion(): Promise<void> {
    await deconnecter();
    setUtilisateurConnecte(null);
  }

  if (!verificationTerminee) {
    return <div>Chargement...</div>;
  }

  if (utilisateurConnecte === null) {
    return <PageAuthentification auSucces={setUtilisateurConnecte} />;
  }

  return (
    <div>
      <h1>Bienvenue, {utilisateurConnecte.nom}!</h1>
      <button type="button" onClick={gererDeconnexion}>
        Se déconnecter
      </button>
    </div>
  );
}

export default App;
