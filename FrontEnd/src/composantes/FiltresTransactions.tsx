import type { IFiltresTransactions } from '../api/transactions';
import type { ICategorie } from '../types';

interface IPropsFiltresTransactions {
  categories: ICategorie[];
  filtres: IFiltresTransactions;
  auChangementFiltres: (filtres: IFiltresTransactions) => void;
}

/**
 * Formulaire de filtres pour la liste des transactions (catégorie,
 * plage de dates, type). Chaque changement de champ notifie
 * immédiatement le parent via auChangementFiltres.
 */
function FiltresTransactions({
  categories,
  filtres,
  auChangementFiltres,
}: IPropsFiltresTransactions): JSX.Element {
  const auMoinsUnFiltreActif =
    filtres.categorieId !== undefined ||
    filtres.type !== undefined ||
    filtres.dateDebut !== undefined ||
    filtres.dateFin !== undefined;

  return (
    <div className="carte carte-ombre-legere">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="carte-accroche">Filtrer vos transactions</span>
        {auMoinsUnFiltreActif && (
          <button
            type="button"
            className="bouton bouton-fantome"
            onClick={() => auChangementFiltres({})}
          >
            Réinitialiser
          </button>
        )}
      </div>
      <div className="grille-deux-colonnes">
        <div className="champ-formulaire">
          <label htmlFor="filtreCategorie">Catégorie</label>
          <select
            id="filtreCategorie"
            value={filtres.categorieId ?? ''}
            onChange={(evenement) =>
              auChangementFiltres({
                ...filtres,
                categorieId:
                  evenement.target.value === '' ? undefined : Number(evenement.target.value),
              })
            }
          >
            <option value="">Toutes</option>
            {categories.map((categorie) => (
              <option key={categorie.id} value={categorie.id}>
                {categorie.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="champ-formulaire">
          <label htmlFor="filtreType">Type</label>
          <select
            id="filtreType"
            value={filtres.type ?? ''}
            onChange={(evenement) =>
              auChangementFiltres({
                ...filtres,
                type:
                  evenement.target.value === ''
                    ? undefined
                    : (evenement.target.value as 'revenu' | 'depense'),
              })
            }
          >
            <option value="">Tous</option>
            <option value="revenu">Revenu</option>
            <option value="depense">Dépense</option>
          </select>
        </div>
      </div>
      <div className="grille-deux-colonnes">
        <div className="champ-formulaire">
          <label htmlFor="filtreDateDebut">Date de début</label>
          <input
            id="filtreDateDebut"
            type="date"
            value={filtres.dateDebut ?? ''}
            onChange={(evenement) =>
              auChangementFiltres({
                ...filtres,
                dateDebut: evenement.target.value === '' ? undefined : evenement.target.value,
              })
            }
          />
        </div>
        <div className="champ-formulaire">
          <label htmlFor="filtreDateFin">Date de fin</label>
          <input
            id="filtreDateFin"
            type="date"
            value={filtres.dateFin ?? ''}
            onChange={(evenement) =>
              auChangementFiltres({
                ...filtres,
                dateFin: evenement.target.value === '' ? undefined : evenement.target.value,
              })
            }
          />
        </div>
      </div>
    </div>
  );
}

export default FiltresTransactions;
