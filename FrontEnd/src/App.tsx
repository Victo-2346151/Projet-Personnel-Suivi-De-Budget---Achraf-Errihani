import { useEffect, useState } from 'react';
import { deconnecter, recupererUtilisateurConnecte } from './api/authentification';
import { IconeDeconnexion, IconeLune, IconePortefeuille, IconeSoleil } from './composantes/Icones';
import PageAuthentification from './pages/PageAuthentification';
import PageTableauDeBord from './pages/PageTableauDeBord';
import type { IUtilisateurSansMotDePasse } from './types';

type Theme = 'sombre' | 'clair';

const CLE_STOCKAGE_THEME = 'suiviBudget.theme';

/**
 * Détermine le thème initial : préférence déjà enregistrée par
 * l'utilisateur, sinon préférence système, sinon sombre par défaut.
 */
function themeInitial(): Theme {
  const themeStocke = window.localStorage.getItem(CLE_STOCKAGE_THEME);

  if (themeStocke === 'sombre' || themeStocke === 'clair') {
    return themeStocke;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'clair' : 'sombre';
}

/**
 * Composante racine de l'application.
 * Vérifie la session existante au démarrage, gère le thème
 * clair/sombre, puis affiche soit la page d'authentification, soit le
 * tableau de bord de l'utilisateur connecté.
 */
function App(): JSX.Element {
  const [utilisateurConnecte, setUtilisateurConnecte] = useState<IUtilisateurSansMotDePasse | null>(
    null
  );
  const [verificationTerminee, setVerificationTerminee] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(themeInitial);

  useEffect(() => {
    recupererUtilisateurConnecte()
      .then((utilisateur) => setUtilisateurConnecte(utilisateur))
      .catch(() => setUtilisateurConnecte(null))
      .finally(() => setVerificationTerminee(true));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(CLE_STOCKAGE_THEME, theme);
  }, [theme]);

  function basculerTheme(): void {
    setTheme((themeActuel) => (themeActuel === 'sombre' ? 'clair' : 'sombre'));
  }

  async function gererDeconnexion(): Promise<void> {
    await deconnecter();
    setUtilisateurConnecte(null);
  }

  const boutonTheme = (
    <button
      type="button"
      className="bouton-theme"
      onClick={basculerTheme}
      aria-label={theme === 'sombre' ? 'Activer le mode clair' : 'Activer le mode sombre'}
    >
      {theme === 'sombre' ? <IconeSoleil /> : <IconeLune />}
    </button>
  );

  if (!verificationTerminee) {
    return <div className="conteneur-page">Chargement...</div>;
  }

  if (utilisateurConnecte === null) {
    return (
      <div className="conteneur-page">
        <div className="bouton-theme-flottant">{boutonTheme}</div>
        <PageAuthentification auSucces={setUtilisateurConnecte} />
      </div>
    );
  }

  return (
    <div className="conteneur-page">
      <nav className="barre-navigation">
        <span className="marque-nav">
          <IconePortefeuille />
          <span>Suivi de Budget</span>
        </span>
        <div className="info-utilisateur">
          <span>Bonjour, {utilisateurConnecte.nom}</span>
          {boutonTheme}
          <button type="button" className="bouton bouton-secondaire" onClick={gererDeconnexion}>
            <IconeDeconnexion />
            Se déconnecter
          </button>
        </div>
      </nav>
      <div className="conteneur-tableau-de-bord">
        <PageTableauDeBord />
      </div>
    </div>
  );
}

export default App;
