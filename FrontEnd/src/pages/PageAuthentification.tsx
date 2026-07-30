import { useState } from 'react';
import FormulaireConnexion from '../composantes/FormulaireConnexion';
import FormulaireInscription from '../composantes/FormulaireInscription';
import { IconePortefeuille } from '../composantes/Icones';
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

  return (
    <div className="page-authentification">
      <div className="conteneur-auth">
        <div className="marque-auth">
          <IconePortefeuille taille={22} />
          <span>Suivi de Budget</span>
        </div>

        <div className="carte carte-ombre-forte carte-auth">
          {modeInscription ? (
            <>
              <div>
                <h1>Créer un compte</h1>
                <p className="texte-attenue sous-titre">
                  Suivez vos revenus et dépenses en un coup d&apos;œil.
                </p>
              </div>
              <FormulaireInscription auSucces={auSucces} />
              <p className="bascule-auth">
                Déjà un compte ?{' '}
                <button
                  type="button"
                  className="bouton bouton-fantome"
                  onClick={() => setModeInscription(false)}
                >
                  Connectez-vous
                </button>
              </p>
            </>
          ) : (
            <>
              <div>
                <h1>Bon retour</h1>
                <p className="texte-attenue sous-titre">Connectez-vous pour retrouver votre budget.</p>
              </div>
              <FormulaireConnexion auSucces={auSucces} />
              <p className="bascule-auth">
                Pas de compte ?{' '}
                <button
                  type="button"
                  className="bouton bouton-fantome"
                  onClick={() => setModeInscription(true)}
                >
                  Inscrivez-vous
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PageAuthentification;
