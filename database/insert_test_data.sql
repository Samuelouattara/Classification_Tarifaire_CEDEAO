-- ===================================================================
-- SCRIPT DE DONNÉES DE TEST POUR LA BASE DOUANE
-- Exécutez ce script dans phpMyAdmin après avoir importé database_setup.sql
-- ===================================================================

USE douane;

-- ===================================================================
-- NETTOYAGE OPTIONNEL (décommentez si vous voulez repartir à zéro)
-- ===================================================================
-- DELETE FROM Historique_Classifications;
-- DELETE FROM Produits_Membres;
-- DELETE FROM Produits;
-- DELETE FROM Sessions_Utilisateur;
-- DELETE FROM User;
-- ALTER TABLE User AUTO_INCREMENT = 1;
-- ALTER TABLE Produits AUTO_INCREMENT = 1;

-- ===================================================================
-- INSERTION DES UTILISATEURS DE TEST (avec gestion des doublons)
-- ===================================================================

-- Note: Le mot de passe pour tous les utilisateurs est "password"
-- Hash généré: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

-- Insertion sécurisée avec vérification des doublons
INSERT IGNORE INTO User (nom_user, identifiant_user, email, mot_de_passe, is_admin, statut_compte) VALUES
('Jean Administrateur', 'admin', 'admin@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE, 'actif'),
('Marie Douanière', 'marie.douane', 'marie@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 'actif'),
('Ahmed Classificateur', 'ahmed.class', 'ahmed@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 'actif'),
('Fatou Inspectrice', 'fatou.inspect', 'fatou@douane.gov', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', FALSE, 'actif');

-- Vérification des utilisateurs existants
SELECT 'VÉRIFICATION DES UTILISATEURS:' as info;
SELECT user_id, nom_user, identifiant_user, email, is_admin FROM User ORDER BY user_id;

-- ===================================================================
-- INSERTION DE PRODUITS DE TEST (avec gestion des doublons)
-- ===================================================================

-- Récupération des IDs utilisateurs pour éviter les erreurs
SET @admin_id = (SELECT user_id FROM User WHERE identifiant_user = 'admin' LIMIT 1);
SET @marie_id = (SELECT user_id FROM User WHERE identifiant_user = 'marie.douane' LIMIT 1);
SET @ahmed_id = (SELECT user_id FROM User WHERE identifiant_user = 'ahmed.class' LIMIT 1);
SET @fatou_id = (SELECT user_id FROM User WHERE identifiant_user = 'fatou.inspect' LIMIT 1);

-- Nettoyage des produits existants (optionnel)
-- DELETE FROM Produits WHERE numero_serie IN ('CAC2024001', 'HPB2024001', 'COT2024001', 'PET2024001', 'PSE2024001', 'ORB2024001', 'PHO2024001', 'CAJ2024001', 'OUT2024001', 'DIA2024001');

INSERT IGNORE INTO Produits (
    origine_produit, description_produit, numero_serie, is_groupe, nombre_produits, 
    taux_imposition, section_produit, sous_section_produit, user_id, 
    statut_validation, code_tarifaire, valeur_declaree, poids_kg, unite_mesure, commentaires
) VALUES
-- Produits validés
('Côte d''Ivoire', 'Cacao en fèves, brut, de qualité supérieure', 'CAC2024001', FALSE, 1, 8.75, 'II', '18', @marie_id, 'valide', '1801.00.10', 50000.00, 100.00, 'kg', 'Cacao de première qualité pour export'),
('Ghana', 'Huile de palme brute non raffinée', 'HPB2024001', FALSE, 1, 12.00, 'III', '15', @marie_id, 'valide', '1511.10.00', 25000.00, 50.00, 'litre', 'Huile de palme traditionnelle'),
('Mali', 'Coton brut non cardé ni peigné', 'COT2024001', FALSE, 1, 17.25, 'XI', '52', @ahmed_id, 'valide', '5201.00.00', 75000.00, 200.00, 'kg', 'Coton de qualité export'),
('Nigeria', 'Pétrole brut léger', 'PET2024001', FALSE, 1, 5.50, 'V', '27', @admin_id, 'valide', '2709.00.10', 1000000.00, 500.00, 'litre', 'Pétrole brut Sweet Light'),

-- Produits en attente de validation
('Sénégal', 'Poisson séché traditionnel (thiof)', 'PSE2024001', FALSE, 1, 10.50, 'I', '03', @marie_id, 'en_attente', '0305.20.00', 15000.00, 25.00, 'kg', 'Poisson traditionnel séché au soleil'),
('Burkina Faso', 'Or brut pour industrie', 'ORB2024001', FALSE, 1, 25.00, 'XIV', '71', @ahmed_id, 'en_attente', '7108.12.00', 500000.00, 2.50, 'kg', 'Or 24 carats pour usage industriel'),
('Togo', 'Phosphate naturel brut', 'PHO2024001', FALSE, 1, 5.50, 'V', '25', @fatou_id, 'en_attente', '2510.20.00', 35000.00, 1000.00, 'kg', 'Phosphate pour engrais'),
('Bénin', 'Noix de cajou décortiquées', 'CAJ2024001', FALSE, 1, 8.75, 'II', '08', @marie_id, 'en_attente', '0801.32.00', 40000.00, 50.00, 'kg', 'Noix de cajou premium'),

-- Produits groupés (exemple)
('Guinée', 'Ensemble d''outils agricoles traditionnels', 'OUT2024001', TRUE, 5, 22.50, 'XVI', '82', @ahmed_id, 'valide', '8201.30.00', 80000.00, 45.00, 'unité', 'Set complet d''outils pour agriculture'),
('Sierra Leone', 'Lot de diamants bruts industriels', 'DIA2024001', TRUE, 10, 25.00, 'XIV', '71', @admin_id, 'en_attente', '7102.31.00', 750000.00, 0.50, 'carat', 'Diamants pour usage industriel');

-- ===================================================================
-- INSERTION DE PRODUITS MEMBRES (pour les groupes)
-- ===================================================================

INSERT INTO Produits_Membres (
    id_produit, id_produit_membre, taux_imposition_membre, nom_produit_membre, 
    origine_produit_membre, description_produit_membre, numero_serie_membre,
    section_produit_membre, sous_section_produit_membre, user_qui_classe_membre,
    quantite_membre, valeur_unitaire_membre, poids_unitaire_membre, code_tarifaire_membre
) VALUES
-- Membres de l'ensemble d'outils agricoles (id_produit = 9)
(9, 'OUT2024001-A', 22.50, 'Houe traditionnelle', 'Guinée', 'Houe en acier forgé avec manche en bois', 'OUT-A-001', 'XVI', '82', 3, 2, 15000.00, 8.00, '8201.30.10'),
(9, 'OUT2024001-B', 22.50, 'Machette de débroussaillage', 'Guinée', 'Machette en acier carbone', 'OUT-B-002', 'XVI', '82', 3, 2, 12000.00, 5.00, '8201.30.20'),
(9, 'OUT2024001-C', 22.50, 'Faucille traditionnelle', 'Guinée', 'Faucille pour récolte manuelle', 'OUT-C-003', 'XVI', '82', 3, 1, 8000.00, 2.00, '8201.30.30');

-- ===================================================================
-- MISE À JOUR DES COMPTEURS UTILISATEURS
-- ===================================================================

UPDATE User SET nombre_produits_classes = (
    SELECT COUNT(*) FROM Produits WHERE Produits.user_id = User.user_id
);

-- ===================================================================
-- INSERTION D'HISTORIQUE DE CLASSIFICATIONS
-- ===================================================================

INSERT INTO Historique_Classifications (id_produit, user_id, action_effectuee, commentaire_historique) VALUES
(1, 1, 'validation', 'Produit validé par l''administrateur - conforme aux standards CEDEAO'),
(2, 1, 'validation', 'Classification approuvée après vérification'),
(3, 2, 'validation', 'Produit coton validé - taux standard appliqué'),
(4, 1, 'validation', 'Pétrole brut - classification prioritaire validée'),
(9, 3, 'creation', 'Création d''un groupe de produits agricoles');

-- ===================================================================
-- VÉRIFICATIONS ET STATISTIQUES
-- ===================================================================

-- Affichage des utilisateurs créés
SELECT 'UTILISATEURS CRÉÉS:' as info;
SELECT user_id, nom_user, identifiant_user, email, is_admin, statut_compte, nombre_produits_classes, date_creation 
FROM User 
ORDER BY user_id;

-- Affichage des produits créés
SELECT '' as separator;
SELECT 'PRODUITS CRÉÉS:' as info;
SELECT p.id_produit, p.description_produit, p.section_produit, p.statut_validation, u.nom_user, p.date_classification
FROM Produits p
JOIN User u ON p.user_id = u.user_id
ORDER BY p.id_produit;

-- Statistiques par section
SELECT '' as separator;
SELECT 'STATISTIQUES PAR SECTION:' as info;
SELECT 
    section_produit,
    COUNT(*) as nombre_produits,
    SUM(CASE WHEN statut_validation = 'valide' THEN 1 ELSE 0 END) as valides,
    SUM(CASE WHEN statut_validation = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
    AVG(taux_imposition) as taux_moyen
FROM Produits 
GROUP BY section_produit 
ORDER BY section_produit;

-- Statistiques par utilisateur
SELECT '' as separator;
SELECT 'STATISTIQUES PAR UTILISATEUR:' as info;
SELECT 
    u.nom_user,
    u.email,
    COUNT(p.id_produit) as total_produits,
    SUM(CASE WHEN p.statut_validation = 'valide' THEN 1 ELSE 0 END) as produits_valides,
    SUM(CASE WHEN p.statut_validation = 'en_attente' THEN 1 ELSE 0 END) as produits_en_attente,
    SUM(p.valeur_declaree) as valeur_totale
FROM User u
LEFT JOIN Produits p ON u.user_id = p.user_id
GROUP BY u.user_id, u.nom_user, u.email
ORDER BY u.user_id;

-- ===================================================================
-- INFORMATIONS DE CONNEXION
-- ===================================================================

SELECT '' as separator;
SELECT 'COMPTES DE TEST DISPONIBLES:' as info;
SELECT 'Email: admin@douane.gov | Mot de passe: password | Rôle: Administrateur' as compte_1;
SELECT 'Email: marie@douane.gov | Mot de passe: password | Rôle: Utilisateur' as compte_2;
SELECT 'Email: ahmed@douane.gov | Mot de passe: password | Rôle: Utilisateur' as compte_3;
SELECT 'Email: fatou@douane.gov | Mot de passe: password | Rôle: Utilisateur' as compte_4;

SELECT '' as separator;
SELECT 'PROCHAINES ÉTAPES:' as info;
SELECT '1. Testez la connexion avec database/test-db.html' as etape_1;
SELECT '2. Utilisez classification-interface.html pour classifier' as etape_2;
SELECT '3. Consultez historique-valide.html pour voir les résultats' as etape_3;
