import { useEffect, useState } from 'react';
import { listerCategories, supprimerCategorie } from '../api/categories';
import { listerTransactions, recupererSolde, supprimerTransaction } from '../api/transactions';
import CartesStatistiques from '../composantes/CartesStatistiques';
import FormulaireCategorie from '../composantes/FormulaireCategorie';
import FormulaireTransaction from '../composantes/FormulaireTransaction';
import GraphiqueDepenses from '../composantes/GraphiqueDepenses';
import { IconePlus } from '../composantes/Icones';
import ListeCategories from '../composantes/ListeCategories';
import ListeTransactions from '../composantes/ListeTransactions';
import type { ICategorie, ITransactionAvecCategorie } from '../types';

/**
 * Page principale affichée une fois l'utilisateur connecté. Permet de
 * créer, modifier et supprimer ses catégories et ses transactions, et
 * affiche le solde total ainsi que la répartition des dépenses.
 */
function PageTableauDeBord(): JSX.Element {
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [categorieAModifier, setCategorieAModifier] = useState<ICategorie | null>(null);
  const [formCategorieOuvert, setFormCategorieOuvert] = useState<boolean>(false);
  const [messageErreurCategories, setMessageErreurCategories] = useState<string>('');

  const [transactions, setTransactions] = useState<ITransactionAvecCategorie[]>([]);
  const [transactionAModifier, setTransactionAModifier] = useState<ITransactionAvecCategorie | null>(null);
  const [formTransactionOuvert, setFormTransactionOuvert] = useState<boolean>(false);
  const [solde, setSolde] = useState<number>(0);
  const [messageErreurTransactions, setMessageErreurTransactions] = useState<string>('');

  useEffect(() => {
    listerCategories()
      .then((categoriesRecues) => setCategories(categoriesRecues))
      .catch(() => setMessageErreurCategories('Erreur lors du chargement des catégories.'));
  }, []);

  useEffect(() => {
    listerTransactions()
      .then((transactionsRecues) => setTransactions(transactionsRecues))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement des transactions.'));

    recupererSolde()
      .then((soldeRecu) => setSolde(soldeRecu.solde))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement du solde.'));
  }, []);

  function ouvrirNouvelleCategorie(): void {
    setCategorieAModifier(null);
    setFormCategorieOuvert(true);
  }

  function ouvrirModificationCategorie(categorie: ICategorie): void {
    setCategorieAModifier(categorie);
    setFormCategorieOuvert(true);
  }

  function gererSuccesCategorie(categorie: ICategorie): void {
    setFormCategorieOuvert(false);
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

  async function gererSuppressionCategorie(categorie: ICategorie): Promise<void> {
    setMessageErreurCategories('');

    try {
      await supprimerCategorie(categorie.id);
      setCategories((categoriesActuelles) => categoriesActuelles.filter((c) => c.id !== categorie.id));
    } catch (erreur) {
      setMessageErreurCategories(erreur instanceof Error ? erreur.message : 'Erreur lors de la suppression.');
    }
  }

  function ouvrirNouvelleTransaction(): void {
    setTransactionAModifier(null);
    setFormTransactionOuvert(true);
  }

  function ouvrirModificationTransaction(transaction: ITransactionAvecCategorie): void {
    setTransactionAModifier(transaction);
    setFormTransactionOuvert(true);
  }

  function gererSuccesTransaction(transaction: ITransactionAvecCategorie): void {
    setFormTransactionOuvert(false);
    setTransactionAModifier(null);

    setTransactions((transactionsActuelles) => {
      const indexExistant = transactionsActuelles.findIndex((t) => t.id === transaction.id);

      if (indexExistant === -1) {
        return [...transactionsActuelles, transaction];
      }

      const transactionsMisesAJour = [...transactionsActuelles];
      transactionsMisesAJour[indexExistant] = transaction;
      return transactionsMisesAJour;
    });

    recupererSolde()
      .then((soldeRecu) => setSolde(soldeRecu.solde))
      .catch(() => setMessageErreurTransactions('Erreur lors de la mise à jour du solde.'));
  }

  async function gererSuppressionTransaction(transaction: ITransactionAvecCategorie): Promise<void> {
    setMessageErreurTransactions('');

    try {
      await supprimerTransaction(transaction.id);
      setTransactions((transactionsActuelles) =>
        transactionsActuelles.filter((t) => t.id !== transaction.id)
      );

      const soldeRecu = await recupererSolde();
      setSolde(soldeRecu.solde);
    } catch (erreur) {
      setMessageErreurTransactions(
        erreur instanceof Error ? erreur.message : 'Erreur lors de la suppression.'
      );
    }
  }

  const totalRevenus = transactions
    .filter((transaction) => transaction.type === 'revenu')
    .reduce((total, transaction) => total + transaction.montant, 0);

  const totalDepenses = transactions
    .filter((transaction) => transaction.type === 'depense')
    .reduce((total, transaction) => total + transaction.montant, 0);

  const nbTransactionsRevenu = transactions.filter((transaction) => transaction.type === 'revenu').length;
  const nbTransactionsDepense = transactions.filter((transaction) => transaction.type === 'depense').length;

  return (
    <>
      <CartesStatistiques
        solde={solde}
        totalRevenus={totalRevenus}
        totalDepenses={totalDepenses}
        nbTransactionsRevenu={nbTransactionsRevenu}
        nbTransactionsDepense={nbTransactionsDepense}
      />

      <GraphiqueDepenses transactions={transactions} />

      <div className="grille-tableau-bord">
        <div className="section-colonne">
          <div className="entete-section">
            <h2>Mes catégories</h2>
            <button type="button" className="bouton bouton-primaire" onClick={ouvrirNouvelleCategorie}>
              <IconePlus />
              Nouvelle
            </button>
          </div>

          {formCategorieOuvert && (
            <FormulaireCategorie
              categorieAModifier={categorieAModifier}
              auSucces={gererSuccesCategorie}
              auAnnuler={() => setFormCategorieOuvert(false)}
            />
          )}

          {messageErreurCategories !== '' && <p className="message-erreur">{messageErreurCategories}</p>}

          <ListeCategories
            categories={categories}
            auClicModifier={ouvrirModificationCategorie}
            auClicSupprimer={gererSuppressionCategorie}
            auClicNouvelle={ouvrirNouvelleCategorie}
          />
        </div>

        <div className="section-colonne">
          <div className="entete-section">
            <h2>Mes transactions</h2>
            <button
              type="button"
              className="bouton bouton-primaire"
              onClick={ouvrirNouvelleTransaction}
              disabled={categories.length === 0}
            >
              <IconePlus />
              Nouvelle
            </button>
          </div>

          {formTransactionOuvert && (
            <FormulaireTransaction
              categories={categories}
              transactionAModifier={transactionAModifier}
              auSucces={gererSuccesTransaction}
              auAnnuler={() => setFormTransactionOuvert(false)}
            />
          )}

          {messageErreurTransactions !== '' && <p className="message-erreur">{messageErreurTransactions}</p>}

          <ListeTransactions
            transactions={transactions}
            aucuneCategorie={categories.length === 0}
            auClicModifier={ouvrirModificationTransaction}
            auClicSupprimer={gererSuppressionTransaction}
            auClicNouvelle={ouvrirNouvelleTransaction}
          />
        </div>
      </div>
    </>
  );
}

export default PageTableauDeBord;
