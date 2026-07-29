import type { ITransactionAvecCategorie } from '../types';

interface IPropsListeTransactions {
  transactions: ITransactionAvecCategorie[];
  auClicModifier: (transaction: ITransactionAvecCategorie) => void;
  auClicSupprimer: (transaction: ITransactionAvecCategorie) => void;
}

/**
 * Affiche la liste des transactions de l'utilisateur (date, description,
 * catégorie, montant, type), avec des boutons pour modifier ou
 * supprimer chacune d'elles.
 */
function ListeTransactions({
  transactions,
  auClicModifier,
  auClicSupprimer,
}: IPropsListeTransactions): JSX.Element {
  if (transactions.length === 0) {
    return <p>Aucune transaction pour l&apos;instant.</p>;
  }

  return (
    <ul>
      {transactions.map((transaction) => (
        <li key={transaction.id}>
          {transaction.dateTransaction.slice(0, 10)} — {transaction.categorieNom}
          {transaction.description !== null && ` — ${transaction.description}`} —{' '}
          {transaction.type === 'revenu' ? '+' : '-'}
          {transaction.montant} $<button type="button" onClick={() => auClicModifier(transaction)}>
            Modifier
          </button>
          <button type="button" onClick={() => auClicSupprimer(transaction)}>
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ListeTransactions;
