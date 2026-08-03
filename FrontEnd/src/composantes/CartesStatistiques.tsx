import { formaterMontant } from '../utils/formatage';
import { IconePortefeuille, IconeRecu, IconeTendanceBaisse, IconeTendanceHausse } from './Icones';
import type { IResumeMois } from '../types';

interface IPropsCartesStatistiques {
  solde: number;
  totalRevenus: number;
  totalDepenses: number;
  nbTransactionsRevenu: number;
  nbTransactionsDepense: number;
  totalJeDois: number;
  totalOnMeDoit: number;
  resumeMois: IResumeMois;
}

/**
 * Affiche les cartes statistiques du tableau de bord : solde total
 * (vert s'il est positif ou nul, rouge s'il est négatif), revenus,
 * dépenses, solde des dettes et résumé du mois calendaire courant.
 */
function CartesStatistiques({
  solde,
  totalRevenus,
  totalDepenses,
  nbTransactionsRevenu,
  nbTransactionsDepense,
  totalJeDois,
  totalOnMeDoit,
  resumeMois,
}: IPropsCartesStatistiques): JSX.Element {
  const couleurSolde = solde >= 0 ? 'var(--couleur-solde-positif)' : 'var(--couleur-solde-negatif)';
  const soldeDettes = totalOnMeDoit - totalJeDois;
  const couleurSoldeDettes =
    soldeDettes >= 0 ? 'var(--couleur-solde-positif)' : 'var(--couleur-solde-negatif)';
  const couleurSoldeMois =
    resumeMois.solde >= 0 ? 'var(--couleur-solde-positif)' : 'var(--couleur-solde-negatif)';

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

      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">Ce mois-ci</span>
        <span className="carte-valeur" style={{ color: couleurSoldeMois }}>
          {formaterMontant(resumeMois.solde)}
        </span>
        <span className="carte-meta">
          <IconePortefeuille taille={14} />
          {formaterMontant(resumeMois.totalRevenus)} revenus · {formaterMontant(resumeMois.totalDepenses)}{' '}
          dépenses
        </span>
      </div>

      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">Solde des dettes</span>
        <span className="carte-valeur" style={{ color: couleurSoldeDettes }}>
          {formaterMontant(soldeDettes)}
        </span>
        <span className="carte-meta">
          <IconeRecu taille={14} />
          Ce qu&apos;on vous doit moins ce que vous devez
        </span>
      </div>
    </div>
  );
}

export default CartesStatistiques;
