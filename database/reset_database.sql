-- ===================================================================
-- SCRIPT DE NETTOYAGE ET RÉINITIALISATION COMPLÈTE
-- Exécutez ce script si vous voulez repartir à zéro
-- ===================================================================

USE douane;

-- ===================================================================
-- NETTOYAGE COMPLET DE LA BASE DE DONNÉES
-- ===================================================================

-- Désactiver les vérifications de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer toutes les données dans l'ordre inverse des dépendances
DELETE FROM Historique_Classifications;
DELETE FROM Produits_Membres;
DELETE FROM Produits;
DELETE FROM Sessions_Utilisateur;
DELETE FROM User;

-- Réinitialiser les compteurs auto-increment avec gestion des erreurs
ALTER TABLE User AUTO_INCREMENT = 1;
ALTER TABLE Produits AUTO_INCREMENT = 1;
ALTER TABLE Produits_Membres AUTO_INCREMENT = 1;
ALTER TABLE Historique_Classifications AUTO_INCREMENT = 1;

-- Pour Sessions_Utilisateur, on modifie temporairement la contrainte
ALTER TABLE Sessions_Utilisateur MODIFY COLUMN date_expiration TIMESTAMP NULL;
ALTER TABLE Sessions_Utilisateur AUTO_INCREMENT = 1;
-- Restaurer la contrainte NOT NULL si nécessaire
ALTER TABLE Sessions_Utilisateur MODIFY COLUMN date_expiration TIMESTAMP NOT NULL;

-- Réactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- ===================================================================
-- INSERTION DES UTILISATEURS DE TEST
-- ===================================================================

INSERT INTO User (nom_user, identifiant_user, email, mot_de_passe, is_admin, statut_compte) VALUES
('Jean Administrateur', 'admin', 'admin@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, 'actif'),
('Marie Douanière', 'marie.douane', 'marie@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 'actif'),
('Ahmed Classificateur', 'ahmed.class', 'ahmed@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 'actif'),
('Fatou Inspectrice', 'fatou.inspect', 'fatou@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 'actif');

-- ===================================================================
-- INSERTION DE PRODUITS DE TEST
-- ===================================================================

INSERT INTO Produits (
    origine_produit, description_produit, numero_serie, is_groupe, nombre_produits, 
    taux_imposition, section_produit, sous_section_produit, user_id, 
    statut_validation, code_tarifaire, valeur_declaree, poids_kg, unite_mesure, commentaires
) VALUES
-- Produits validés
('Côte d''Ivoire', 'Cacao en fèves, brut, de qualité supérieure', 'CAC2024001', FALSE, 1, 8.75, 'II', '18', 2, 'valide', '1801.00.10', 50000.00, 100.00, 'kg', 'Cacao de première qualité pour export'),
('Ghana', 'Huile de palme brute non raffinée', 'HPB2024001', FALSE, 1, 12.00, 'III', '15', 2, 'valide', '1511.10.00', 25000.00, 50.00, 'litre', 'Huile de palme traditionnelle'),
('Mali', 'Coton brut non cardé ni peigné', 'COT2024001', FALSE, 1, 17.25, 'XI', '52', 3, 'valide', '5201.00.00', 75000.00, 200.00, 'kg', 'Coton de qualité export'),
('Nigeria', 'Pétrole brut léger', 'PET2024001', FALSE, 1, 5.50, 'V', '27', 1, 'valide', '2709.00.10', 1000000.00, 500.00, 'litre', 'Pétrole brut Sweet Light'),

-- Produits en attente de validation
('Sénégal', 'Poisson séché traditionnel (thiof)', 'PSE2024001', FALSE, 1, 10.50, 'I', '03', 2, 'en_attente', '0305.20.00', 15000.00, 25.00, 'kg', 'Poisson traditionnel séché au soleil'),
('Burkina Faso', 'Or brut pour industrie', 'ORB2024001', FALSE, 1, 25.00, 'XIV', '71', 3, 'en_attente', '7108.12.00', 500000.00, 2.50, 'kg', 'Or 24 carats pour usage industriel'),
('Togo', 'Phosphate naturel brut', 'PHO2024001', FALSE, 1, 5.50, 'V', '25', 4, 'en_attente', '2510.20.00', 35000.00, 1000.00, 'kg', 'Phosphate pour engrais'),
('Bénin', 'Noix de cajou décortiquées', 'CAJ2024001', FALSE, 1, 8.75, 'II', '08', 2, 'en_attente', '0801.32.00', 40000.00, 50.00, 'kg', 'Noix de cajou premium');

-- ===================================================================
-- MISE À JOUR DES COMPTEURS
-- ===================================================================

UPDATE User SET nombre_produits_classes = (
    SELECT COUNT(*) FROM Produits WHERE Produits.user_id = User.user_id
);

-- ===================================================================
-- VÉRIFICATION FINALE
-- ===================================================================

SELECT 'BASE DE DONNÉES RÉINITIALISÉE AVEC SUCCÈS!' as resultat;

SELECT '========== UTILISATEURS ==========' as section;
SELECT user_id, nom_user, identifiant_user, email, is_admin, nombre_produits_classes FROM User ORDER BY user_id;

SELECT '========== PRODUITS ==========' as section;
SELECT p.id_produit, p.description_produit, p.section_produit, p.statut_validation, u.nom_user 
FROM Produits p JOIN User u ON p.user_id = u.user_id ORDER BY p.id_produit;

SELECT '========== COMPTES DE TEST ==========' as section;
SELECT 'admin@douane.gov / password (Administrateur)' as compte_1;
SELECT 'marie@douane.gov / password (Utilisateur)' as compte_2;
SELECT 'ahmed@douane.gov / password (Utilisateur)' as compte_3;
SELECT 'fatou@douane.gov / password (Utilisateur)' as compte_4;
