import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import bd from '../config/bd';
import estConnecte from '../middlewares/estConnecte';
import type { IResumeMois, IStatistiqueMensuelle, ITransactionAvecCategorie } from '../types';

const routeurTransactions = Router();

routeurTransactions.use(estConnecte);

const SELECT_TRANSACTIONS_AVEC_CATEGORIE = `
  SELECT t.id, t.utilisateurId, t.categorieId, t.montant, t.type, t.description, t.dateTransaction, c.nom AS categorieNom
  FROM transactions t
  INNER JOIN categories c ON c.id = t.categorieId
`;

interface LigneTransaction extends RowDataPacket {
  id: number;
  utilisateurId: number;
  categorieId: number;
  montant: number;
  type: 'revenu' | 'depense';
  description: string | null;
  dateTransaction: Date;
}

interface LigneTransactionAvecCategorie extends LigneTransaction {
  categorieNom: string;
}

interface LigneCategorie extends RowDataPacket {
  id: number;
  type: 'revenu' | 'depense';
}

interface LigneSolde extends RowDataPacket {
  solde: number | null;
}

interface LigneResumeMois extends RowDataPacket {
  totalRevenus: number | null;
  totalDepenses: number | null;
}

interface LigneStatistiqueMensuelle extends RowDataPacket {
  mois: number;
  annee: number;
  totalRevenus: number;
  totalDepenses: number;
}

/**
 * Calcule la liste des `nombreDeMois` derniers mois (mois calendaire
 * courant inclus), du plus ancien au plus récent.
 */
function calculerDerniersMois(nombreDeMois: number): { mois: number; annee: number }[] {
  const moisCalcules: { mois: number; annee: number }[] = [];
  const maintenant = new Date();

  for (let decalage = nombreDeMois - 1; decalage >= 0; decalage -= 1) {
    const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - decalage, 1);
    moisCalcules.push({ mois: date.getMonth() + 1, annee: date.getFullYear() });
  }

  return moisCalcules;
}

/**
 * Convertit une ligne de la jointure transactions/categories en objet
 * ITransactionAvecCategorie.
 */
function versTransactionAvecCategorie(ligne: LigneTransactionAvecCategorie): ITransactionAvecCategorie {
  return {
    id: ligne.id,
    utilisateurId: ligne.utilisateurId,
    categorieId: ligne.categorieId,
    montant: ligne.montant,
    type: ligne.type,
    description: ligne.description,
    dateTransaction: ligne.dateTransaction,
    categorieNom: ligne.categorieNom,
  };
}

/**
 * Vérifie que la catégorie appartient à l'utilisateur connecté et que
 * son type correspond au type de la transaction. Retourne un message
 * d'erreur en français si la validation échoue, sinon null.
 */
async function validerCategorie(
  categorieId: number,
  utilisateurId: number | undefined,
  typeTransaction: 'revenu' | 'depense'
): Promise<string | null> {
  const [lignesCategories] = await bd.query<LigneCategorie[]>(
    'SELECT id, type FROM categories WHERE id = ? AND utilisateurId = ?',
    [categorieId, utilisateurId]
  );

  const categorie = lignesCategories[0];

  if (categorie === undefined) {
    return "La catégorie sélectionnée n'existe pas.";
  }

  if (categorie.type !== typeTransaction) {
    return 'Le type de la transaction ne correspond pas au type de la catégorie sélectionnée.';
  }

  return null;
}

/**
 * Liste les transactions de l'utilisateur connecté, triées par date
 * décroissante, avec le nom de la catégorie associée. Accepte des
 * filtres optionnels en query params : categorieId, dateDebut, dateFin
 * et type ('revenu' | 'depense').
 */
routeurTransactions.get('/transactions', async (requete, reponse) => {
  const { categorieId, dateDebut, dateFin, type } = requete.query as {
    categorieId?: string;
    dateDebut?: string;
    dateFin?: string;
    type?: string;
  };

  const conditions = ['t.utilisateurId = ?'];
  const parametres: unknown[] = [requete.session.utilisateurId];

  if (categorieId !== undefined) {
    conditions.push('t.categorieId = ?');
    parametres.push(Number(categorieId));
  }

  if (dateDebut !== undefined) {
    conditions.push('t.dateTransaction >= ?');
    parametres.push(dateDebut);
  }

  if (dateFin !== undefined) {
    conditions.push('t.dateTransaction <= ?');
    parametres.push(dateFin);
  }

  if (type === 'revenu' || type === 'depense') {
    conditions.push('t.type = ?');
    parametres.push(type);
  }

  try {
    const [lignesTransactions] = await bd.query<LigneTransactionAvecCategorie[]>(
      `${SELECT_TRANSACTIONS_AVEC_CATEGORIE} WHERE ${conditions.join(' AND ')} ORDER BY t.dateTransaction DESC`,
      parametres
    );

    reponse.json(lignesTransactions.map(versTransactionAvecCategorie));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la récupération des transactions.' });
  }
});

/**
 * Calcule et retourne le solde total (revenus moins dépenses) de
 * l'utilisateur connecté.
 */
routeurTransactions.get('/transactions/solde', async (requete, reponse) => {
  try {
    const [lignesSolde] = await bd.query<LigneSolde[]>(
      `SELECT SUM(CASE WHEN type = 'revenu' THEN montant ELSE -montant END) AS solde
       FROM transactions
       WHERE utilisateurId = ?`,
      [requete.session.utilisateurId]
    );

    reponse.json({ solde: lignesSolde[0].solde ?? 0 });
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors du calcul du solde.' });
  }
});

/**
 * Calcule et retourne les totaux de revenus, de dépenses et le solde
 * de l'utilisateur connecté pour le mois calendaire courant uniquement.
 */
routeurTransactions.get('/transactions/resumeMois', async (requete, reponse) => {
  try {
    const [lignesResume] = await bd.query<LigneResumeMois[]>(
      `SELECT
         SUM(CASE WHEN type = 'revenu' THEN montant ELSE 0 END) AS totalRevenus,
         SUM(CASE WHEN type = 'depense' THEN montant ELSE 0 END) AS totalDepenses
       FROM transactions
       WHERE utilisateurId = ?
         AND MONTH(dateTransaction) = MONTH(CURDATE())
         AND YEAR(dateTransaction) = YEAR(CURDATE())`,
      [requete.session.utilisateurId]
    );

    const totalRevenus = lignesResume[0].totalRevenus ?? 0;
    const totalDepenses = lignesResume[0].totalDepenses ?? 0;

    const resumeMois: IResumeMois = {
      totalRevenus,
      totalDepenses,
      solde: totalRevenus - totalDepenses,
    };

    reponse.json(resumeMois);
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors du calcul du résumé du mois.' });
  }
});

/**
 * Retourne les totaux de revenus et de dépenses des 6 derniers mois
 * (mois calendaire courant inclus) de l'utilisateur connecté, regroupés
 * par mois/année, du plus ancien au plus récent.
 */
routeurTransactions.get('/transactions/parMois', async (requete, reponse) => {
  try {
    const derniersMois = calculerDerniersMois(6);
    const premierMois = derniersMois[0];
    const dateDebut = `${premierMois.annee}-${String(premierMois.mois).padStart(2, '0')}-01`;

    const [lignesStatistiques] = await bd.query<LigneStatistiqueMensuelle[]>(
      `SELECT MONTH(dateTransaction) AS mois, YEAR(dateTransaction) AS annee,
              SUM(CASE WHEN type = 'revenu' THEN montant ELSE 0 END) AS totalRevenus,
              SUM(CASE WHEN type = 'depense' THEN montant ELSE 0 END) AS totalDepenses
       FROM transactions
       WHERE utilisateurId = ? AND dateTransaction >= ?
       GROUP BY YEAR(dateTransaction), MONTH(dateTransaction)`,
      [requete.session.utilisateurId, dateDebut]
    );

    const statistiques: IStatistiqueMensuelle[] = derniersMois.map((moisCourant) => {
      const ligneCorrespondante = lignesStatistiques.find(
        (ligne) => ligne.mois === moisCourant.mois && ligne.annee === moisCourant.annee
      );

      return {
        mois: moisCourant.mois,
        annee: moisCourant.annee,
        totalRevenus: ligneCorrespondante?.totalRevenus ?? 0,
        totalDepenses: ligneCorrespondante?.totalDepenses ?? 0,
      };
    });

    reponse.json(statistiques);
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors du calcul des statistiques mensuelles.' });
  }
});

/**
 * Crée une nouvelle transaction pour l'utilisateur connecté. Vérifie
 * que la catégorie choisie lui appartient et que son type correspond
 * au type de la transaction.
 */
routeurTransactions.post('/transactions', async (requete, reponse) => {
  const { categorieId, montant, type, description, dateTransaction } = requete.body as {
    categorieId?: number;
    montant?: number;
    type?: 'revenu' | 'depense';
    description?: string | null;
    dateTransaction?: string;
  };

  if (
    categorieId === undefined ||
    montant === undefined ||
    type === undefined ||
    dateTransaction === undefined
  ) {
    reponse.status(400).json({ message: 'La catégorie, le montant, le type et la date sont requis.' });
    return;
  }

  if (type !== 'revenu' && type !== 'depense') {
    reponse.status(400).json({ message: "Le type doit être 'revenu' ou 'depense'." });
    return;
  }

  if (montant <= 0) {
    reponse.status(400).json({ message: 'Le montant doit être supérieur à zéro.' });
    return;
  }

  try {
    const messageErreurCategorie = await validerCategorie(categorieId, requete.session.utilisateurId, type);

    if (messageErreurCategorie !== null) {
      reponse.status(400).json({ message: messageErreurCategorie });
      return;
    }

    const [resultatInsertion] = await bd.query<ResultSetHeader>(
      `INSERT INTO transactions (utilisateurId, categorieId, montant, type, description, dateTransaction)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [requete.session.utilisateurId, categorieId, montant, type, description ?? null, dateTransaction]
    );

    const [lignesTransactions] = await bd.query<LigneTransactionAvecCategorie[]>(
      `${SELECT_TRANSACTIONS_AVEC_CATEGORIE} WHERE t.id = ?`,
      [resultatInsertion.insertId]
    );

    reponse.status(201).json(versTransactionAvecCategorie(lignesTransactions[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la création de la transaction.' });
  }
});

/**
 * Modifie une transaction existante, en vérifiant qu'elle appartient
 * bien à l'utilisateur connecté et que la catégorie choisie est
 * cohérente avec le type de la transaction.
 */
routeurTransactions.put('/transactions/:id', async (requete, reponse) => {
  const { categorieId, montant, type, description, dateTransaction } = requete.body as {
    categorieId?: number;
    montant?: number;
    type?: 'revenu' | 'depense';
    description?: string | null;
    dateTransaction?: string;
  };

  if (
    categorieId === undefined ||
    montant === undefined ||
    type === undefined ||
    dateTransaction === undefined
  ) {
    reponse.status(400).json({ message: 'La catégorie, le montant, le type et la date sont requis.' });
    return;
  }

  if (type !== 'revenu' && type !== 'depense') {
    reponse.status(400).json({ message: "Le type doit être 'revenu' ou 'depense'." });
    return;
  }

  if (montant <= 0) {
    reponse.status(400).json({ message: 'Le montant doit être supérieur à zéro.' });
    return;
  }

  const idTransaction = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneTransaction[]>(
      'SELECT id FROM transactions WHERE id = ? AND utilisateurId = ?',
      [idTransaction, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Transaction introuvable.' });
      return;
    }

    const messageErreurCategorie = await validerCategorie(categorieId, requete.session.utilisateurId, type);

    if (messageErreurCategorie !== null) {
      reponse.status(400).json({ message: messageErreurCategorie });
      return;
    }

    await bd.query(
      `UPDATE transactions
       SET categorieId = ?, montant = ?, type = ?, description = ?, dateTransaction = ?
       WHERE id = ?`,
      [categorieId, montant, type, description ?? null, dateTransaction, idTransaction]
    );

    const [lignesTransactions] = await bd.query<LigneTransactionAvecCategorie[]>(
      `${SELECT_TRANSACTIONS_AVEC_CATEGORIE} WHERE t.id = ?`,
      [idTransaction]
    );

    reponse.json(versTransactionAvecCategorie(lignesTransactions[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la modification de la transaction.' });
  }
});

/**
 * Supprime une transaction appartenant à l'utilisateur connecté.
 */
routeurTransactions.delete('/transactions/:id', async (requete, reponse) => {
  const idTransaction = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneTransaction[]>(
      'SELECT id FROM transactions WHERE id = ? AND utilisateurId = ?',
      [idTransaction, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Transaction introuvable.' });
      return;
    }

    await bd.query('DELETE FROM transactions WHERE id = ?', [idTransaction]);

    reponse.status(204).send();
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la suppression de la transaction.' });
  }
});

export default routeurTransactions;
