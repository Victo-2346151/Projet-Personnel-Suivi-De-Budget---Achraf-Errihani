import { FormEvent, useState } from 'react';
import { inscrire } from '../api/authentification';
import type { IUtilisateurSansMotDePasse } from '../types';

interface IPropsFormulaireInscription {
  auSucces: (utilisateur: IUtilisateurSansMotDePasse) => void;
}

/**
 * Formulaire d'inscription d'un nouvel utilisateur.
 * Affiche les erreurs de validation ou celles renvoyées par le serveur.
 */
function FormulaireInscription({ auSucces }: IPropsFormulaireInscription): JSX.Element {
  const [nom, setNom] = useState<string>('');
  const [courriel, setCourriel] = useState<string>('');
  const [motDePasse, setMotDePasse] = useState<string>('');
  const [messageErreur, setMessageErreur] = useState<string>('');

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>): Promise<void> {
    evenement.preventDefault();
    setMessageErreur('');

    if (nom === '' || courriel === '' || motDePasse === '') {
      setMessageErreur('Tous les champs sont requis.');
      return;
    }

    try {
      const utilisateur = await inscrire(nom, courriel, motDePasse);
      auSucces(utilisateur);
    } catch (erreur) {
      setMessageErreur(erreur instanceof Error ? erreur.message : "Erreur lors de l'inscription.");
    }
  }

  return (
    <form onSubmit={gererEnvoi}>
      <div className="champ-formulaire">
        <label htmlFor="nom">Nom</label>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(evenement) => setNom(evenement.target.value)}
        />
      </div>
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
        S&apos;inscrire
      </button>
    </form>
  );
}

export default FormulaireInscription;
