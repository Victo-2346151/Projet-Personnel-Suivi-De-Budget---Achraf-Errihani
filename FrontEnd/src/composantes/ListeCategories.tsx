import type { ICategorie } from '../types';

interface IPropsListeCategories {
  categories: ICategorie[];
  auClicModifier: (categorie: ICategorie) => void;
  auClicSupprimer: (categorie: ICategorie) => void;
}

/**
 * Affiche la liste des catégories de l'utilisateur, avec des boutons
 * pour modifier ou supprimer chacune d'elles.
 */
function ListeCategories({
  categories,
  auClicModifier,
  auClicSupprimer,
}: IPropsListeCategories): JSX.Element {
  if (categories.length === 0) {
    return <p>Aucune catégorie pour l&apos;instant.</p>;
  }

  return (
    <ul>
      {categories.map((categorie) => (
        <li key={categorie.id}>
          {categorie.nom} ({categorie.type === 'revenu' ? 'Revenu' : 'Dépense'})
          {categorie.budgetLimite !== null && ` — Budget : ${categorie.budgetLimite} $`}
          {' '}
          <button type="button" onClick={() => auClicModifier(categorie)}>
            Modifier
          </button>
          <button type="button" onClick={() => auClicSupprimer(categorie)}>
            Supprimer
          </button>
        </li>
      ))}
    </ul>
  );
}

export default ListeCategories;
