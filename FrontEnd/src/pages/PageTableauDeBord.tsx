import { useEffect, useState } from 'react';
import { listerCategories, supprimerCategorie } from '../api/categories';
import { changerStatutDette, listerDettes, recupererResumeDettes, supprimerDette } from '../api/dettes';
import { listerTransactions, recupererSolde, supprimerTransaction } from '../api/transactions';
import CartesStatistiques from '../composantes/CartesStatistiques';
import FormulaireCategorie from '../composantes/FormulaireCategorie';
import FormulaireDette from '../composantes/FormulaireDette';
import FormulaireTransaction from '../composantes/FormulaireTransaction';
import GraphiqueDepenses from '../composantes/GraphiqueDepenses';
import { IconePlus } from '../composantes/Icones';
import ListeCategories from '../composantes/ListeCategories';
import ListeDettes from '../composantes/ListeDettes';
import ListeTransactions from '../composantes/ListeTransactions';
import ResumeDettes from '../composantes/ResumeDettes';
import type { ICategorie, IDette, ITransactionAvecCategorie } from '../types';

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

  const [dettes, setDettes] = useState<IDette[]>([]);
  const [detteAModifier, setDetteAModifier] = useState<IDette | null>(null);
  const [formDetteOuvert, setFormDetteOuvert] = useState<boolean>(false);
  const [totalJeDois, setTotalJeDois] = useState<number>(0);
  const [totalOnMeDoit, setTotalOnMeDoit] = useState<number>(0);
  const [messageErreurDettes, setMessageErreurDettes] = useState<string>('');

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

  useEffect(() => {
    listerDettes()
      .then((dettesRecues) => setDettes(dettesRecues))
      .catch(() => setMessageErreurDettes('Erreur lors du chargement des dettes.'));

    recupererResumeDettes()
      .then((resume) => {
        setTotalJeDois(resume.totalJeDois);
        setTotalOnMeDoit(resume.totalOnMeDoit);
      })
      .catch(() => setMessageErreurDettes('Erreur lors du chargement du résumé des dettes.'));
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

  function ouvrirNouvelleDette(): void {
    setDetteAModifier(null);
    setFormDetteOuvert(true);
  }

  function ouvrirModificationDette(dette: IDette): void {
    setDetteAModifier(dette);
    setFormDetteOuvert(true);
  }

  function rafraichirResumeDettes(): void {
    recupererResumeDettes()
      .then((resume) => {
        setTotalJeDois(resume.totalJeDois);
        setTotalOnMeDoit(resume.totalOnMeDoit);
      })
      .catch(() => setMessageErreurDettes('Erreur lors de la mise à jour du résumé des dettes.'));
  }

  function gererSuccesDette(dette: IDette): void {
    setFormDetteOuvert(false);
    setDetteAModifier(null);

    setDettes((dettesActuelles) => {
      const indexExistant = dettesActuelles.findIndex((d) => d.id === dette.id);

      if (indexExistant === -1) {
        return [...dettesActuelles, dette];
      }

      const dettesMisesAJour = [...dettesActuelles];
      dettesMisesAJour[indexExistant] = dette;
      return dettesMisesAJour;
    });

    rafraichirResumeDettes();
  }

  async function gererSuppressionDette(dette: IDette): Promise<void> {
    setMessageErreurDettes('');

    try {
      await supprimerDette(dette.id);
      setDettes((dettesActuelles) => dettesActuelles.filter((d) => d.id !== dette.id));
      rafraichirResumeDettes();
    } catch (erreur) {
      setMessageErreurDettes(erreur instanceof Error ? erreur.message : 'Erreur lors de la suppression.');
    }
  }

  async function gererBasculeStatutDette(dette: IDette): Promise<void> {
    setMessageErreurDettes('');

    try {
      const nouveauStatut = dette.statut === 'Réglée' ? 'Non réglée' : 'Réglée';
      await changerStatutDette(dette.id, nouveauStatut);

      // On recharge la liste complète plutôt que de modifier la dette en
      // place, pour que l'ordre (non réglées d'abord) reste correct.
      const dettesRecues = await listerDettes();
      setDettes(dettesRecues);

      rafraichirResumeDettes();
    } catch (erreur) {
      setMessageErreurDettes(
        erreur instanceof Error ? erreur.message : 'Erreur lors du changement de statut.'
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
        totalJeDois={totalJeDois}
        totalOnMeDoit={totalOnMeDoit}
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

      <div className="section-colonne">
        <div className="entete-section">
          <h2>Mes dettes</h2>
          <button type="button" className="bouton bouton-primaire" onClick={ouvrirNouvelleDette}>
            <IconePlus />
            Nouvelle
          </button>
        </div>

        <ResumeDettes totalJeDois={totalJeDois} totalOnMeDoit={totalOnMeDoit} />

        {formDetteOuvert && (
          <FormulaireDette
            detteAModifier={detteAModifier}
            auSucces={gererSuccesDette}
            auAnnuler={() => setFormDetteOuvert(false)}
          />
        )}

        {messageErreurDettes !== '' && <p className="message-erreur">{messageErreurDettes}</p>}

        <ListeDettes
          dettes={dettes}
          auClicModifier={ouvrirModificationDette}
          auClicSupprimer={gererSuppressionDette}
          auClicBasculerStatut={gererBasculeStatutDette}
          auClicNouvelle={ouvrirNouvelleDette}
        />
      </div>
    </>
  );
}

export default PageTableauDeBord;
