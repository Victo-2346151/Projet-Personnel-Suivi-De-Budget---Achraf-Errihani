import { FormEvent, useState } from 'react';
import { creerCategorie, modifierCategorie } from '../api/categories';
import type { ICategorie } from '../types';

interface IPropsFormulaireCategorie {
  categorieAModifier: ICategorie | null;
  auSucces: (categorie: ICategorie) => void;
}

/**
 * Formulaire de création ou de modification d'une catégorie.
 * Si `categorieAModifier` est fourni, modifie cette catégorie ; sinon,
 * en crée une nouvelle.
 */
function FormulaireCategorie({ categorieAModifier, auSucces }: IPropsFormulaireCategorie): JSX.Element {
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
    <form onSubmit={gererEnvoi}>
      <div>
        <label htmlFor="nomCategorie">Nom</label>
        <input
          id="nomCategorie"
          type="text"
          value={nom}
          onChange={(evenement) => setNom(evenement.target.value)}
        />
      </div>
      <div>
        <label htmlFor="typeCategorie">Type</label>
        <select
          id="typeCategorie"
          value={type}
          onChange={(evenement) => setType(evenement.target.value === 'revenu' ? 'revenu' : 'depense')}
        >
          <option value="depense">Dépense</option>
          <option value="revenu">Revenu</option>
        </select>
      </div>
      <div>
        <label htmlFor="budgetLimiteCategorie">Budget limite (optionnel)</label>
        <input
          id="budgetLimiteCategorie"
          type="number"
          value={budgetLimite}
          onChange={(evenement) => setBudgetLimite(evenement.target.value)}
        />
      </div>
      {messageErreur !== '' && <p>{messageErreur}</p>}
      <button type="submit">{categorieAModifier === null ? 'Créer' : 'Enregistrer'}</button>
    </form>
  );
}

export default FormulaireCategorie;
