import { useEffect, useState } from 'react';
import { listerCategories, supprimerCategorie } from '../api/categories';
import { listerTransactions, recupererSolde, supprimerTransaction } from '../api/transactions';
import FormulaireCategorie from '../composantes/FormulaireCategorie';
import FormulaireTransaction from '../composantes/FormulaireTransaction';
import ListeCategories from '../composantes/ListeCategories';
import ListeTransactions from '../composantes/ListeTransactions';
import SoldeTotal from '../composantes/SoldeTotal';
import type { ICategorie, ITransactionAvecCategorie } from '../types';

/**
 * Page principale affichée une fois l'utilisateur connecté. Permet de
 * créer, modifier et supprimer ses catégories et ses transactions, et
 * affiche le solde total.
 */
function PageTableauDeBord(): JSX.Element {
  const [categories, setCategories] = useState<ICategorie[]>([]);
  const [categorieAModifier, setCategorieAModifier] = useState<ICategorie | null>(null);
  const [messageErreurCategories, setMessageErreurCategories] = useState<string>('');

  const [transactions, setTransactions] = useState<ITransactionAvecCategorie[]>([]);
  const [transactionAModifier, setTransactionAModifier] = useState<ITransactionAvecCategorie | null>(null);
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

  function gererSuccesCategorie(categorie: ICategorie): void {
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

  function gererSuccesTransaction(transaction: ITransactionAvecCategorie): void {
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

  return (
    <div>
      <SoldeTotal solde={solde} />

      <h2>Mes catégories</h2>
      <FormulaireCategorie categorieAModifier={categorieAModifier} auSucces={gererSuccesCategorie} />
      {messageErreurCategories !== '' && <p>{messageErreurCategories}</p>}
      <ListeCategories
        categories={categories}
        auClicModifier={setCategorieAModifier}
        auClicSupprimer={gererSuppressionCategorie}
      />

      <h2>Mes transactions</h2>
      <FormulaireTransaction
        categories={categories}
        transactionAModifier={transactionAModifier}
        auSucces={gererSuccesTransaction}
      />
      {messageErreurTransactions !== '' && <p>{messageErreurTransactions}</p>}
      <ListeTransactions
        transactions={transactions}
        auClicModifier={setTransactionAModifier}
        auClicSupprimer={gererSuppressionTransaction}
      />
    </div>
  );
}

export default PageTableauDeBord;
