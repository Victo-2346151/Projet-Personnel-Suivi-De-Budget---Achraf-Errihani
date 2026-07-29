import bcrypt from 'bcrypt';
import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import bd from '../config/bd';
import estConnecte from '../middlewares/estConnecte';
import type { IUtilisateurSansMotDePasse } from '../types';

const routeurAuthentification = Router();

const NOMBRE_TOURS_HACHAGE = 10;

interface LigneUtilisateur extends RowDataPacket {
  id: number;
  nom: string;
  courriel: string;
  motDePasse: string;
  dateCreation: Date;
}

/**
 * Retire le mot de passe haché d'une ligne d'utilisateur avant de la
 * renvoyer au frontend.
 */
function retirerMotDePasse(utilisateur: LigneUtilisateur): IUtilisateurSansMotDePasse {
  return {
    id: utilisateur.id,
    nom: utilisateur.nom,
    courriel: utilisateur.courriel,
    dateCreation: utilisateur.dateCreation,
  };
}

/**
 * Route d'inscription. Vérifie que le courriel n'est pas déjà utilisé,
 * hache le mot de passe, crée l'utilisateur et ouvre sa session.
 */
routeurAuthentification.post('/inscription', async (requete, reponse) => {
  const { nom, courriel, motDePasse } = requete.body as {
    nom?: string;
    courriel?: string;
    motDePasse?: string;
  };

  if (nom === undefined || courriel === undefined || motDePasse === undefined) {
    reponse.status(400).json({ message: 'Le nom, le courriel et le mot de passe sont requis.' });
    return;
  }

  try {
    const [utilisateursExistants] = await bd.query<LigneUtilisateur[]>(
      'SELECT id FROM utilisateurs WHERE courriel = ?',
      [courriel]
    );

    if (utilisateursExistants.length > 0) {
      reponse.status(400).json({ message: 'Ce courriel est déjà utilisé.' });
      return;
    }

    const motDePasseHache = await bcrypt.hash(motDePasse, NOMBRE_TOURS_HACHAGE);

    const [resultatInsertion] = await bd.query<ResultSetHeader>(
      'INSERT INTO utilisateurs (nom, courriel, motDePasse) VALUES (?, ?, ?)',
      [nom, courriel, motDePasseHache]
    );

    const [lignesUtilisateur] = await bd.query<LigneUtilisateur[]>(
      'SELECT id, nom, courriel, motDePasse, dateCreation FROM utilisateurs WHERE id = ?',
      [resultatInsertion.insertId]
    );

    const utilisateurCree = lignesUtilisateur[0];

    requete.session.utilisateurId = utilisateurCree.id;

    reponse.status(201).json(retirerMotDePasse(utilisateurCree));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: "Erreur lors de l'inscription." });
  }
});

/**
 * Route de connexion. Vérifie le courriel et le mot de passe, puis
 * ouvre la session si les identifiants sont valides. Le message
 * d'erreur reste générique pour ne pas révéler si un courriel existe.
 */
routeurAuthentification.post('/connexion', async (requete, reponse) => {
  const { courriel, motDePasse } = requete.body as { courriel?: string; motDePasse?: string };

  if (courriel === undefined || motDePasse === undefined) {
    reponse.status(400).json({ message: 'Le courriel et le mot de passe sont requis.' });
    return;
  }

  try {
    const [lignesUtilisateur] = await bd.query<LigneUtilisateur[]>(
      'SELECT id, nom, courriel, motDePasse, dateCreation FROM utilisateurs WHERE courriel = ?',
      [courriel]
    );

    const utilisateurTrouve = lignesUtilisateur[0];

    if (utilisateurTrouve === undefined) {
      reponse.status(401).json({ message: 'Courriel ou mot de passe invalide.' });
      return;
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateurTrouve.motDePasse);

    if (!motDePasseValide) {
      reponse.status(401).json({ message: 'Courriel ou mot de passe invalide.' });
      return;
    }

    requete.session.utilisateurId = utilisateurTrouve.id;

    reponse.json(retirerMotDePasse(utilisateurTrouve));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: 'Erreur lors de la connexion.' });
  }
});

/**
 * Route de déconnexion. Détruit la session en cours.
 */
routeurAuthentification.post('/deconnexion', (requete, reponse) => {
  requete.session.destroy((erreur) => {
    if (erreur) {
      reponse.status(500).json({ message: 'Erreur lors de la déconnexion.' });
      return;
    }

    reponse.status(204).send();
  });
});

/**
 * Route protégée qui retourne l'utilisateur actuellement connecté.
 */
routeurAuthentification.get('/moi', estConnecte, async (requete, reponse) => {
  try {
    const [lignesUtilisateur] = await bd.query<LigneUtilisateur[]>(
      'SELECT id, nom, courriel, motDePasse, dateCreation FROM utilisateurs WHERE id = ?',
      [requete.session.utilisateurId]
    );

    reponse.json(retirerMotDePasse(lignesUtilisateur[0]));
  } catch (erreur) {
    console.error(erreur);
    reponse.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur." });
  }
});

export default routeurAuthentification;
