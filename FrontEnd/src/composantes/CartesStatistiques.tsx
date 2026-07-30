import { formaterMontant } from '../utils/formatage';
import { IconePortefeuille, IconeTendanceBaisse, IconeTendanceHausse } from './Icones';

interface IPropsCartesStatistiques {
  solde: number;
  totalRevenus: number;
  totalDepenses: number;
  nbTransactionsRevenu: number;
  nbTransactionsDepense: number;
}

/**
 * Affiche les trois cartes statistiques du tableau de bord : solde
 * total (vert s'il est positif ou nul, rouge s'il est négatif),
 * revenus et dépenses.
 */
function CartesStatistiques({
  solde,
  totalRevenus,
  totalDepenses,
  nbTransactionsRevenu,
  nbTransactionsDepense,
}: IPropsCartesStatistiques): JSX.Element {
  const couleurSolde = solde >= 0 ? 'var(--couleur-solde-positif)' : 'var(--couleur-solde-negatif)';

  return (
    <div className="grille-stats">
      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">Solde total</span>
        <span className="carte-valeur" style={{ color: couleurSolde }}>
          {formaterMontant(solde)}
        </span>
        <span className="carte-meta">
          <IconePortefeuille taille={14} />
          Revenus moins dépenses
        </span>
      </div>

      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">Revenus</span>
        <span className="carte-valeur" style={{ color: 'var(--couleur-montant-revenu)' }}>
          {formaterMontant(totalRevenus)}
        </span>
        <span className="carte-meta">
          <IconeTendanceHausse />
          {nbTransactionsRevenu} transaction{nbTransactionsRevenu > 1 ? 's' : ''}
        </span>
      </div>

      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">Dépenses</span>
        <span className="carte-valeur">{formaterMontant(totalDepenses)}</span>
        <span className="carte-meta">
          <IconeTendanceBaisse />
          {nbTransactionsDepense} transaction{nbTransactionsDepense > 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}

export default CartesStatistiques;
