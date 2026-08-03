import { useEffect, useState } from 'react';
import { recupererBudgets } from '../api/budgets';
import { listerCategories, supprimerCategorie } from '../api/categories';
import { changerStatutDette, listerDettes, recupererResumeDettes, supprimerDette } from '../api/dettes';
import {
  IFiltresTransactions,
  listerTransactions,
  recupererResumeMois,
  recupererSolde,
  recupererStatistiquesMensuelles,
  supprimerTransaction,
} from '../api/transactions';
import AlerteBudget from '../composantes/AlerteBudget';
import CartesStatistiques from '../composantes/CartesStatistiques';
import FiltresTransactions from '../composantes/FiltresTransactions';
import FormulaireCategorie from '../composantes/FormulaireCategorie';
import FormulaireDette from '../composantes/FormulaireDette';
import FormulaireTransaction from '../composantes/FormulaireTransaction';
import GraphiqueDepenses from '../composantes/GraphiqueDepenses';
import GraphiqueMensuel from '../composantes/GraphiqueMensuel';
import { IconePlus } from '../composantes/Icones';
import ListeCategories from '../composantes/ListeCategories';
import ListeDettes from '../composantes/ListeDettes';
import ListeTransactions from '../composantes/ListeTransactions';
import ResumeDettes from '../composantes/ResumeDettes';
import { genererCsvTransactions, telechargerCsv } from '../utils/exportCsv';
import type {
  IBudgetCategorie,
  ICategorie,
  IDette,
  IResumeMois,
  IStatistiqueMensuelle,
  ITransactionAvecCategorie,
} from '../types';

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
  const [toutesLesTransactions, setToutesLesTransactions] = useState<ITransactionAvecCategorie[]>([]);
  const [transactionAModifier, setTransactionAModifier] = useState<ITransactionAvecCategorie | null>(null);
  const [formTransactionOuvert, setFormTransactionOuvert] = useState<boolean>(false);
  const [solde, setSolde] = useState<number>(0);
  const [messageErreurTransactions, setMessageErreurTransactions] = useState<string>('');
  const [budgets, setBudgets] = useState<IBudgetCategorie[]>([]);
  const [filtresTransactions, setFiltresTransactions] = useState<IFiltresTransactions>({});
  const [statistiquesMensuelles, setStatistiquesMensuelles] = useState<IStatistiqueMensuelle[]>([]);
  const [resumeMois, setResumeMois] = useState<IResumeMois>({
    totalRevenus: 0,
    totalDepenses: 0,
    solde: 0,
  });

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
    listerTransactions(filtresTransactions)
      .then((transactionsRecues) => setTransactions(transactionsRecues))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement des transactions.'));
  }, [filtresTransactions]);

  useEffect(() => {
    recupererSolde()
      .then((soldeRecu) => setSolde(soldeRecu.solde))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement du solde.'));

    recupererStatistiquesMensuelles()
      .then((statistiquesRecues) => setStatistiquesMensuelles(statistiquesRecues))
      .catch(() =>
        setMessageErreurTransactions('Erreur lors du chargement des statistiques mensuelles.')
      );

    rafraichirToutesLesTransactions();
    rafraichirResumeMois();
    rafraichirBudgets();
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

  function rafraichirToutesLesTransactions(): void {
    // Toujours non filtré : sert au calcul des cartes statistiques
    // globales et à la répartition des dépenses, séparément de la liste
    // affichée dans le tableau (qui, elle, respecte les filtres actifs).
    listerTransactions()
      .then((transactionsRecues) => setToutesLesTransactions(transactionsRecues))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement des transactions.'));
  }

  function rafraichirBudgets(): void {
    recupererBudgets()
      .then((budgetsRecus) => setBudgets(budgetsRecus))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement des budgets.'));
  }

  function rafraichirResumeMois(): void {
    recupererResumeMois()
      .then((resumeMoisRecu) => setResumeMois(resumeMoisRecu))
      .catch(() => setMessageErreurTransactions('Erreur lors du chargement du résumé du mois.'));
  }

  function gererExportCsv(): void {
    const contenuCsv = genererCsvTransactions(transactions);
    const dateDuJour = new Date().toISOString().slice(0, 10);
    telechargerCsv(contenuCsv, `transactions_${dateDuJour}.csv`);
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

    rafraichirToutesLesTransactions();
    rafraichirResumeMois();
    rafraichirBudgets();
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

      rafraichirToutesLesTransactions();
      rafraichirResumeMois();
      rafraichirBudgets();
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

  // Calculés à partir de toutesLesTransactions (jamais filtré), pour que
  // ces totaux globaux restent cohérents avec Solde total peu importe les
  // filtres actifs sur la liste affichée (`transactions`).
  const totalRevenus = toutesLesTransactions
    .filter((transaction) => transaction.type === 'revenu')
    .reduce((total, transaction) => total + transaction.montant, 0);

  const totalDepenses = toutesLesTransactions
    .filter((transaction) => transaction.type === 'depense')
    .reduce((total, transaction) => total + transaction.montant, 0);

  const nbTransactionsRevenu = toutesLesTransactions.filter(
    (transaction) => transaction.type === 'revenu'
  ).length;
  const nbTransactionsDepense = toutesLesTransactions.filter(
    (transaction) => transaction.type === 'depense'
  ).length;

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
        resumeMois={resumeMois}
      />

      <div className="grille-deux-colonnes">
        <GraphiqueDepenses transactions={toutesLesTransactions} />
        <GraphiqueMensuel statistiques={statistiquesMensuelles} />
      </div>

      <AlerteBudget budgets={budgets} />

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
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="bouton bouton-secondaire"
                onClick={gererExportCsv}
                disabled={transactions.length === 0}
              >
                Exporter en CSV
              </button>
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

          <FiltresTransactions
            categories={categories}
            filtres={filtresTransactions}
            auChangementFiltres={setFiltresTransactions}
          />

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
