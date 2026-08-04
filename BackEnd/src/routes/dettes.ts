import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import bd from '../config/bd';
import estConnecte from '../middlewares/estConnecte';
import type { IDette } from '../types';
import { estTexteNonVide } from '../utils/validation';

const routeurDettes = Router();

routeurDettes.use(estConnecte);

const SELECT_DETTE =
  'SELECT id, utilisateurId, personne, montant, direction, description, dateCreation, statut FROM dettes';

interface LigneDette extends RowDataPacket {
  id: number;
  utilisateurId: number;
  personne: string;
  montant: number;
  direction: 'je_dois' | 'on_me_doit';
  description: string | null;
  dateCreation: Date;
  statut: 'Réglée' | 'Non réglée';
}

interface LigneResumeDettes extends RowDataPacket {
  totalJeDois: number | null;
  totalOnMeDoit: number | null;
}

/**
 * Convertit une ligne de la table dettes en objet IDette.
 */
function versDette(ligne: LigneDette): IDette {
  return {
    id: ligne.id,
    utilisateurId: ligne.utilisateurId,
    personne: ligne.personne,
    montant: ligne.montant,
    direction: ligne.direction,
    description: ligne.description,
    dateCreation: ligne.dateCreation,
    statut: ligne.statut,
  };
}

/**
 * Liste les dettes de l'utilisateur connecté, triées par statut (non
 * réglées en premier) puis par date de création décroissante.
 */
routeurDettes.get('/dettes', async (requete, reponse) => {
  try {
    const [lignesDettes] = await bd.query<LigneDette[]>(
      `${SELECT_DETTE}
       WHERE utilisateurId = ?
       ORDER BY FIELD(statut, 'Non réglée', 'Réglée'), dateCreation DESC`,
      [requete.session.utilisateurId]
    );

    reponse.json(lignesDettes.map(versDette));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la récupération des dettes.' });
  }
});

/**
 * Calcule et retourne le résumé des dettes non réglées de
 * l'utilisateur connecté : total qu'il doit et total qu'on lui doit.
 */
routeurDettes.get('/dettes/resume', async (requete, reponse) => {
  try {
    const [lignesResume] = await bd.query<LigneResumeDettes[]>(
      `SELECT
         SUM(CASE WHEN direction = 'je_dois' THEN montant ELSE 0 END) AS totalJeDois,
         SUM(CASE WHEN direction = 'on_me_doit' THEN montant ELSE 0 END) AS totalOnMeDoit
       FROM dettes
       WHERE utilisateurId = ? AND statut = 'Non réglée'`,
      [requete.session.utilisateurId]
    );

    reponse.json({
      totalJeDois: lignesResume[0].totalJeDois ?? 0,
      totalOnMeDoit: lignesResume[0].totalOnMeDoit ?? 0,
    });
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors du calcul du résumé des dettes.' });
  }
});

/**
 * Crée une nouvelle dette pour l'utilisateur connecté. Le statut est
 * automatiquement 'Non réglée'.
 */
routeurDettes.post('/dettes', async (requete, reponse) => {
  const { personne, montant, direction, description, dateCreation } = requete.body as {
    personne?: string;
    montant?: number;
    direction?: 'je_dois' | 'on_me_doit';
    description?: string | null;
    dateCreation?: string;
  };

  if (
    !estTexteNonVide(personne) ||
    montant === undefined ||
    direction === undefined ||
    dateCreation === undefined
  ) {
    reponse.status(400).json({ message: 'La personne, le montant, le sens et la date sont requis.' });
    return;
  }

  if (direction !== 'je_dois' && direction !== 'on_me_doit') {
    reponse.status(400).json({ message: "Le sens doit être 'je_dois' ou 'on_me_doit'." });
    return;
  }

  if (montant <= 0) {
    reponse.status(400).json({ message: 'Le montant doit être supérieur à zéro.' });
    return;
  }

  try {
    const [resultatInsertion] = await bd.query<ResultSetHeader>(
      `INSERT INTO dettes (utilisateurId, personne, montant, direction, description, dateCreation, statut)
       VALUES (?, ?, ?, ?, ?, ?, 'Non réglée')`,
      [requete.session.utilisateurId, personne, montant, direction, description ?? null, dateCreation]
    );

    const [lignesDettes] = await bd.query<LigneDette[]>(`${SELECT_DETTE} WHERE id = ?`, [
      resultatInsertion.insertId,
    ]);

    reponse.status(201).json(versDette(lignesDettes[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la création de la dette.' });
  }
});

/**
 * Modifie une dette existante, en vérifiant qu'elle appartient bien à
 * l'utilisateur connecté. Le statut n'est pas modifiable ici (voir
 * PUT /dettes/:id/statut).
 */
routeurDettes.put('/dettes/:id', async (requete, reponse) => {
  const { personne, montant, direction, description, dateCreation } = requete.body as {
    personne?: string;
    montant?: number;
    direction?: 'je_dois' | 'on_me_doit';
    description?: string | null;
    dateCreation?: string;
  };

  if (
    !estTexteNonVide(personne) ||
    montant === undefined ||
    direction === undefined ||
    dateCreation === undefined
  ) {
    reponse.status(400).json({ message: 'La personne, le montant, le sens et la date sont requis.' });
    return;
  }

  if (direction !== 'je_dois' && direction !== 'on_me_doit') {
    reponse.status(400).json({ message: "Le sens doit être 'je_dois' ou 'on_me_doit'." });
    return;
  }

  if (montant <= 0) {
    reponse.status(400).json({ message: 'Le montant doit être supérieur à zéro.' });
    return;
  }

  const idDette = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneDette[]>(
      'SELECT id FROM dettes WHERE id = ? AND utilisateurId = ?',
      [idDette, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Dette introuvable.' });
      return;
    }

    await bd.query(
      'UPDATE dettes SET personne = ?, montant = ?, direction = ?, description = ?, dateCreation = ? WHERE id = ?',
      [personne, montant, direction, description ?? null, dateCreation, idDette]
    );

    const [lignesDettes] = await bd.query<LigneDette[]>(`${SELECT_DETTE} WHERE id = ?`, [idDette]);

    reponse.json(versDette(lignesDettes[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la modification de la dette.' });
  }
});

/**
 * Route dédiée pour basculer rapidement le statut d'une dette
 * ('Réglée' ou 'Non réglée'), sans devoir renvoyer tous les autres
 * champs.
 */
routeurDettes.put('/dettes/:id/statut', async (requete, reponse) => {
  const { statut } = requete.body as { statut?: 'Réglée' | 'Non réglée' };

  if (statut === undefined) {
    reponse.status(400).json({ message: 'Le statut est requis.' });
    return;
  }

  if (statut !== 'Réglée' && statut !== 'Non réglée') {
    reponse.status(400).json({ message: "Le statut doit être 'Réglée' ou 'Non réglée'." });
    return;
  }

  const idDette = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneDette[]>(
      'SELECT id FROM dettes WHERE id = ? AND utilisateurId = ?',
      [idDette, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Dette introuvable.' });
      return;
    }

    await bd.query('UPDATE dettes SET statut = ? WHERE id = ?', [statut, idDette]);

    const [lignesDettes] = await bd.query<LigneDette[]>(`${SELECT_DETTE} WHERE id = ?`, [idDette]);

    reponse.json(versDette(lignesDettes[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la mise à jour du statut de la dette.' });
  }
});

/**
 * Supprime une dette appartenant à l'utilisateur connecté.
 */
routeurDettes.delete('/dettes/:id', async (requete, reponse) => {
  const idDette = Number(requete.params.id);

  try {
    const [lignesExistantes] = await bd.query<LigneDette[]>(
      'SELECT id FROM dettes WHERE id = ? AND utilisateurId = ?',
      [idDette, requete.session.utilisateurId]
    );

    if (lignesExistantes.length === 0) {
      reponse.status(404).json({ message: 'Dette introuvable.' });
      return;
    }

    await bd.query('DELETE FROM dettes WHERE id = ?', [idDette]);

    reponse.status(204).send();
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la suppression de la dette.' });
  }
});

export default routeurDettes;
