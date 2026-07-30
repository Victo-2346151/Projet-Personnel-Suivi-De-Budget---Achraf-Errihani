import { FormEvent, useState } from 'react';
import { creerDette, modifierDette } from '../api/dettes';
import type { IDette } from '../types';

interface IPropsFormulaireDette {
  detteAModifier: IDette | null;
  auSucces: (dette: IDette) => void;
  auAnnuler: () => void;
}

/**
 * Formulaire de création ou de modification d'une dette.
 * Si `detteAModifier` est fourni, modifie cette dette ; sinon, en crée
 * une nouvelle.
 */
function FormulaireDette({ detteAModifier, auSucces, auAnnuler }: IPropsFormulaireDette): JSX.Element {
  const [personne, setPersonne] = useState<string>(detteAModifier?.personne ?? '');
  const [montant, setMontant] = useState<string>(
    detteAModifier !== null ? String(detteAModifier.montant) : ''
  );
  const [direction, setDirection] = useState<'je_dois' | 'on_me_doit'>(
    detteAModifier?.direction ?? 'je_dois'
  );
  const [description, setDescription] = useState<string>(detteAModifier?.description ?? '');
  const [dateCreation, setDateCreation] = useState<string>(
    detteAModifier !== null ? detteAModifier.dateCreation.slice(0, 10) : ''
  );
  const [messageErreur, setMessageErreur] = useState<string>('');

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>): Promise<void> {
    evenement.preventDefault();
    setMessageErreur('');

    if (personne === '' || montant === '' || dateCreation === '') {
      setMessageErreur('La personne, le montant et la date sont requis.');
      return;
    }

    const montantNombre = Number(montant);
    const descriptionFinale = description === '' ? null : description;

    try {
      const dette =
        detteAModifier === null
          ? await creerDette(personne, montantNombre, direction, descriptionFinale, dateCreation)
          : await modifierDette(
              detteAModifier.id,
              personne,
              montantNombre,
              direction,
              descriptionFinale,
              dateCreation
            );

      auSucces(dette);

      if (detteAModifier === null) {
        setPersonne('');
        setMontant('');
        setDescription('');
        setDateCreation('');
      }
    } catch (erreur) {
      setMessageErreur(erreur instanceof Error ? erreur.message : "Erreur lors de l'enregistrement.");
    }
  }

  return (
    <form onSubmit={gererEnvoi} className="carte carte-ombre-moyenne">
      <span className="carte-accroche">{detteAModifier === null ? 'Nouvelle dette' : 'Modifier la dette'}</span>
      <div className="champ-formulaire">
        <label htmlFor="personneDette">Personne</label>
        <input
          id="personneDette"
          type="text"
          placeholder="Ex. Julie"
          value={personne}
          onChange={(evenement) => setPersonne(evenement.target.value)}
        />
      </div>
      <div className="champ-formulaire">
        <label>Sens</label>
        <div className="segmente">
          <label className="segmente-option">
            <input
              type="radio"
              name="directionDette"
              checked={direction === 'je_dois'}
              onChange={() => setDirection('je_dois')}
            />
            Je dois
          </label>
          <label className="segmente-option">
            <input
              type="radio"
              name="directionDette"
              checked={direction === 'on_me_doit'}
              onChange={() => setDirection('on_me_doit')}
            />
            On me doit
          </label>
        </div>
      </div>
      <div className="grille-deux-colonnes">
        <div className="champ-formulaire">
          <label htmlFor="montantDette">Montant</label>
          <input
            id="montantDette"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={montant}
            onChange={(evenement) => setMontant(evenement.target.value)}
          />
        </div>
        <div className="champ-formulaire">
          <label htmlFor="dateCreationDette">Date</label>
          <input
            id="dateCreationDette"
            type="date"
            value={dateCreation}
            onChange={(evenement) => setDateCreation(evenement.target.value)}
          />
        </div>
      </div>
      <div className="champ-formulaire">
        <label htmlFor="descriptionDette">Description (optionnel)</label>
        <input
          id="descriptionDette"
          type="text"
          placeholder="Ex. Prêt pour le resto"
          value={description}
          onChange={(evenement) => setDescription(evenement.target.value)}
        />
      </div>
      {messageErreur !== '' && <p className="message-erreur">{messageErreur}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="bouton bouton-primaire">
          {detteAModifier === null ? 'Créer' : 'Enregistrer'}
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={auAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default FormulaireDette;
