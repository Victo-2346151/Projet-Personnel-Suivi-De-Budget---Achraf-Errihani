-- ============================================================
-- Script de creation de la base de donnees : suiviBudget
-- Projet personnel - Suivi de depenses personnelles + budget
-- ============================================================

-- Creation de la base de donnees 
CREATE DATABASE IF NOT EXISTS suiviBudget;

-- Selection de la base de donnees a utiliser pour la suite du script
USE suiviBudget;

-- ------------------------------------------------------------
-- Table utilisateurs
-- Contient les comptes des utilisateurs de l'application
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,          -- identifiant unique de l'utilisateur
  nom VARCHAR(100) NOT NULL,                  -- nom complet de l'utilisateur
  courriel VARCHAR(150) NOT NULL UNIQUE,      -- courriel, doit etre unique (sert a la connexion)
  motDePasse VARCHAR(255) NOT NULL,           -- mot de passe hache 
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP  -- date de creation du compte
);

-- ------------------------------------------------------------
-- Table categories
-- Contient les categories de revenus/depenses creees par chaque utilisateur
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,          -- identifiant unique de la categorie
  utilisateurId INT NOT NULL,                 -- reference vers le proprietaire de la categorie
  nom VARCHAR(50) NOT NULL,                   -- nom de la categorie (ex: Epicerie, Transport)
  type ENUM('revenu', 'depense') NOT NULL,    -- indique si la categorie sert aux revenus ou aux depenses
  budgetLimite DECIMAL(10, 2) DEFAULT NULL,   -- limite de budget
  -- Si l'utilisateur est supprime, ses categories le sont aussi
  CONSTRAINT fkCategoriesUtilisateur
    FOREIGN KEY (utilisateurId) REFERENCES utilisateurs(id)
    ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- Table transactions
-- Contient chaque revenu ou depense enregistre par un utilisateur
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,          -- identifiant unique de la transaction
  utilisateurId INT NOT NULL,                 -- reference vers le proprietaire de la transaction
  categorieId INT NOT NULL,                   -- reference vers la categorie associee
  montant DECIMAL(10, 2) NOT NULL,            -- montant de la transaction (toujours positif)
  type ENUM('revenu', 'depense') NOT NULL,    -- indique si c'est un revenu ou une depense
  description VARCHAR(255),                   -- description libre de la transaction
  dateTransaction DATE NOT NULL,               -- date a laquelle la transaction a eu lieu

  -- Si l'utilisateur est supprime, ses transactions le sont aussi
  CONSTRAINT fkTransactionsUtilisateur
    FOREIGN KEY (utilisateurId) REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

  -- Si la categorie est supprimee, on bloque la suppression tant que
  -- des transactions y sont encore liees pour evite de perdre l'historique
  CONSTRAINT fkTransactionsCategorie
    FOREIGN KEY (categorieId) REFERENCES categories(id)
    ON DELETE RESTRICT
);