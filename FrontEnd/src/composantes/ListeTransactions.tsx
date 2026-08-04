import { IconeCorbeille, IconeCrayon, IconeRecu } from './Icones';
import { formaterDate, formaterMontant } from '../utils/formatage';
import type { ITransactionAvecCategorie } from '../types';

interface IPropsListeTransactions {
  transactions: ITransactionAvecCategorie[];
  aucuneCategorie: boolean;
  auClicModifier: (transaction: ITransactionAvecCategorie) => void;
  auClicSupprimer: (transaction: ITransactionAvecCategorie) => void;
  auClicNouvelle: () => void;
}

/**
 * Affiche les transactions de l'utilisateur (date, description,
 * catégorie, montant, type) sous forme de tableau, triées par date
 * décroissante, avec des boutons pour modifier ou supprimer.
 */
function ListeTransactions({
  transactions,
  aucuneCategorie,
  auClicModifier,
  auClicSupprimer,
  auClicNouvelle,
}: IPropsListeTransactions): JSX.Element {
  if (transactions.length === 0) {
    return (
      <div className="carte carte-ombre-legere etat-vide">
        <IconeRecu />
        <span className="carte-titre">Aucune transaction</span>
        <p className="carte-texte">
          {aucuneCategorie
            ? "Créez une catégorie avant d'ajouter une transaction."
            : 'Ajoutez votre première transaction pour commencer le suivi.'}
        </p>
        {!aucuneCategorie && (
          <button type="button" className="bouton bouton-primaire" onClick={auClicNouvelle}>
            Ajouter une transaction
          </button>
        )}
      </div>
    );
  }

  const transactionsTriees = [...transactions].sort((a, b) =>
    b.dateTransaction.localeCompare(a.dateTransaction)
  );

  return (
    <table className="tableau">
      <thead>
        <tr>
          <th>Description</th>
          <th>Catégorie</th>
          <th>Date</th>
          <th style={{ textAlign: 'right' }}>Montant</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {transactionsTriees.map((transaction) => (
          <tr key={transaction.id}>
            <td>{transaction.description ?? '—'}</td>
            <td>
              <span
                className={`etiquette ${
                  transaction.type === 'revenu' ? 'etiquette-accent' : 'etiquette-neutre'
                }`}
              >
                {transaction.categorieNom}
              </span>
            </td>
            <td className="texte-attenue">{formaterDate(transaction.dateTransaction)}</td>
            <td
              style={{
                textAlign: 'right',
                color:
                  transaction.type === 'revenu'
                    ? 'var(--couleur-montant-revenu)'
                    : 'var(--couleur-montant-depense)',
              }}
            >
              {transaction.type === 'revenu' ? '+ ' : '− '}
              {formaterMontant(transaction.montant)}
            </td>
            <td>
              <div className="actions-ligne">
                <button
                  type="button"
                  className="bouton bouton-icone bouton-fantome"
                  onClick={() => auClicModifier(transaction)}
                  aria-label="Modifier"
                >
                  <IconeCrayon taille={14} />
                </button>
                <button
                  type="button"
                  className="bouton bouton-icone bouton-fantome"
                  onClick={() => {
                    if (window.confirm('Supprimer cette transaction ?')) {
                      auClicSupprimer(transaction);
                    }
                  }}
                  aria-label="Supprimer"
                >
                  <IconeCorbeille taille={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ListeTransactions;
