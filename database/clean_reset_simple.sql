-- ===================================================================
-- SCRIPT DE NETTOYAGE SIMPLE ET SÉCURISÉ - VERSION COMPATIBLE MYSQL
-- Version sans requêtes de formatage problématiques
-- ===================================================================

USE douane;

-- ===================================================================
-- NETTOYAGE SIMPLE (suppression seulement, pas de réinitialisation AUTO_INCREMENT)
-- ===================================================================

-- Désactiver les vérifications de clés étrangères
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les données dans l'ordre des dépendances
DELETE FROM Historique_Classifications;
DELETE FROM Produits_Membres;
DELETE FROM Produits;
DELETE FROM Sessions_Utilisateur;
DELETE FROM User;

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
('Bénin', 'Noix de cajou décortiquées', 'CAJ2024001', FALSE, 1, 8.75, 'II', '08', 2, 'en_attente', '0801.32.00', 40000.00, 50.00, 'kg', 'Noix de cajou premium'),

-- Produits groupés
('Guinée', 'Ensemble d''outils agricoles traditionnels', 'OUT2024001', TRUE, 5, 22.50, 'XVI', '82', 3, 'valide', '8201.30.00', 80000.00, 45.00, 'unité', 'Set complet d''outils pour agriculture'),
('Sierra Leone', 'Lot de diamants bruts industriels', 'DIA2024001', TRUE, 10, 25.00, 'XIV', '71', 1, 'en_attente', '7102.31.00', 750000.00, 0.50, 'carat', 'Diamants pour usage industriel');

-- ===================================================================
-- INSERTION DE PRODUITS MEMBRES (pour les groupes)
-- ===================================================================

-- Récupérer l'ID du produit groupé d'outils agricoles
SET @tools_product_id = (SELECT id_produit FROM Produits WHERE numero_serie = 'OUT2024001' LIMIT 1);

INSERT INTO Produits_Membres (
    id_produit, id_produit_membre, taux_imposition_membre, nom_produit_membre, 
    origine_produit_membre, description_produit_membre, numero_serie_membre,
    section_produit_membre, sous_section_produit_membre, user_qui_classe_membre,
    quantite_membre, valeur_unitaire_membre, poids_unitaire_membre, code_tarifaire_membre
) VALUES
-- Membres de l'ensemble d'outils agricoles
(@tools_product_id, 'OUT2024001-A', 22.50, 'Houe traditionnelle', 'Guinée', 'Houe en acier forgé avec manche en bois', 'OUT-A-001', 'XVI', '82', 3, 2, 15000.00, 8.00, '8201.30.10'),
(@tools_product_id, 'OUT2024001-B', 22.50, 'Machette de débroussaillage', 'Guinée', 'Machette en acier carbone', 'OUT-B-002', 'XVI', '82', 3, 2, 12000.00, 5.00, '8201.30.20'),
(@tools_product_id, 'OUT2024001-C', 22.50, 'Faucille traditionnelle', 'Guinée', 'Faucille pour récolte manuelle', 'OUT-C-003', 'XVI', '82', 3, 1, 8000.00, 2.00, '8201.30.30');

-- ===================================================================
-- MISE À JOUR DES COMPTEURS
-- ===================================================================

UPDATE User SET nombre_produits_classes = (
    SELECT COUNT(*) FROM Produits WHERE Produits.user_id = User.user_id
);

-- ===================================================================
-- INSERTION D'HISTORIQUE
-- ===================================================================

INSERT INTO Historique_Classifications (id_produit, user_id, action_effectuee, commentaire_historique) 
SELECT p.id_produit, 1, 'validation', CONCAT('Validation automatique pour: ', p.description_produit)
FROM Produits p 
WHERE p.statut_validation = 'valide'
LIMIT 5;

-- ===================================================================
-- REQUÊTES DE VÉRIFICATION (à exécuter séparément si nécessaire)
-- ===================================================================

-- Vérifier les utilisateurs créés
-- SELECT user_id, nom_user, identifiant_user, email, is_admin, nombre_produits_classes FROM User ORDER BY user_id;

-- Vérifier les produits créés
-- SELECT id_produit, LEFT(description_produit, 50) as description, section_produit, statut_validation FROM Produits ORDER BY id_produit;

-- Statistiques par section
-- SELECT section_produit, COUNT(*) as total, SUM(CASE WHEN statut_validation = 'valide' THEN 1 ELSE 0 END) as valides FROM Produits GROUP BY section_produit;
