-- Script d'insertion de données de test pour la base douane
-- Données d'exemple avec utilisateurs et produits de test
-- ATTENTION: Exécutez ce script dans phpMyAdmin après avoir importé database_setup.sql

USE douane;

-- Insertion d'utilisateurs de test (mots de passe hashés avec bcrypt)
INSERT INTO User (nom_user, identifiant_user, mot_de_passe, email, is_admin) VALUES
('Administrateur Système', 'admin', '$2b$12$LQv3c1yqBwEFSMcFz/1F9OXUr8J6CjXdKfZ8YcqzN1e/qV3X7K4gS', 'admin@douane-cedeao.org', TRUE),
('Marie Kouadio', 'mkouadio', '$2b$12$8HNI6.5KedFGq0rtEj/5j.1s8h1r9FpqE0XnVvP3K4Y8R2L6M7N9O', 'marie.kouadio@douane-ci.gov', FALSE),
('Ahmed Diallo', 'adiallo', '$2b$12$9JOK7.6LfeGHr1suFk.6k.2t9i2s0GqrF1YoWwQ4L5Z9S3M7N8O0P', 'ahmed.diallo@douane-sn.gov', FALSE),
('Fatou Traoré', 'ftraore', '$2b$12$0KPL8.7MgfHIs2tvGl.7l.3u0j3t1HrsG2ZpXxR5M6A0T4N8O9P1Q', 'fatou.traore@douane-ml.gov', FALSE),
('Jean-Claude Mensah', 'jmensah', '$2b$12$1LQM9.8NhgIJt3uwHm.8m.4v1k4u2IstH3AqYyS6N7B1U5O9P0Q2R', 'jc.mensah@douane-gh.gov', FALSE);

-- Insertion de produits de test individuels
INSERT INTO Produits (origine_produit, description_produit, numero_serie, is_groupe, nombre_produits, taux_imposition, section_produit, sous_section_produit, user_id, code_tarifaire, valeur_declaree, poids_kg, unite_mesure) VALUES
('Côte d\'Ivoire', 'Cacao en fèves brutes', 'CAC-2024-001', FALSE, 1, 8.75, 'II', '18', 2, '1801.00.10', 5000.00, 1000.50, 'kg'),
('Sénégal', 'Poisson frais (thiof)', 'FISH-2024-002', FALSE, 1, 10.50, 'I', '03', 3, '0302.69.90', 2500.00, 150.75, 'kg'),
('Mali', 'Or en lingots', 'GOLD-2024-003', FALSE, 1, 25.00, 'XIV', '71', 4, '7108.13.00', 50000.00, 2.15, 'kg'),
('Ghana', 'Textile en coton', 'TEXT-2024-004', FALSE, 1, 17.25, 'XI', '52', 5, '5208.21.00', 1200.00, 45.30, 'm'),
('Burkina Faso', 'Machine agricole', 'MACH-2024-005', FALSE, 1, 22.50, 'XVI', '84', 2, '8432.21.00', 15000.00, 850.00, 'unité');

-- Insertion d'un produit groupe/paquet
INSERT INTO Produits (origine_produit, description_produit, numero_serie, is_groupe, nombre_produits, taux_imposition, section_produit, sous_section_produit, user_id, code_tarifaire, valeur_declaree, poids_kg, unite_mesure) VALUES
('Côte d\'Ivoire', 'Paquet de produits alimentaires variés', 'PACK-2024-006', TRUE, 5, 13.50, 'IV', '16-24', 2, 'PACK.001', 8500.00, 250.75, 'lot');

-- Insertion des produits membres du paquet
INSERT INTO Produits_Membres (id_produit, id_produit_membre, taux_imposition_membre, nom_produit_membre, origine_produit_membre, description_produit_membre, numero_serie_membre, section_produit_membre, sous_section_produit_membre, user_qui_classe_membre, quantite_membre, valeur_unitaire_membre, poids_unitaire_membre, code_tarifaire_membre) VALUES
(6, 'PACK-006-M001', 15.25, 'Chocolat en tablettes', 'Côte d\'Ivoire', 'Chocolat noir 70% cacao en tablettes de 100g', 'CHOC-001', 'IV', '18', 2, 50, 3.50, 0.10, '1806.32.10'),
(6, 'PACK-006-M002', 15.25, 'Café torréfié', 'Côte d\'Ivoire', 'Café arabica torréfié en grains', 'CAFE-002', 'IV', '09', 2, 20, 12.00, 0.50, '0901.21.00'),
(6, 'PACK-006-M003', 15.25, 'Conserve de thon', 'Sénégal', 'Thon à l\'huile en boîte de 200g', 'THON-003', 'IV', '16', 3, 100, 2.25, 0.20, '1604.14.11'),
(6, 'PACK-006-M004', 15.25, 'Huile de palme', 'Ghana', 'Huile de palme raffinée 1L', 'PALM-004', 'III', '15', 5, 30, 4.80, 1.00, '1511.10.90'),
(6, 'PACK-006-M005', 15.25, 'Biscuits secs', 'Mali', 'Biscuits au beurre emballés 250g', 'BISC-005', 'IV', '19', 4, 80, 1.75, 0.25, '1905.31.30');

-- Insertion d'un autre produit groupe avec différents taux
INSERT INTO Produits (origine_produit, description_produit, numero_serie, is_groupe, nombre_produits, taux_imposition, section_produit, sous_section_produit, user_id, code_tarifaire, valeur_declaree, poids_kg, unite_mesure) VALUES
('Niger', 'Lot d\'équipements électroniques', 'ELEC-2024-007', TRUE, 3, 20.00, 'XVI', '85', 3, 'ELEC.002', 25000.00, 125.50, 'lot');

-- Produits membres du lot électronique
INSERT INTO Produits_Membres (id_produit, id_produit_membre, taux_imposition_membre, nom_produit_membre, origine_produit_membre, description_produit_membre, numero_serie_membre, section_produit_membre, sous_section_produit_membre, user_qui_classe_membre, quantite_membre, valeur_unitaire_membre, poids_unitaire_membre, code_tarifaire_membre) VALUES
(7, 'ELEC-007-M001', 22.50, 'Téléphones portables', 'Chine', 'Smartphones Android 6.5 pouces', 'TEL-001', 'XVI', '85', 3, 10, 200.00, 0.18, '8517.12.00'),
(7, 'ELEC-007-M002', 22.50, 'Ordinateurs portables', 'Chine', 'Laptops 15 pouces Intel Core i5', 'LAP-002', 'XVI', '84', 3, 5, 800.00, 2.50, '8471.30.00'),
(7, 'ELEC-007-M003', 22.50, 'Accessoires électroniques', 'Corée du Sud', 'Câbles, chargeurs, écouteurs', 'ACC-003', 'XVI', '85', 3, 50, 15.00, 0.05, '8544.42.90');

-- Mise à jour du statut de validation pour certains produits
UPDATE Produits SET statut_validation = 'valide' WHERE id_produit IN (1, 2, 3);
UPDATE Produits SET statut_validation = 'en_revision' WHERE id_produit = 4;
UPDATE Produits SET statut_validation = 'en_attente' WHERE id_produit IN (5, 6, 7);

-- Insertion d'historique pour les validations
INSERT INTO Historique_Classifications (id_produit, user_id, action_effectuee, nouvelle_section, nouveau_taux, commentaire_historique) VALUES
(1, 1, 'validation', 'II', 8.75, 'Produit validé - Classification correcte'),
(2, 1, 'validation', 'I', 10.50, 'Produit validé - Poisson frais conforme'),
(3, 1, 'validation', 'XIV', 25.00, 'Produit validé - Or certifié');

-- Insertion de sessions actives pour les tests
INSERT INTO Sessions_Utilisateur (user_id, token_session, date_expiration, ip_adresse, user_agent) VALUES
(1, 'admin_session_2024_token_xyz123', DATE_ADD(NOW(), INTERVAL 24 HOUR), '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'marie_session_2024_token_abc456', DATE_ADD(NOW(), INTERVAL 12 HOUR), '192.168.1.101', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(3, 'ahmed_session_2024_token_def789', DATE_ADD(NOW(), INTERVAL 8 HOUR), '192.168.1.102', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36');

-- Génération d'un rapport de test
INSERT INTO Rapports_Classification (type_rapport, periode_debut, periode_fin, nombre_classifications, nombre_validations, nombre_rejets, total_droits_douane, user_generateur) VALUES
('quotidien', CURDATE(), CURDATE(), 7, 3, 0, 156750.00, 1);

-- Requêtes de vérification et test
SELECT '=== VERIFICATION DES DONNEES INSEREES ===' as info;

SELECT 'Utilisateurs créés:' as info;
SELECT user_id, nom_user, identifiant_user, email, is_admin, nombre_produits_classes FROM User;

SELECT 'Produits principaux:' as info;
SELECT id_produit, origine_produit, LEFT(description_produit, 50) as description, is_groupe, nombre_produits, section_produit, statut_validation FROM Produits;

SELECT 'Produits membres des paquets:' as info;
SELECT pm.id_produit, pm.id_produit_membre, pm.nom_produit_membre, pm.taux_imposition_membre, pm.section_produit_membre 
FROM Produits_Membres pm
ORDER BY pm.id_produit, pm.id_produit_membre;

SELECT 'Statistiques par utilisateur:' as info;
SELECT * FROM Vue_Statistiques_Utilisateur;

SELECT 'Historique des actions:' as info;
SELECT h.id_produit, u.nom_user, h.action_effectuee, h.nouvelle_section, h.date_action 
FROM Historique_Classifications h
JOIN User u ON h.user_id = u.user_id
ORDER BY h.date_action DESC;

SELECT 'Sessions actives:' as info;
SELECT s.user_id, u.nom_user, s.token_session, s.date_creation, s.statut_session 
FROM Sessions_Utilisateur s
JOIN User u ON s.user_id = u.user_id
WHERE s.statut_session = 'active';

-- Test des procédures stockées
SELECT '=== TEST DES PROCEDURES STOCKEES ===' as info;

SELECT 'Statistiques utilisateur Marie Kouadio (ID: 2):' as info;
CALL GetUserStatistics(2);

SELECT 'Validation du produit 4:' as info;
CALL ValidateProduct(4, 1);

-- Vérification après validation
SELECT 'Statut après validation:' as info;
SELECT id_produit, description_produit, statut_validation FROM Produits WHERE id_produit = 4;
