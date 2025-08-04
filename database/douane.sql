-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Hôte : localhost:4240
-- Généré le : lun. 04 août 2025 à 00:02
-- Version du serveur : 5.7.24
-- Version de PHP : 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `douane`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserStatistics` (IN `p_user_id` INT)   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ValidateProduct` (IN `p_product_id` INT, IN `p_validator_id` INT)   BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `historique_classifications`
--

CREATE TABLE `historique_classifications` (
  `id_historique` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_effectuee` enum('creation','modification','validation','rejet') NOT NULL,
  `ancienne_section` varchar(10) DEFAULT NULL,
  `nouvelle_section` varchar(10) DEFAULT NULL,
  `ancien_taux` decimal(5,2) DEFAULT NULL,
  `nouveau_taux` decimal(5,2) DEFAULT NULL,
  `commentaire_historique` text,
  `date_action` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id_produit` int(11) NOT NULL,
  `origine_produit` varchar(100) NOT NULL,
  `description_produit` text NOT NULL,
  `numero_serie` varchar(50) DEFAULT NULL,
  `is_groupe` tinyint(1) DEFAULT '0',
  `nombre_produits` int(11) DEFAULT '1',
  `taux_imposition` decimal(5,2) NOT NULL,
  `section_produit` varchar(10) NOT NULL,
  `sous_section_produit` varchar(20) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `date_classification` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `statut_validation` enum('en_attente','valide','rejete','en_revision') DEFAULT 'en_attente',
  `code_tarifaire` varchar(20) DEFAULT NULL,
  `valeur_declaree` decimal(15,2) DEFAULT NULL,
  `poids_kg` decimal(10,3) DEFAULT NULL,
  `unite_mesure` varchar(20) DEFAULT NULL,
  `commentaires` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déclencheurs `produits`
--
DELIMITER $$
CREATE TRIGGER `log_product_changes` AFTER UPDATE ON `produits` FOR EACH ROW BEGIN
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
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `update_user_product_count` AFTER INSERT ON `produits` FOR EACH ROW BEGIN
    UPDATE User 
    SET nombre_produits_classes = nombre_produits_classes + 1
    WHERE user_id = NEW.user_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `produits_membres`
--

CREATE TABLE `produits_membres` (
  `id_membre` int(11) NOT NULL,
  `id_produit` int(11) NOT NULL,
  `id_produit_membre` varchar(50) NOT NULL,
  `taux_imposition_membre` decimal(5,2) NOT NULL,
  `nom_produit_membre` varchar(200) NOT NULL,
  `origine_produit_membre` varchar(100) NOT NULL,
  `description_produit_membre` text NOT NULL,
  `numero_serie_membre` varchar(50) DEFAULT NULL,
  `section_produit_membre` varchar(10) NOT NULL,
  `sous_section_produit_membre` varchar(20) DEFAULT NULL,
  `user_qui_classe_membre` int(11) NOT NULL,
  `date_classification_membre` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification_membre` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `quantite_membre` int(11) DEFAULT '1',
  `valeur_unitaire_membre` decimal(12,2) DEFAULT NULL,
  `poids_unitaire_membre` decimal(8,3) DEFAULT NULL,
  `code_tarifaire_membre` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `rapports_classification`
--

CREATE TABLE `rapports_classification` (
  `id_rapport` int(11) NOT NULL,
  `type_rapport` enum('quotidien','hebdomadaire','mensuel','annuel') NOT NULL,
  `periode_debut` date NOT NULL,
  `periode_fin` date NOT NULL,
  `nombre_classifications` int(11) DEFAULT '0',
  `nombre_validations` int(11) DEFAULT '0',
  `nombre_rejets` int(11) DEFAULT '0',
  `total_droits_douane` decimal(15,2) DEFAULT '0.00',
  `user_generateur` int(11) NOT NULL,
  `date_generation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fichier_rapport` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `sessions_utilisateur`
--

CREATE TABLE `sessions_utilisateur` (
  `id_session` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `token_session` varchar(255) NOT NULL,
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_expiration` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `ip_adresse` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `statut_session` enum('active','expiree','fermee') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Structure de la table `taux_imposition`
--

CREATE TABLE `taux_imposition` (
  `id_taux` int(11) NOT NULL,
  `section` varchar(10) NOT NULL,
  `sous_section` varchar(20) DEFAULT NULL,
  `taux_pourcentage` decimal(5,2) NOT NULL,
  `description_taux` text,
  `date_application` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `statut_taux` enum('actif','inactif') DEFAULT 'actif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `taux_imposition`
--

INSERT INTO `taux_imposition` (`id_taux`, `section`, `sous_section`, `taux_pourcentage`, `description_taux`, `date_application`, `date_fin`, `statut_taux`) VALUES
(1, 'I', '01-05', '10.50', 'Animaux vivants et produits du règne animal', '2024-01-01', NULL, 'actif'),
(2, 'II', '06-14', '8.75', 'Produits du règne végétal', '2024-01-01', NULL, 'actif'),
(3, 'III', '15', '12.00', 'Graisses et huiles animales, végétales', '2024-01-01', NULL, 'actif'),
(4, 'IV', '16-24', '15.25', 'Produits des industries alimentaires', '2024-01-01', NULL, 'actif'),
(5, 'V', '25-27', '5.50', 'Produits minéraux', '2024-01-01', NULL, 'actif'),
(6, 'VI', '28-38', '18.75', 'Produits des industries chimiques', '2024-01-01', NULL, 'actif'),
(7, 'VII', '39-40', '14.50', 'Matières plastiques et caoutchouc', '2024-01-01', NULL, 'actif'),
(8, 'VIII', '41-43', '16.25', 'Peaux, cuirs et ouvrages', '2024-01-01', NULL, 'actif'),
(9, 'IX', '44-46', '11.75', 'Bois, charbon de bois et ouvrages', '2024-01-01', NULL, 'actif'),
(10, 'X', '47-49', '13.50', 'Pâtes de bois, papier et carton', '2024-01-01', NULL, 'actif'),
(11, 'XI', '50-63', '17.25', 'Matières textiles et ouvrages', '2024-01-01', NULL, 'actif'),
(12, 'XII', '64-67', '19.50', 'Chaussures, coiffures, parapluies', '2024-01-01', NULL, 'actif'),
(13, 'XIII', '68-70', '9.25', 'Ouvrages en pierres, céramique, verre', '2024-01-01', NULL, 'actif'),
(14, 'XIV', '71', '25.00', 'Perles, pierres gemmes, métaux précieux', '2024-01-01', NULL, 'actif'),
(15, 'XV', '72-83', '12.75', 'Métaux communs et ouvrages', '2024-01-01', NULL, 'actif'),
(16, 'XVI', '84-85', '22.50', 'Machines et appareils électriques', '2024-01-01', NULL, 'actif'),
(17, 'XVII', '86-89', '20.75', 'Matériel de transport', '2024-01-01', NULL, 'actif'),
(18, 'XVIII', '90-92', '16.50', 'Instruments d\'optique, de mesure, horlogerie', '2024-01-01', NULL, 'actif'),
(19, 'XIX', '93', '35.00', 'Armes, munitions', '2024-01-01', NULL, 'actif'),
(20, 'XX', '94-96', '15.75', 'Marchandises et produits divers', '2024-01-01', NULL, 'actif'),
(21, 'XXI', '97', '30.00', 'Objets d\'art, de collection ou d\'antiquité', '2024-01-01', NULL, 'actif');

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `nom_user` varchar(100) NOT NULL,
  `identifiant_user` varchar(50) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `email` varchar(150) NOT NULL,
  `nombre_produits_classes` int(11) DEFAULT '0',
  `is_admin` tinyint(1) DEFAULT '0',
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `derniere_connexion` timestamp NULL DEFAULT NULL,
  `statut_compte` enum('actif','inactif','suspendu') DEFAULT 'actif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`user_id`, `nom_user`, `identifiant_user`, `mot_de_passe`, `email`, `nombre_produits_classes`, `is_admin`, `date_creation`, `derniere_connexion`, `statut_compte`) VALUES
(5, 'Jean Administrateur', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@douane.gov', 0, 1, '2025-08-03 15:04:46', NULL, 'actif'),
(6, 'Marie Douanière', 'marie.douane', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'marie@douane.gov', 0, 0, '2025-08-03 15:04:46', NULL, 'actif'),
(7, 'Ahmed Classificateur', 'ahmed.class', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ahmed@douane.gov', 0, 0, '2025-08-03 15:04:46', NULL, 'actif'),
(8, 'Fatou Inspectrice', 'fatou.inspect', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'fatou@douane.gov', 0, 0, '2025-08-03 15:04:46', NULL, 'actif');

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_produits_complets`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_produits_complets` (
`id_produit` int(11)
,`origine_produit` varchar(100)
,`description_produit` text
,`numero_serie` varchar(50)
,`is_groupe` tinyint(1)
,`nombre_produits` int(11)
,`taux_imposition` decimal(5,2)
,`section_produit` varchar(10)
,`sous_section_produit` varchar(20)
,`date_classification` timestamp
,`statut_validation` enum('en_attente','valide','rejete','en_revision')
,`code_tarifaire` varchar(20)
,`valeur_declaree` decimal(15,2)
,`poids_kg` decimal(10,3)
,`nom_user` varchar(100)
,`identifiant_user` varchar(50)
,`email` varchar(150)
,`description_taux` text
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `vue_statistiques_utilisateur`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `vue_statistiques_utilisateur` (
`user_id` int(11)
,`nom_user` varchar(100)
,`identifiant_user` varchar(50)
,`nombre_produits_classes` int(11)
,`produits_actuels` bigint(21)
,`produits_valides` decimal(23,0)
,`produits_en_attente` decimal(23,0)
,`produits_rejetes` decimal(23,0)
);

-- --------------------------------------------------------

--
-- Structure de la vue `vue_produits_complets`
--
DROP TABLE IF EXISTS `vue_produits_complets`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_produits_complets`  AS SELECT `p`.`id_produit` AS `id_produit`, `p`.`origine_produit` AS `origine_produit`, `p`.`description_produit` AS `description_produit`, `p`.`numero_serie` AS `numero_serie`, `p`.`is_groupe` AS `is_groupe`, `p`.`nombre_produits` AS `nombre_produits`, `p`.`taux_imposition` AS `taux_imposition`, `p`.`section_produit` AS `section_produit`, `p`.`sous_section_produit` AS `sous_section_produit`, `p`.`date_classification` AS `date_classification`, `p`.`statut_validation` AS `statut_validation`, `p`.`code_tarifaire` AS `code_tarifaire`, `p`.`valeur_declaree` AS `valeur_declaree`, `p`.`poids_kg` AS `poids_kg`, `u`.`nom_user` AS `nom_user`, `u`.`identifiant_user` AS `identifiant_user`, `u`.`email` AS `email`, `ti`.`description_taux` AS `description_taux` FROM ((`produits` `p` join `user` `u` on((`p`.`user_id` = `u`.`user_id`))) left join `taux_imposition` `ti` on((`p`.`section_produit` = `ti`.`section`))) WHERE (`ti`.`statut_taux` = 'actif')  ;

-- --------------------------------------------------------

--
-- Structure de la vue `vue_statistiques_utilisateur`
--
DROP TABLE IF EXISTS `vue_statistiques_utilisateur`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_statistiques_utilisateur`  AS SELECT `u`.`user_id` AS `user_id`, `u`.`nom_user` AS `nom_user`, `u`.`identifiant_user` AS `identifiant_user`, `u`.`nombre_produits_classes` AS `nombre_produits_classes`, count(`p`.`id_produit`) AS `produits_actuels`, sum((case when (`p`.`statut_validation` = 'valide') then 1 else 0 end)) AS `produits_valides`, sum((case when (`p`.`statut_validation` = 'en_attente') then 1 else 0 end)) AS `produits_en_attente`, sum((case when (`p`.`statut_validation` = 'rejete') then 1 else 0 end)) AS `produits_rejetes` FROM (`user` `u` left join `produits` `p` on((`u`.`user_id` = `p`.`user_id`))) GROUP BY `u`.`user_id`, `u`.`nom_user`, `u`.`identifiant_user`, `u`.`nombre_produits_classes``nombre_produits_classes`  ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `historique_classifications`
--
ALTER TABLE `historique_classifications`
  ADD PRIMARY KEY (`id_historique`),
  ADD KEY `idx_produit_historique` (`id_produit`),
  ADD KEY `idx_user_historique` (`user_id`),
  ADD KEY `idx_date_action` (`date_action`),
  ADD KEY `idx_historique_date_action` (`date_action`,`action_effectuee`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id_produit`),
  ADD KEY `idx_section` (`section_produit`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_date_classification` (`date_classification`),
  ADD KEY `idx_statut` (`statut_validation`),
  ADD KEY `idx_produits_date_section` (`date_classification`,`section_produit`);

--
-- Index pour la table `produits_membres`
--
ALTER TABLE `produits_membres`
  ADD PRIMARY KEY (`id_membre`),
  ADD KEY `idx_produit_principal` (`id_produit`),
  ADD KEY `idx_section_membre` (`section_produit_membre`),
  ADD KEY `idx_user_membre` (`user_qui_classe_membre`),
  ADD KEY `idx_date_classification_membre` (`date_classification_membre`),
  ADD KEY `idx_membres_produit_date` (`id_produit`,`date_classification_membre`);

--
-- Index pour la table `rapports_classification`
--
ALTER TABLE `rapports_classification`
  ADD PRIMARY KEY (`id_rapport`),
  ADD KEY `idx_periode` (`periode_debut`,`periode_fin`),
  ADD KEY `idx_type_rapport` (`type_rapport`),
  ADD KEY `user_generateur` (`user_generateur`);

--
-- Index pour la table `sessions_utilisateur`
--
ALTER TABLE `sessions_utilisateur`
  ADD PRIMARY KEY (`id_session`),
  ADD UNIQUE KEY `token_session` (`token_session`),
  ADD KEY `idx_user_session` (`user_id`),
  ADD KEY `idx_token` (`token_session`);

--
-- Index pour la table `taux_imposition`
--
ALTER TABLE `taux_imposition`
  ADD PRIMARY KEY (`id_taux`),
  ADD UNIQUE KEY `unique_section_periode` (`section`,`sous_section`,`date_application`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `identifiant_user` (`identifiant_user`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_identifiant` (`identifiant_user`),
  ADD KEY `idx_email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `historique_classifications`
--
ALTER TABLE `historique_classifications`
  MODIFY `id_historique` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `produits_membres`
--
ALTER TABLE `produits_membres`
  MODIFY `id_membre` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `rapports_classification`
--
ALTER TABLE `rapports_classification`
  MODIFY `id_rapport` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `sessions_utilisateur`
--
ALTER TABLE `sessions_utilisateur`
  MODIFY `id_session` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `taux_imposition`
--
ALTER TABLE `taux_imposition`
  MODIFY `id_taux` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `historique_classifications`
--
ALTER TABLE `historique_classifications`
  ADD CONSTRAINT `historique_classifications_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id_produit`) ON DELETE CASCADE,
  ADD CONSTRAINT `historique_classifications_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `produits_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `produits_membres`
--
ALTER TABLE `produits_membres`
  ADD CONSTRAINT `produits_membres_ibfk_1` FOREIGN KEY (`id_produit`) REFERENCES `produits` (`id_produit`) ON DELETE CASCADE,
  ADD CONSTRAINT `produits_membres_ibfk_2` FOREIGN KEY (`user_qui_classe_membre`) REFERENCES `user` (`user_id`);

--
-- Contraintes pour la table `rapports_classification`
--
ALTER TABLE `rapports_classification`
  ADD CONSTRAINT `rapports_classification_ibfk_1` FOREIGN KEY (`user_generateur`) REFERENCES `user` (`user_id`);

--
-- Contraintes pour la table `sessions_utilisateur`
--
ALTER TABLE `sessions_utilisateur`
  ADD CONSTRAINT `sessions_utilisateur_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
