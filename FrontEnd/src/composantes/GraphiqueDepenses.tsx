/**
 * Composante GraphiqueDepenses.
 *
 * @author Anthropic. (2026). Claude Code (Claude Sonnet 5) [Modèle massif
 *         de langage]. https://claude.com/claude-code
 */
import { formaterMontant } from '../utils/formatage';
import { IconeGraphique } from './Icones';
import type { ITransactionAvecCategorie } from '../types';

interface IPropsGraphiqueDepenses {
  transactions: ITransactionAvecCategorie[];
}

interface IBarreDepense {
  nom: string;
  total: number;
  pourcentage: number;
}

/**
 * Calcule le total des dépenses par catégorie, trié du plus grand au
 * plus petit, avec un pourcentage relatif au plus gros total (pour la
 * largeur des barres).
 */
function calculerDepensesParCategorie(transactions: ITransactionAvecCategorie[]): IBarreDepense[] {
  const totauxParCategorie = new Map<string, number>();

  transactions
    .filter((transaction) => transaction.type === 'depense')
    .forEach((transaction) => {
      const totalActuel = totauxParCategorie.get(transaction.categorieNom) ?? 0;
      totauxParCategorie.set(transaction.categorieNom, totalActuel + transaction.montant);
    });

  const totalMaximum = Math.max(1, ...totauxParCategorie.values());

  return Array.from(totauxParCategorie.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([nom, total]) => ({
      nom,
      total,
      pourcentage: Math.round((total / totalMaximum) * 100),
    }));
}

/**
 * Affiche la répartition des dépenses par catégorie sous forme de
 * barres horizontales.
 */
function GraphiqueDepenses({ transactions }: IPropsGraphiqueDepenses): JSX.Element {
  const barres = calculerDepensesParCategorie(transactions);

  return (
    <div className="carte carte-ombre-legere">
      <span className="carte-accroche" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconeGraphique />
        Répartition des dépenses
      </span>
      {barres.length === 0 ? (
        <p className="texte-attenue" style={{ margin: 0, fontSize: 13 }}>
          Aucune dépense à afficher pour le moment.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          {barres.map((barre) => (
            <div key={barre.nom} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <span>{barre.nom}</span>
                <span className="texte-attenue">{formaterMontant(barre.total)}</span>
              </div>
              <div className="barre-graphique-fond">
                <div className="barre-graphique-remplissage" style={{ width: `${barre.pourcentage}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default GraphiqueDepenses;
