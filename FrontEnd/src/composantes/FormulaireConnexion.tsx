import { FormEvent, useState } from 'react';
import { connecter } from '../api/authentification';
import type { IUtilisateurSansMotDePasse } from '../types';

interface IPropsFormulaireConnexion {
  auSucces: (utilisateur: IUtilisateurSansMotDePasse) => void;
}

/**
 * Formulaire de connexion d'un utilisateur existant.
 * Affiche les erreurs de validation ou celles renvoyées par le serveur.
 */
function FormulaireConnexion({ auSucces }: IPropsFormulaireConnexion): JSX.Element {
  const [courriel, setCourriel] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [messageErreur, setMessageErreur] = useState<string>('');

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>): Promise<void> {
    evenement.preventDefault();
    setMessageErreur('');

    if (courriel === '' || motDePasse === '') {
      setMessageErreur('Tous les champs sont requis.');
      return;
    }

    try {
      const utilisateur = await connecter(courriel, motDePasse);
      auSucces(utilisateur);
    } catch (erreur) {
      setMessageErreur(erreur instanceof Error ? erreur.message : 'Erreur lors de la connexion.');
    }
  }

  return (
    <form onSubmit={gererEnvoi}>
      <div className="champ-formulaire">
        <label htmlFor="courriel">Courriel</label>
        <input
          id="courriel"
          type="email"
          value={courriel}
          onChange={(evenement) => setCourriel(evenement.target.value)}
        />
      </div>
      <div className="champ-formulaire">
        <label htmlFor="motDePasse">Mot de passe</label>
        <input
          id="motDePasse"
          type="password"
          value={motDePasse}
          onChange={(evenement) => setMotDePasse(evenement.target.value)}
        />
      </div>
      {messageErreur !== '' && <p className="message-erreur">{messageErreur}</p>}
      <button type="submit" className="bouton bouton-primaire bouton-pleine-largeur">
        Se connecter
      </button>
    </form>
  );
}

export default FormulaireConnexion;
