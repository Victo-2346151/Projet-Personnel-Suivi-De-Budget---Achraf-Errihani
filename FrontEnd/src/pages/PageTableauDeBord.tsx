import { useEffect, useState } from 'react';
import { listerCategories, supprimerCategorie } from '../api/categories';
import FormulaireCategorie from '../composantes/FormulaireCategorie';
import ListeCategories from '../composantes/ListeCategories';
import type { ICategorie } from '../types';

/**
 * Page principale affichée une fois l'utilisateur connecté. Permet de
 * créer, modifier et supprimer ses catégories.
 */
function PageTableauDeBord(): JSX.Element {
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [categorieAModifier, setCategorieAModifier] = useState<ICategorie | null>(null);
  const [messageErreur, setMessageErreur] = useState<string>('');

  useEffect(() => {
    listerCategories()
      .then((categoriesRecues) => setCategories(categoriesRecues))
      .catch(() => setMessageErreur('Erreur lors du chargement des catégories.'));
  }, []);

  function gererSucces(categorie: ICategorie): void {
    setCategorieAModifier(null);

    setCategories((categoriesActuelles) => {
      const indexExistant = categoriesActuelles.findIndex((c) => c.id === categorie.id);

      if (indexExistant === -1) {
        return [...categoriesActuelles, categorie];
      }

      const categoriesMisesAJour = [...categoriesActuelles];
      categoriesMisesAJour[indexExistant] = categorie;
      return categoriesMisesAJour;
    });
  }

  async function gererSuppression(categorie: ICategorie): Promise<void> {
    setMessageErreur('');

    try {
      await supprimerCategorie(categorie.id);
      setCategories((categoriesActuelles) => categoriesActuelles.filter((c) => c.id !== categorie.id));
    } catch (erreur) {
      setMessageErreur(erreur instanceof Error ? erreur.message : 'Erreur lors de la suppression.');
    }
  }

  return (
    <div>
      <h2>Mes catégories</h2>
      <FormulaireCategorie categorieAModifier={categorieAModifier} auSucces={gererSucces} />
      {messageErreur !== '' && <p>{messageErreur}</p>}
      <ListeCategories
        categories={categories}
        auClicModifier={setCategorieAModifier}
        auClicSupprimer={gererSuppression}
      />
    </div>
  );
}

export default PageTableauDeBord;
