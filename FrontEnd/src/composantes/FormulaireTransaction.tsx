import { FormEvent, useState } from 'react';
import { creerTransaction, modifierTransaction } from '../api/transactions';
import type { ICategorie, ITransactionAvecCategorie } from '../types';

interface IPropsFormulaireTransaction {
  categories: ICategorie[];
  transactionAModifier: ITransactionAvecCategorie | null;
  auSucces: (transaction: ITransactionAvecCategorie) => void;
  auAnnuler: () => void;
}

/**
 * Formulaire de création ou de modification d'une transaction.
 * Le type (revenu/dépense) est déterminé automatiquement par la
 * catégorie choisie, regroupées par type dans le menu déroulant.
 */
function FormulaireTransaction({
  categories,
  transactionAModifier,
  auSucces,
  auAnnuler,
}: IPropsFormulaireTransaction): JSX.Element {
  const [categorieId, setCategorieId] = useState<string>(
    transactionAModifier !== null ? String(transactionAModifier.categorieId) : ''
  );
  const [montant, setMontant] = useState<string>(
    transactionAModifier !== null ? String(transactionAModifier.montant) : ''
  );
  const [description, setDescription] = useState<string>(transactionAModifier?.description ?? '');
  const [dateTransaction, setDateTransaction] = useState<string>(
    transactionAModifier !== null ? transactionAModifier.dateTransaction.slice(0, 10) : ''
  );
  const [messageErreur, setMessageErreur] = useState<string>('');

  const categoriesRevenu = categories.filter((categorie) => categorie.type === 'revenu');
  const categoriesDepense = categories.filter((categorie) => categorie.type === 'depense');

  async function gererEnvoi(evenement: FormEvent<HTMLFormElement>): Promise<void> {
    evenement.preventDefault();
    setMessageErreur('');

    if (categorieId === '' || montant === '' || dateTransaction === '') {
      setMessageErreur('La catégorie, le montant et la date sont requis.');
      return;
    }

    const categorieChoisie = categories.find((categorie) => categorie.id === Number(categorieId));

    if (categorieChoisie === undefined) {
      setMessageErreur('Catégorie invalide.');
      return;
    }

    const montantNombre = Number(montant);
    const descriptionFinale = description === '' ? null : description;

    try {
      const transaction =
        transactionAModifier === null
          ? await creerTransaction(
              categorieChoisie.id,
              montantNombre,
              categorieChoisie.type,
              descriptionFinale,
              dateTransaction
            )
          : await modifierTransaction(
              transactionAModifier.id,
              categorieChoisie.id,
              montantNombre,
              categorieChoisie.type,
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
    <form onSubmit={gererEnvoi} className="carte carte-ombre-moyenne">
      <span className="carte-accroche">
        {transactionAModifier === null ? 'Nouvelle transaction' : 'Modifier la transaction'}
      </span>
      <div className="grille-deux-colonnes">
        <div className="champ-formulaire">
          <label htmlFor="montantTransaction">Montant</label>
          <input
            id="montantTransaction"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={montant}
            onChange={(evenement) => setMontant(evenement.target.value)}
          />
        </div>
        <div className="champ-formulaire">
          <label htmlFor="dateTransactionChamp">Date</label>
          <input
            id="dateTransactionChamp"
            type="date"
            value={dateTransaction}
            onChange={(evenement) => setDateTransaction(evenement.target.value)}
          />
        </div>
      </div>
      <div className="champ-formulaire">
        <label htmlFor="categorieTransaction">Catégorie</label>
        <select
          id="categorieTransaction"
          value={categorieId}
          onChange={(evenement) => setCategorieId(evenement.target.value)}
        >
          <option value="">Choisir…</option>
          <optgroup label="Revenus">
            {categoriesRevenu.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </optgroup>
          <optgroup label="Dépenses">
            {categoriesDepense.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </optgroup>
        </select>
      </div>
      <div className="champ-formulaire">
        <label htmlFor="descriptionTransaction">Description (optionnel)</label>
        <input
          id="descriptionTransaction"
          type="text"
          placeholder="Ex. Épicerie semaine"
          value={description}
          onChange={(evenement) => setDescription(evenement.target.value)}
        />
      </div>
      {messageErreur !== '' && <p className="message-erreur">{messageErreur}</p>}
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="bouton bouton-primaire">
          {transactionAModifier === null ? 'Créer' : 'Enregistrer'}
        </button>
        <button type="button" className="bouton bouton-secondaire" onClick={auAnnuler}>
          Annuler
        </button>
      </div>
    </form>
  );
}

export default FormulaireTransaction;
