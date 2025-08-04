-- Base de données pour le système de classification tarifaire CEDEAO
-- Création de la base de données douane

CREATE DATABASE IF NOT EXISTS douane 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE douane;

-- Table des utilisateurs
CREATE TABLE User (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    nom_user VARCHAR(100) NOT NULL,
    identifiant_user VARCHAR(50) UNIQUE NOT NULL,
    mot_de_passe VARCHAR(255) NOT NULL, -- Mot de passe hashé
    email VARCHAR(150) UNIQUE NOT NULL,
    nombre_produits_classes INT DEFAULT 0,
    is_admin BOOLEAN DEFAULT FALSE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP NULL,
    statut_compte ENUM('actif', 'inactif', 'suspendu') DEFAULT 'actif',
    INDEX idx_identifiant (identifiant_user),
    INDEX idx_email (email)
);

-- Table des taux d'imposition par section
CREATE TABLE Taux_Imposition (
    id_taux INT AUTO_INCREMENT PRIMARY KEY,
    section VARCHAR(10) NOT NULL,
    sous_section VARCHAR(20),
    taux_pourcentage DECIMAL(5,2) NOT NULL,
    description_taux TEXT,
    date_application DATE NOT NULL,
    date_fin DATE NULL,
    statut_taux ENUM('actif', 'inactif') DEFAULT 'actif',
    UNIQUE KEY unique_section_periode (section, sous_section, date_application)
);

-- Table principale des produits
CREATE TABLE Produits (
    id_produit INT AUTO_INCREMENT PRIMARY KEY,
    origine_produit VARCHAR(100) NOT NULL,
    description_produit TEXT NOT NULL,
    numero_serie VARCHAR(50) NULL,
    is_groupe BOOLEAN DEFAULT FALSE,
    nombre_produits INT DEFAULT 1,
    taux_imposition DECIMAL(5,2) NOT NULL,
    section_produit VARCHAR(10) NOT NULL,
    sous_section_produit VARCHAR(20),
    user_id INT NOT NULL,
    date_classification TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    statut_validation ENUM('en_attente', 'valide', 'rejete', 'en_revision') DEFAULT 'en_attente',
    code_tarifaire VARCHAR(20),
    valeur_declaree DECIMAL(15,2),
    poids_kg DECIMAL(10,3),
    unite_mesure VARCHAR(20),
    commentaires TEXT,
    INDEX idx_section (section_produit),
    INDEX idx_user (user_id),
    INDEX idx_date_classification (date_classification),
    INDEX idx_statut (statut_validation),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- Table des produits membres (pour les paquets/groupes)
CREATE TABLE Produits_Membres (
    id_membre INT AUTO_INCREMENT PRIMARY KEY,
    id_produit INT NOT NULL,
    id_produit_membre VARCHAR(50) NOT NULL,
    taux_imposition_membre DECIMAL(5,2) NOT NULL,
    nom_produit_membre VARCHAR(200) NOT NULL,
    origine_produit_membre VARCHAR(100) NOT NULL,
    description_produit_membre TEXT NOT NULL,
    numero_serie_membre VARCHAR(50) NULL,
    section_produit_membre VARCHAR(10) NOT NULL,
    sous_section_produit_membre VARCHAR(20),
    user_qui_classe_membre INT NOT NULL,
    date_classification_membre TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification_membre TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    quantite_membre INT DEFAULT 1,
    valeur_unitaire_membre DECIMAL(12,2),
    poids_unitaire_membre DECIMAL(8,3),
    code_tarifaire_membre VARCHAR(20),
    INDEX idx_produit_principal (id_produit),
    INDEX idx_section_membre (section_produit_membre),
    INDEX idx_user_membre (user_qui_classe_membre),
    INDEX idx_date_classification_membre (date_classification_membre),
    FOREIGN KEY (id_produit) REFERENCES Produits(id_produit) ON DELETE CASCADE,
    FOREIGN KEY (user_qui_classe_membre) REFERENCES User(user_id) ON DELETE RESTRICT
);

-- Table des sessions utilisateur
CREATE TABLE Sessions_Utilisateur (
    id_session INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token_session VARCHAR(255) UNIQUE NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_expiration TIMESTAMP NOT NULL,
    ip_adresse VARCHAR(45),
    user_agent TEXT,
    statut_session ENUM('active', 'expiree', 'fermee') DEFAULT 'active',
    INDEX idx_user_session (user_id),
    INDEX idx_token (token_session),
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- Table d'historique des classifications
CREATE TABLE Historique_Classifications (
    id_historique INT AUTO_INCREMENT PRIMARY KEY,
    id_produit INT NOT NULL,
    user_id INT NOT NULL,
    action_effectuee ENUM('creation', 'modification', 'validation', 'rejet') NOT NULL,
    ancienne_section VARCHAR(10),
    nouvelle_section VARCHAR(10),
    ancien_taux DECIMAL(5,2),
    nouveau_taux DECIMAL(5,2),
    commentaire_historique TEXT,
    date_action TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_produit_historique (id_produit),
    INDEX idx_user_historique (user_id),
    INDEX idx_date_action (date_action),
    FOREIGN KEY (id_produit) REFERENCES Produits(id_produit) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE RESTRICT
);

-- Table des rapports et statistiques
CREATE TABLE Rapports_Classification (
    id_rapport INT AUTO_INCREMENT PRIMARY KEY,
    type_rapport ENUM('quotidien', 'hebdomadaire', 'mensuel', 'annuel') NOT NULL,
    periode_debut DATE NOT NULL,
    periode_fin DATE NOT NULL,
    nombre_classifications INT DEFAULT 0,
    nombre_validations INT DEFAULT 0,
    nombre_rejets INT DEFAULT 0,
    total_droits_douane DECIMAL(15,2) DEFAULT 0.00,
    user_generateur INT NOT NULL,
    date_generation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fichier_rapport VARCHAR(255),
    INDEX idx_periode (periode_debut, periode_fin),
    INDEX idx_type_rapport (type_rapport),
    FOREIGN KEY (user_generateur) REFERENCES User(user_id) ON DELETE RESTRICT
);

-- Insertion des taux d'imposition pour les sections CEDEAO
INSERT INTO Taux_Imposition (section, sous_section, taux_pourcentage, description_taux, date_application) VALUES
('I', '01-05', 10.50, 'Animaux vivants et produits du règne animal', '2024-01-01'),
('II', '06-14', 8.75, 'Produits du règne végétal', '2024-01-01'),
('III', '15', 12.00, 'Graisses et huiles animales, végétales', '2024-01-01'),
('IV', '16-24', 15.25, 'Produits des industries alimentaires', '2024-01-01'),
('V', '25-27', 5.50, 'Produits minéraux', '2024-01-01'),
('VI', '28-38', 18.75, 'Produits des industries chimiques', '2024-01-01'),
('VII', '39-40', 14.50, 'Matières plastiques et caoutchouc', '2024-01-01'),
('VIII', '41-43', 16.25, 'Peaux, cuirs et ouvrages', '2024-01-01'),
('IX', '44-46', 11.75, 'Bois, charbon de bois et ouvrages', '2024-01-01'),
('X', '47-49', 13.50, 'Pâtes de bois, papier et carton', '2024-01-01'),
('XI', '50-63', 17.25, 'Matières textiles et ouvrages', '2024-01-01'),
('XII', '64-67', 19.50, 'Chaussures, coiffures, parapluies', '2024-01-01'),
('XIII', '68-70', 9.25, 'Ouvrages en pierres, céramique, verre', '2024-01-01'),
('XIV', '71', 25.00, 'Perles, pierres gemmes, métaux précieux', '2024-01-01'),
('XV', '72-83', 12.75, 'Métaux communs et ouvrages', '2024-01-01'),
('XVI', '84-85', 22.50, 'Machines et appareils électriques', '2024-01-01'),
('XVII', '86-89', 20.75, 'Matériel de transport', '2024-01-01'),
('XVIII', '90-92', 16.50, 'Instruments d\'optique, de mesure, horlogerie', '2024-01-01'),
('XIX', '93', 35.00, 'Armes, munitions', '2024-01-01'),
('XX', '94-96', 15.75, 'Marchandises et produits divers', '2024-01-01'),
('XXI', '97', 30.00, 'Objets d\'art, de collection ou d\'antiquité', '2024-01-01');

-- Création des vues pour faciliter les requêtes
CREATE VIEW Vue_Produits_Complets AS
SELECT 
    p.id_produit,
    p.origine_produit,
    p.description_produit,
    p.numero_serie,
    p.is_groupe,
    p.nombre_produits,
    p.taux_imposition,
    p.section_produit,
    p.sous_section_produit,
    p.date_classification,
    p.statut_validation,
    p.code_tarifaire,
    p.valeur_declaree,
    p.poids_kg,
    u.nom_user,
    u.identifiant_user,
    u.email,
    ti.description_taux
FROM Produits p
JOIN User u ON p.user_id = u.user_id
LEFT JOIN Taux_Imposition ti ON p.section_produit = ti.section
WHERE ti.statut_taux = 'actif';

CREATE VIEW Vue_Statistiques_Utilisateur AS
SELECT 
    u.user_id,
    u.nom_user,
    u.identifiant_user,
    u.nombre_produits_classes,
    COUNT(p.id_produit) as produits_actuels,
    SUM(CASE WHEN p.statut_validation = 'valide' THEN 1 ELSE 0 END) as produits_valides,
    SUM(CASE WHEN p.statut_validation = 'en_attente' THEN 1 ELSE 0 END) as produits_en_attente,
    SUM(CASE WHEN p.statut_validation = 'rejete' THEN 1 ELSE 0 END) as produits_rejetes
FROM User u
LEFT JOIN Produits p ON u.user_id = p.user_id
GROUP BY u.user_id, u.nom_user, u.identifiant_user, u.nombre_produits_classes;

-- Triggers pour maintenir la cohérence des données
DELIMITER //

-- Trigger pour mettre à jour le nombre de produits classés
CREATE TRIGGER update_user_product_count
AFTER INSERT ON Produits
FOR EACH ROW
BEGIN
    UPDATE User 
    SET nombre_produits_classes = nombre_produits_classes + 1
    WHERE user_id = NEW.user_id;
END//

-- Trigger pour l'historique des modifications
CREATE TRIGGER log_product_changes
AFTER UPDATE ON Produits
FOR EACH ROW
BEGIN
    INSERT INTO Historique_Classifications (
        id_produit, user_id, action_effectuee, 
        ancienne_section, nouvelle_section,
        ancien_taux, nouveau_taux,
        commentaire_historique
    ) VALUES (
        NEW.id_produit, NEW.user_id, 'modification',
        OLD.section_produit, NEW.section_produit,
        OLD.taux_imposition, NEW.taux_imposition,
        CONCAT('Modification automatique - ', NOW())
    );
END//

DELIMITER ;

-- Index pour optimiser les performances
CREATE INDEX idx_produits_date_section ON Produits(date_classification, section_produit);
CREATE INDEX idx_membres_produit_date ON Produits_Membres(id_produit, date_classification_membre);
CREATE INDEX idx_historique_date_action ON Historique_Classifications(date_action, action_effectuee);

-- Procédures stockées utiles
DELIMITER //

-- Procédure pour obtenir les statistiques d'un utilisateur
CREATE PROCEDURE GetUserStatistics(IN p_user_id INT)
BEGIN
    SELECT 
        u.nom_user,
        u.identifiant_user,
        u.nombre_produits_classes,
        COUNT(p.id_produit) as total_actuel,
        SUM(CASE WHEN p.statut_validation = 'valide' THEN 1 ELSE 0 END) as valides,
        SUM(CASE WHEN p.statut_validation = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN p.statut_validation = 'rejete' THEN 1 ELSE 0 END) as rejetes,
        SUM(p.valeur_declaree) as valeur_totale
    FROM User u
    LEFT JOIN Produits p ON u.user_id = p.user_id
    WHERE u.user_id = p_user_id
    GROUP BY u.user_id, u.nom_user, u.identifiant_user, u.nombre_produits_classes;
END//

-- Procédure pour valider un produit
CREATE PROCEDURE ValidateProduct(IN p_product_id INT, IN p_validator_id INT)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    UPDATE Produits 
    SET statut_validation = 'valide'
    WHERE id_produit = p_product_id;
    
    INSERT INTO Historique_Classifications (
        id_produit, user_id, action_effectuee, commentaire_historique
    ) VALUES (
        p_product_id, p_validator_id, 'validation', 
        CONCAT('Produit validé par l\'utilisateur ', p_validator_id)
    );
    
    COMMIT;
END//

DELIMITER ;
