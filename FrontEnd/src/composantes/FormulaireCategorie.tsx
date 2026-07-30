import { FormEvent, useState } from 'react';
import { creerCategorie, modifierCategorie } from '../api/categories';
import type { ICategorie } from '../types';

interface IPropsFormulaireCategorie {
  categorieAModifier: ICategorie | null;
  auSucces: (categorie: ICategorie) => void;
  auAnnuler: () => void;
}

/**
 * Formulaire de création ou de modification d'une catégorie.
 * Si `categorieAModifier` est fourni, modifie cette catégorie ; sinon,
 * en crée une nouvelle.
 */
function FormulaireCategorie({
  categorieAModifier,
  auSucces,
  auAnnuler,
}: IPropsFormulaireCategorie): JSX.Element {
  const [nom, setNom] = useState<string>(categorieAModifier?.nom ?? '');
  const [type, setType] = useState<'revenu' | 'depense'>(categorieAModifier?.type ?? 'depense');
  const [budgetLimite, setBudgetLimite] = useState<string>(
    categorieAModifier?.budgetLimite === null || categorieAModifier?.budgetLimite === undefined
      ? ''
      : String(categorieAModifier.budgetLimite)
  );
  const [messageErreur, setMessageErreur] = useState<string>('');

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>): Promise<void> {
    evenement.preventDefault();
    setMessageErreur('');

    if (nom === '') {
      setMessageErreur('Le nom est requis.');
      return;
    }

    const budgetLimiteNombre = budgetLimite === '' ? null : Number(budgetLimite);

    try {
      const categorie =
        categorieAModifier === null
          ? await creerCategorie(nom, type, budgetLimiteNombre)
          : await modifierCategorie(categorieAModifier.id, nom, type, budgetLimiteNombre);

      auSucces(categorie);

      if (categorieAModifier === null) {
        setNom('');
        setBudgetLimite('');
      }
    } catch (erreur) {
      setMessageErreur(erreur instanceof Error ? erreur.message : "Erreur lors de l'enregistrement.");
    }
  }

  return (
    <form onSubmit={gererEnvoi} className="carte carte-ombre-moyenne">
      <span className="carte-accroche">
        {categorieAModifier === null ? 'Nouvelle catégorie' : 'Modifier la catégorie'}
      </span>
      <div className="champ-formulaire">
        <label htmlFor="nomCategorie">Nom</label>
        <input
          id="nomCategorie"
          type="text"
          placeholder="Ex. Épicerie"
          value={nom}
          onChange={(evenement) => setNom(evenement.target.value)}
        />
      </div>
      <div className="champ-formulaire">
        <label>Type</label>
        <div className="segmente">
          <label className="segmente-option">
            <input
              type="radio"
              name="typeCategorie"
              checked={type === 'depense'}
              onChange={() => setType('depense')}
            />
            Dépense
          </label>
          <label className="segmente-option">
            <input
              type="radio"
              name="typeCategorie"
              checked={type === 'revenu'}
              onChange={() => setType('revenu')}
            />
            Revenu
          </label>
        </div>
      </div>
      <div className="champ-formulaire">
        <label htmlFor="budgetLimiteCategorie">Budget limite (optionnel)</label>
        <input
          id="budgetLimiteCategorie"
          type="number"
          min="0"
          step="0.01"
          value={budgetLimite}
          onChange={(evenement) => setBudgetLimite(evenement.target.value)}
        />
      </div>
      {messageErreur !== '' && <p className="message-erreur">{messageErreur}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="bouton bouton-primaire">
          {categorieAModifier === null ? 'Créer' : 'Enregistrer'}
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={auAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default FormulaireCategorie;
