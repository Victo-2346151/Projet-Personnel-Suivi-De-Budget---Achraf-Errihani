import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import bd from '../config/bd';
import estConnecte from '../middlewares/estConnecte';
import type { ICategorie } from '../types';

const routeurCategories = Router();

routeurCategories.use(estConnecte);

interface LigneCategorie extends RowDataPacket {
  id: number;
  utilisateurId: number;
  nom: string;
  type: 'revenu' | 'depense';
  budgetLimite: number | null;
}

interface ErreurMySQL extends Error {
  code: string;
}

/**
 * Vérifie si une erreur correspond à une violation de contrainte de clé
 * étrangère (ex: suppression d'une catégorie encore référencée par des
 * transactions, bloquée par ON DELETE RESTRICT).
 */
function estErreurCleEtrangere(erreur: unknown): erreur is ErreurMySQL {
  return erreur instanceof Error && 'code' in erreur && (erreur as ErreurMySQL).code === 'ER_ROW_IS_REFERENCED_2';
}

/**
 * Convertit une ligne de la table categories en objet ICategorie.
 */
function versCategorie(ligne: LigneCategorie): ICategorie {
  return {
    id: ligne.id,
    utilisateurId: ligne.utilisateurId,
    nom: ligne.nom,
    type: ligne.type,
    budgetLimite: ligne.budgetLimite,
  };
}

/**
 * Liste les catégories de l'utilisateur connecté.
 */
routeurCategories.get('/categories', async (requete, reponse) => {
  try {
    const [lignesCategories] = await bd.query<LigneCategorie[]>(
      'SELECT id, utilisateurId, nom, type, budgetLimite FROM categories WHERE utilisateurId = ?',
      [requete.session.utilisateurId]
    );

    reponse.json(lignesCategories.map(versCategorie));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la récupération des catégories.' });
  }
});

/**
 * Crée une nouvelle catégorie pour l'utilisateur connecté.
 */
routeurCategories.post('/categories', async (requete, reponse) => {
  const { nom, type, budgetLimite } = requete.body as {
    nom?: string;
    type?: 'revenu' | 'depense';
    budgetLimite?: number | null;
  };

  if (nom === undefined || type === undefined) {
    reponse.status(400).json({ message: 'Le nom et le type sont requis.' });
    return;
  }

  if (type !== 'revenu' && type !== 'depense') {
    reponse.status(400).json({ message: "Le type doit être 'revenu' ou 'depense'." });
    return;
  }

  try {
    const [resultatInsertion] = await bd.query<ResultSetHeader>(
      'INSERT INTO categories (utilisateurId, nom, type, budgetLimite) VALUES (?, ?, ?, ?)',
      [requete.session.utilisateurId, nom, type, budgetLimite ?? null]
    );

    const [lignesCategories] = await bd.query<LigneCategorie[]>(
      'SELECT id, utilisateurId, nom, type, budgetLimite FROM categories WHERE id = ?',
      [resultatInsertion.insertId]
    );

    reponse.status(201).json(versCategorie(lignesCategories[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la création de la catégorie.' });
  }
});

/**
 * Modifie une catégorie existante, en vérifiant qu'elle appartient bien
 * à l'utilisateur connecté.
 */
routeurCategories.put('/categories/:id', async (requete, reponse) => {
  const { nom, type, budgetLimite } = requete.body as {
    nom?: string;
    type?: 'revenu' | 'depense';
    budgetLimite?: number | null;
  };

  if (nom === undefined || type === undefined) {
    reponse.status(400).json({ message: 'Le nom et le type sont requis.' });
    return;
  }

  if (type !== 'revenu' && type !== 'depense') {
    reponse.status(400).json({ message: "Le type doit être 'revenu' ou 'depense'." });
    return;
  }

  const idCategorie = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneCategorie[]>(
      'SELECT id FROM categories WHERE id = ? AND utilisateurId = ?',
      [idCategorie, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Catégorie introuvable.' });
      return;
    }

    await bd.query('UPDATE categories SET nom = ?, type = ?, budgetLimite = ? WHERE id = ?', [
      nom,
      type,
      budgetLimite ?? null,
      idCategorie,
    ]);

    const [lignesCategories] = await bd.query<LigneCategorie[]>(
      'SELECT id, utilisateurId, nom, type, budgetLimite FROM categories WHERE id = ?',
      [idCategorie]
    );

    reponse.json(versCategorie(lignesCategories[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la modification de la catégorie.' });
  }
});

/**
 * Supprime une catégorie appartenant à l'utilisateur connecté. Si des
 * transactions y sont encore liées (ON DELETE RESTRICT), renvoie une
 * erreur 400 claire plutôt qu'une erreur 500 brute.
 */
routeurCategories.delete('/categories/:id', async (requete, reponse) => {
  const idCategorie = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneCategorie[]>(
      'SELECT id FROM categories WHERE id = ? AND utilisateurId = ?',
      [idCategorie, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Catégorie introuvable.' });
      return;
    }

    await bd.query('DELETE FROM categories WHERE id = ?', [idCategorie]);

    reponse.status(204).send();
  } catch (erreur) {
    if (estErreurCleEtrangere(erreur)) {
      reponse.status(400).json({
        message: 'Impossible de supprimer cette catégorie : des transactions y sont encore liées.',
      });
      return;
    }

    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la suppression de la catégorie.' });
  }
});

export default routeurCategories;
