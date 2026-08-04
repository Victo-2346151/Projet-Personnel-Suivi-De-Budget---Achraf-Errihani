import { formaterMontant } from '../utils/formatage';

interface IPropsResumeDettes {
  totalJeDois: number;
  totalOnMeDoit: number;
}

/**
 * Affiche le résumé des dettes non réglées : ce que l'utilisateur doit
 * (rouge) et ce qu'on lui doit (vert), les mêmes couleurs que la carte
 * de solde total.
 */
function ResumeDettes({ totalJeDois, totalOnMeDoit }: IPropsResumeDettes): JSX.Element {
  return (
    <div className="grille-deux-colonnes">
      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">Vous devez</span>
        <span className="carte-valeur" style={{ color: 'var(--couleur-solde-negatif)' }}>
          {formaterMontant(totalJeDois)}
        </span>
      </div>
      <div className="carte carte-ombre-legere">
        <span className="carte-accroche">On vous doit</span>
        <span className="carte-valeur" style={{ color: 'var(--couleur-solde-positif)' }}>
          {formaterMontant(totalOnMeDoit)}
        </span>
      </div>
    </div>
  );
}

export default ResumeDettes;
