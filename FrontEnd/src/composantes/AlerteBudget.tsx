import { formaterMontant } from '../utils/formatage';
import type { IBudgetCategorie } from '../types';

interface IPropsAlerteBudget {
  budgets: IBudgetCategorie[];
}

/**
 * Détermine la couleur de la barre de progression selon le pourcentage
 * du budget déjà utilisé : vert sous 80 %, orange entre 80 % et 100 %,
 * rouge au-delà de 100 %.
 */
function couleurPourcentage(pourcentageUtilise: number): string {
  if (pourcentageUtilise > 100) {
    return 'var(--couleur-solde-negatif)';
  }

  if (pourcentageUtilise >= 80) {
    return 'var(--couleur-avertissement)';
  }

  return 'var(--couleur-solde-positif)';
}

/**
 * Affiche, pour chaque catégorie de dépense ayant un budget limite,
 * une barre de progression indiquant le montant dépensé ce mois-ci par
 * rapport au budget, colorée selon le pourcentage utilisé.
 */
function AlerteBudget({ budgets }: IPropsAlerteBudget): JSX.Element {
  return (
    <div className="carte carte-ombre-legere">
      <span className="carte-accroche">Budgets du mois</span>
      {budgets.length === 0 ? (
        <p className="texte-attenue" style={{ margin: 0, fontSize: 13 }}>
          Aucun budget limite défini pour vos catégories de dépense.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {budgets.map((budget) => {
            const couleur = couleurPourcentage(budget.pourcentageUtilise);
            const largeurBarre = Math.min(100, budget.pourcentageUtilise);

            return (
              <div key={budget.categorieId} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>{budget.nom}</span>
                  <span className="texte-attenue">
                    {formaterMontant(budget.montantDepense)} / {formaterMontant(budget.budgetLimite)}
                  </span>
                </div>
                <div className="barre-graphique-fond">
                  <div
                    className="barre-graphique-remplissage"
                    style={{ width: `${largeurBarre}%`, background: couleur }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AlerteBudget;
