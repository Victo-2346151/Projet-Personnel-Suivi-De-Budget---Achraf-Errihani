import { IconeCategorieVide, IconeCorbeille, IconeCrayon } from './Icones';
import { formaterMontant } from '../utils/formatage';
import type { ICategorie } from '../types';

interface IPropsListeCategories {
  categories: ICategorie[];
  auClicModifier: (categorie: ICategorie) => void;
  auClicSupprimer: (categorie: ICategorie) => void;
  auClicNouvelle: () => void;
}

/**
 * Affiche la liste des catégories de l'utilisateur, avec des boutons
 * pour modifier ou supprimer chacune d'elles.
 */
function ListeCategories({
  categories,
  auClicModifier,
  auClicSupprimer,
  auClicNouvelle,
}: IPropsListeCategories): JSX.Element {
  if (categories.length === 0) {
    return (
      <div className="carte carte-ombre-legere etat-vide">
        <IconeCategorieVide />
        <span className="carte-titre">Aucune catégorie</span>
        <p className="carte-texte">Créez une première catégorie pour classer vos revenus et dépenses.</p>
        <button type="button" className="bouton bouton-primaire" onClick={auClicNouvelle}>
          Créer une catégorie
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {categories.map((categorie) => (
        <div
          key={categorie.id}
          className="carte carte-ombre-legere"
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="carte-titre">{categorie.nom}</span>
            <span
              className={`etiquette ${categorie.type === 'revenu' ? 'etiquette-accent' : 'etiquette-neutre'}`}
            >
              {categorie.type === 'revenu' ? 'Revenu' : 'Dépense'}
            </span>
            {categorie.budgetLimite !== null && (
              <span className="carte-meta">Budget : {formaterMontant(categorie.budgetLimite)}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              type="button"
              className="bouton bouton-icone bouton-fantome"
              onClick={() => auClicModifier(categorie)}
              aria-label="Modifier"
            >
              <IconeCrayon />
            </button>
            <button
              type="button"
              className="bouton bouton-icone bouton-fantome"
              onClick={() => {
                if (window.confirm(`Supprimer la catégorie « ${categorie.nom} » ?`)) {
                  auClicSupprimer(categorie);
                }
              }}
              aria-label="Supprimer"
            >
              <IconeCorbeille />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListeCategories;
