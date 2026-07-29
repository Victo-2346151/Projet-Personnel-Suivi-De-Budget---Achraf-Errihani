import { useState } from 'react';
import FormulaireConnexion from '../composantes/FormulaireConnexion';
import FormulaireInscription from '../composantes/FormulaireInscription';
import type { IUtilisateurSansMotDePasse } from '../types';

interface IPropsPageAuthentification {
  auSucces: (utilisateur: IUtilisateurSansMotDePasse) => void;
}

/**
 * Page d'authentification qui affiche soit le formulaire de connexion,
 * soit le formulaire d'inscription, avec un lien pour basculer entre les deux.
 */
function PageAuthentification({ auSucces }: IPropsPageAuthentification): JSX.Element {
  const [modeInscription, setModeInscription] = useState<boolean>(false);

  if (modeInscription) {
    return (
      <div>
        <h1>Inscription</h1>
        <FormulaireInscription auSucces={auSucces} />
        <p>
          Déjà un compte ?{' '}
          <button type="button" onClick={() => setModeInscription(false)}>
            Connectez-vous
          </button>
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1>Connexion</h1>
      <FormulaireConnexion auSucces={auSucces} />
      <p>
        Pas de compte ?{' '}
        <button type="button" onClick={() => setModeInscription(true)}>
          Inscrivez-vous
        </button>
      </p>
    </div>
  );
}

export default PageAuthentification;
