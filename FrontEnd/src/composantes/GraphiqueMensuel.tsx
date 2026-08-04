/**
 * Composante GraphiqueMensuel.
 *
 * @author Anthropic. (2026). Claude Code (Claude Sonnet 5) [Modèle massif
 *         de langage]. https://claude.com/claude-code
 */
import { IconeGraphique } from './Icones';
import type { IStatistiqueMensuelle } from '../types';

interface IPropsGraphiqueMensuel {
  statistiques: IStatistiqueMensuelle[];
}

const HAUTEUR_GRAPHIQUE = 110;
const LARGEUR_BARRE = 14;
const ESPACE_ENTRE_BARRES = 4;
const ESPACE_ENTRE_GROUPES = 20;

/**
 * Formate un mois/année en abréviation courte (ex. "juill. 26").
 */
function formaterMois(mois: number, annee: number): string {
  const date = new Date(annee, mois - 1, 1);
  return date.toLocaleDateString('fr-CA', { month: 'short', year: '2-digit' });
}

/**
 * Affiche un histogramme (barres SVG dessinées à la main, sans
 * librairie externe) des revenus et dépenses des 6 derniers mois,
 * côte à côte par mois.
 */
function GraphiqueMensuel({ statistiques }: IPropsGraphiqueMensuel): JSX.Element {
  const valeurMaximale = Math.max(
    1,
    ...statistiques.map((statistique) => statistique.totalRevenus),
    ...statistiques.map((statistique) => statistique.totalDepenses)
  );

  const largeurGroupe = LARGEUR_BARRE * 2 + ESPACE_ENTRE_BARRES;
  const largeurGraphique = statistiques.length * (largeurGroupe + ESPACE_ENTRE_GROUPES);

  return (
    <div className="carte carte-ombre-legere">
      <span className="carte-accroche" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <IconeGraphique />
        Revenus et dépenses par mois
      </span>

      {statistiques.length === 0 ? (
        <p className="texte-attenue" style={{ margin: 0, fontSize: 13 }}>
          Aucune donnée à afficher pour le moment.
        </p>
      ) : (
        <svg
          viewBox={`0 0 ${largeurGraphique} ${HAUTEUR_GRAPHIQUE + 24}`}
          width="100%"
          height={HAUTEUR_GRAPHIQUE + 24}
          role="img"
          aria-label="Histogramme des revenus et dépenses par mois"
        >
          {statistiques.map((statistique, index) => {
            const x = index * (largeurGroupe + ESPACE_ENTRE_GROUPES);
            const hauteurRevenus = (statistique.totalRevenus / valeurMaximale) * HAUTEUR_GRAPHIQUE;
            const hauteurDepenses = (statistique.totalDepenses / valeurMaximale) * HAUTEUR_GRAPHIQUE;

            return (
              <g key={`${statistique.annee}-${statistique.mois}`}>
                <title>
                  {formaterMois(statistique.mois, statistique.annee)}
                </title>
                <rect
                  x={x}
                  y={HAUTEUR_GRAPHIQUE - hauteurRevenus}
                  width={LARGEUR_BARRE}
                  height={hauteurRevenus}
                  rx={2}
                  fill="var(--couleur-montant-revenu)"
                />
                <rect
                  x={x + LARGEUR_BARRE + ESPACE_ENTRE_BARRES}
                  y={HAUTEUR_GRAPHIQUE - hauteurDepenses}
                  width={LARGEUR_BARRE}
                  height={hauteurDepenses}
                  rx={2}
                  fill="var(--couleur-solde-negatif)"
                />
                <text
                  x={x + largeurGroupe / 2}
                  y={HAUTEUR_GRAPHIQUE + 16}
                  textAnchor="middle"
                  fontSize="9"
                  fill="var(--couleur-texte-attenue)"
                >
                  {formaterMois(statistique.mois, statistique.annee)}
                </text>
              </g>
            );
          })}
        </svg>
      )}

      <div style={{ display: 'flex', gap: 12, fontSize: 11 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--couleur-montant-revenu)',
              display: 'inline-block',
            }}
          />
          Revenus
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: 'var(--couleur-solde-negatif)',
              display: 'inline-block',
            }}
          />
          Dépenses
        </span>
      </div>
    </div>
  );
}

export default GraphiqueMensuel;
