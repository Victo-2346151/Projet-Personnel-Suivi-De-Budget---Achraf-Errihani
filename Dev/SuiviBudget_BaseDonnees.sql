-- ============================================================
-- Script de creation de la base de donnees : suiviBudget
-- Projet personnel - Suivi de depenses personnelles + budget
-- Auteur : Achraf Errihani / 2346151 
-- Date de creation : 27/07/2026
-- ============================================================

-- Creation de la base de donnees 
CREATE DATABASE IF NOT EXISTS suiviBudget;

-- Selection de la base de donnees
USE suiviBudget;

-- ------------------------------------------------------------
-- Table utilisateurs
-- Contient les comptes des utilisateurs de l'application
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS utilisateurs (
  id INT AUTO_INCREMENT PRIMARY KEY,         
  nom VARCHAR(100) NOT NULL,                  
  courriel VARCHAR(150) NOT NULL UNIQUE,     
  motDePasse VARCHAR(255) NOT NULL,           
  dateCreation DATETIME DEFAULT CURRENT_TIMESTAMP  
);

-- ------------------------------------------------------------
-- Table categories
-- Contient les categories de revenus/depenses creees par chaque utilisateur
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,          
  utilisateurId INT NOT NULL,                 
  nom VARCHAR(50) NOT NULL,                   
  type ENUM('revenu', 'depense') NOT NULL,   
  budgetLimite DECIMAL(10, 2) DEFAULT NULL,   
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
  id INT AUTO_INCREMENT PRIMARY KEY,          
  utilisateurId INT NOT NULL,                 
  categorieId INT NOT NULL,                   
  montant DECIMAL(10, 2) NOT NULL,            
  type ENUM('revenu', 'depense') NOT NULL,    
  description VARCHAR(255),                   
  dateTransaction DATE NOT NULL,               

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

-- ------------------------------------------------------------
-- Table dettes
-- Contient les dettes personnelles
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS dettes (
  id INT AUTO_INCREMENT PRIMARY KEY,          
  utilisateurId INT NOT NULL,                
  personne VARCHAR(100) NOT NULL,             
  montant DECIMAL(10, 2) NOT NULL,            
  direction ENUM('je_dois', 'on_me_doit') NOT NULL,  
  description VARCHAR(255),            
  dateCreation DATE NOT NULL,               
  statut ENUM('Réglée', 'Non réglée') NOT NULL DEFAULT 'Non réglée',

  -- Si l'utilisateur est supprime, ses dettes le sont aussi
  CONSTRAINT fkDettesUtilisateur
    FOREIGN KEY (utilisateurId) REFERENCES utilisateurs(id)
    ON DELETE CASCADE,

  -- Le montant d'une dette doit toujours etre strictement positif
  CONSTRAINT chkDettesMontantPositif CHECK (montant > 0)
);