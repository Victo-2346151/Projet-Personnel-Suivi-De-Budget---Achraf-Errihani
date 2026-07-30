import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import bd from '../config/bd';
import estConnecte from '../middlewares/estConnecte';
import type { ITransactionAvecCategorie } from '../types';

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
 * décroissante, avec le nom de la catégorie associée.
 */
routeurTransactions.get('/transactions', async (requete, reponse) => {
  try {
    const [lignesTransactions] = await bd.query<LigneTransactionAvecCategorie[]>(
      `${SELECT_TRANSACTIONS_AVEC_CATEGORIE} WHERE t.utilisateurId = ? ORDER BY t.dateTransaction DESC`,
      [requete.session.utilisateurId]
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
