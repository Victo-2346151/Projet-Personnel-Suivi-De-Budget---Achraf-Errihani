import { FormEvent, useState } from 'react';
import { creerTransaction, modifierTransaction } from '../api/transactions';
import type { ICategorie, ITransactionAvecCategorie } from '../types';

interface IPropsFormulaireTransaction {
  categories: ICategorie[];
  transactionAModifier: ITransactionAvecCategorie | null;
  auSucces: (transaction: ITransactionAvecCategorie) => void;
}

/**
 * Formulaire de création ou de modification d'une transaction.
 * Si `transactionAModifier` est fourni, modifie cette transaction ;
 * sinon, en crée une nouvelle. Le menu déroulant des catégories est
 * alimenté par les catégories existantes de l'utilisateur.
 */
function FormulaireTransaction({
  categories,
  transactionAModifier,
  auSucces,
}: IPropsFormulaireTransaction): JSX.Element {
  const [categorieId, setCategorieId] = useState<string>(
    transactionAModifier !== null ? String(transactionAModifier.categorieId) : ''
  );
  const [montant, setMontant] = useState<string>(
    transactionAModifier !== null ? String(transactionAModifier.montant) : ''
  );
  const [type, setType] = useState<'revenu' | 'depense'>(transactionAModifier?.type ?? 'depense');
  const [description, setDescription] = useState<string>(transactionAModifier?.description ?? '');
  const [dateTransaction, setDateTransaction] = useState<string>(
    transactionAModifier !== null ? transactionAModifier.dateTransaction.slice(0, 10) : ''
  );
  const [messageErreur, setMessageErreur] = useState<string>('');

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>): Promise<void> {
    evenement.preventDefault();
    setMessageErreur('');

    if (categorieId === '' || montant === '' || dateTransaction === '') {
      setMessageErreur('La catégorie, le montant et la date sont requis.');
      return;
    }

    const categorieIdNombre = Number(categorieId);
    const montantNombre = Number(montant);
    const descriptionFinale = description === '' ? null : description;

    try {
      const transaction =
        transactionAModifier === null
          ? await creerTransaction(categorieIdNombre, montantNombre, type, descriptionFinale, dateTransaction)
          : await modifierTransaction(
              transactionAModifier.id,
              categorieIdNombre,
              montantNombre,
              type,
              descriptionFinale,
              dateTransaction
            );

      auSucces(transaction);

      if (transactionAModifier === null) {
        setCategorieId('');
        setMontant('');
        setDescription('');
        setDateTransaction('');
      }
    } catch (erreur) {
      setMessageErreur(erreur instanceof Error ? erreur.message : "Erreur lors de l'enregistrement.");
    }
  }

  return (
    <form onSubmit={gererEnvoi}>
      <div>
        <label htmlFor="categorieTransaction">Catégorie</label>
        <select
          id="categorieTransaction"
          value={categorieId}
          onChange={(evenement) => setCategorieId(evenement.target.value)}
        >
          <option value="">-- Choisir --</option>
          {categories.map((categorie) => (
            <option key={categorie.id} value={categorie.id}>
              {categorie.nom} ({categorie.type === 'revenu' ? 'Revenu' : 'Dépense'})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="typeTransaction">Type</label>
        <select
          id="typeTransaction"
          value={type}
          onChange={(evenement) => setType(evenement.target.value === 'revenu' ? 'revenu' : 'depense')}
        >
          <option value="depense">Dépense</option>
          <option value="revenu">Revenu</option>
        </select>
      </div>
      <div>
        <label htmlFor="montantTransaction">Montant</label>
        <input
          id="montantTransaction"
          type="number"
          value={montant}
          onChange={(evenement) => setMontant(evenement.target.value)}
        />
      </div>
      <div>
        <label htmlFor="descriptionTransaction">Description (optionnel)</label>
        <input
          id="descriptionTransaction"
          type="text"
          value={description}
          onChange={(evenement) => setDescription(evenement.target.value)}
        />
      </div>
      <div>
        <label htmlFor="dateTransactionChamp">Date</label>
        <input
          id="dateTransactionChamp"
          type="date"
          value={dateTransaction}
          onChange={(evenement) => setDateTransaction(evenement.target.value)}
        />
      </div>
      {messageErreur !== '' && <p>{messageErreur}</p>}
      <button type="submit">{transactionAModifier === null ? 'Créer' : 'Enregistrer'}</button>
    </form>
  );
}

export default FormulaireTransaction;
