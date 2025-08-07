-- phpMyAdmin SQL Dump
-- version 5.1.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:4240
-- Generation Time: Aug 07, 2025 at 11:52 AM
-- Server version: 5.7.24
-- PHP Version: 8.3.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `douane`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserStatistics` (IN `p_user_id` INT)   BEGIN
    SELECT 
        u.nom_user,
        u.identifiant_user,
        u.nombre_produits_classes,
        COUNT(p.id_produit) as total_classifications,
        SUM(CASE WHEN p.statut_validation = 'valide' THEN 1 ELSE 0 END) as validees,
        SUM(CASE WHEN p.statut_validation = 'en_attente' THEN 1 ELSE 0 END) as en_attente,
        SUM(CASE WHEN p.statut_validation = 'rejete' THEN 1 ELSE 0 END) as rejetees,
        SUM(p.valeur_declaree) as valeur_totale,
        AVG(p.confidence_score) as confidence_moyenne
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
    SET statut_validation = 'valide',
        date_modification = CURRENT_TIMESTAMP
    WHERE id_produit = p_product_id;
    
    INSERT INTO Historique_Classifications (
        id_produit, user_id, action_effectuee, commentaire_historique
    ) VALUES (
        p_product_id, p_validator_id, 'validation', 
        CONCAT('Produit validé par utilisateur ID: ', p_validator_id)
    );
    
    COMMIT;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `historique_classifications`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `produits`
--

CREATE TABLE `produits` (
  `id_produit` int(11) NOT NULL,
  `origine_produit` varchar(100) DEFAULT NULL,
  `description_produit` text NOT NULL,
  `numero_serie` varchar(50) DEFAULT NULL,
  `is_groupe` tinyint(1) DEFAULT '0',
  `nombre_produits` int(11) DEFAULT '1',
  `taux_imposition` decimal(5,2) DEFAULT '0.00',
  `section_produit` varchar(5) DEFAULT NULL,
  `sous_section_produit` varchar(10) DEFAULT NULL,
  `user_id` int(11) DEFAULT '5',
  `statut_validation` enum('en_attente','valide','rejete') DEFAULT 'en_attente',
  `code_tarifaire` varchar(20) DEFAULT NULL,
  `valeur_declaree` decimal(10,2) DEFAULT '0.00',
  `poids_kg` decimal(8,2) DEFAULT '0.00',
  `unite_mesure` varchar(20) DEFAULT 'unité',
  `commentaires` text,
  `confidence_score` decimal(5,2) DEFAULT NULL,
  `methode_classification` enum('automatique','manuelle','ai') DEFAULT 'automatique',
  `date_classification` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `date_modification` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `produits`
--

INSERT INTO `produits` (`id_produit`, `origine_produit`, `description_produit`, `numero_serie`, `is_groupe`, `nombre_produits`, `taux_imposition`, `section_produit`, `sous_section_produit`, `user_id`, `statut_validation`, `code_tarifaire`, `valeur_declaree`, `poids_kg`, `unite_mesure`, `commentaires`, `confidence_score`, `methode_classification`, `date_classification`, `date_modification`) VALUES
(1, 'Test', 'Riz blanc test', NULL, 0, 1, '8.75', 'II', NULL, 5, 'valide', '1006.30.00.00', '0.00', '0.00', 'unité', 'Produit de test initial', '95.00', 'ai', '2025-08-07 11:51:01', '2025-08-07 11:51:01'),
(2, 'Test', 'Viande de bœuf test', NULL, 0, 1, '10.50', 'I', NULL, 5, 'valide', '0201.20.00.00', '0.00', '0.00', 'unité', 'Produit de test initial', '88.50', 'automatique', '2025-08-07 11:51:01', '2025-08-07 11:51:01'),
(3, 'Non spécifié', 'riz', NULL, 0, 1, '8.75', 'II', NULL, 5, 'valide', '1006.30.00.00', '0.00', '0.00', 'unité', 'Classification automatique - Confiance: 85%', NULL, 'automatique', '2025-08-07 11:51:39', '2025-08-07 11:51:39'),
(4, 'Non spécifié', 'riz', NULL, 0, 1, '8.75', 'II', NULL, 5, 'valide', '1006.30.00.00', '0.00', '0.00', 'unité', 'Classification automatique - Confiance: 85%', NULL, 'automatique', '2025-08-07 11:51:39', '2025-08-07 11:51:39');

-- --------------------------------------------------------

--
-- Table structure for table `taux_imposition`
--

CREATE TABLE `taux_imposition` (
  `id_taux` int(11) NOT NULL,
  `section` varchar(5) NOT NULL,
  `chapitre` varchar(5) DEFAULT NULL,
  `sous_section` varchar(20) DEFAULT NULL,
  `taux_pourcentage` decimal(5,2) NOT NULL,
  `description_taux` text,
  `date_application` date NOT NULL,
  `date_fin` date DEFAULT NULL,
  `statut_taux` enum('actif','inactif') DEFAULT 'actif',
  `date_creation` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `taux_imposition`
--

INSERT INTO `taux_imposition` (`id_taux`, `section`, `chapitre`, `sous_section`, `taux_pourcentage`, `description_taux`, `date_application`, `date_fin`, `statut_taux`, `date_creation`) VALUES
(1, 'I', NULL, '01-05', '10.50', 'Animaux vivants et produits du règne animal', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(2, 'II', NULL, '06-14', '8.75', 'Produits du règne végétal', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(3, 'III', NULL, '15', '12.00', 'Graisses et huiles animales, végétales', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(4, 'IV', NULL, '16-24', '15.25', 'Produits des industries alimentaires', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(5, 'V', NULL, '25-27', '5.50', 'Produits minéraux', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(6, 'VI', NULL, '28-38', '18.75', 'Produits des industries chimiques', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(7, 'VII', NULL, '39-40', '14.50', 'Matières plastiques et caoutchouc', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(8, 'VIII', NULL, '41-43', '16.25', 'Peaux, cuirs et ouvrages', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(9, 'IX', NULL, '44-46', '11.75', 'Bois, charbon de bois et ouvrages', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(10, 'X', NULL, '47-49', '13.50', 'Pâtes de bois, papier et carton', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(11, 'XI', NULL, '50-63', '17.25', 'Matières textiles et ouvrages', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(12, 'XII', NULL, '64-67', '19.50', 'Chaussures, coiffures, parapluies', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(13, 'XIII', NULL, '68-70', '9.25', 'Ouvrages en pierres, céramique, verre', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(14, 'XIV', NULL, '71', '25.00', 'Perles, pierres gemmes, métaux précieux', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(15, 'XV', NULL, '72-83', '12.75', 'Métaux communs et ouvrages', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(16, 'XVI', NULL, '84-85', '22.50', 'Machines et appareils électriques', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(17, 'XVII', NULL, '86-89', '20.75', 'Matériel de transport', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(18, 'XVIII', NULL, '90-92', '16.50', 'Instruments d\'optique, de mesure, horlogerie', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(19, 'XIX', NULL, '93', '35.00', 'Armes, munitions', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(20, 'XX', NULL, '94-96', '15.75', 'Marchandises et produits divers', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01'),
(21, 'XXI', NULL, '97', '30.00', 'Objets d\'art, de collection ou d\'antiquité', '2024-01-01', NULL, 'actif', '2025-08-07 11:51:01');

-- --------------------------------------------------------

--
-- Table structure for table `user`
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `nom_user`, `identifiant_user`, `mot_de_passe`, `email`, `nombre_produits_classes`, `is_admin`, `date_creation`, `derniere_connexion`, `statut_compte`) VALUES
(5, 'Administrateur Système', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@douane.ci', 0, 1, '2025-08-07 11:51:01', NULL, 'actif'),
(6, 'Marie Kouassi', 'marie.douane', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'marie@douane.ci', 0, 0, '2025-08-07 11:51:01', NULL, 'actif'),
(7, 'Ahmed Traoré', 'ahmed.class', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ahmed@douane.ci', 0, 0, '2025-08-07 11:51:01', NULL, 'actif'),
(8, 'Fatou Koné', 'fatou.inspect', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'fatou@douane.ci', 0, 0, '2025-08-07 11:51:01', NULL, 'actif');

-- --------------------------------------------------------

--
-- Stand-in structure for view `vue_produits_complets`
-- (See below for the actual view)
--
CREATE TABLE `vue_produits_complets` (
`id_produit` int(11)
,`origine_produit` varchar(100)
,`description_produit` text
,`numero_serie` varchar(50)
,`is_groupe` tinyint(1)
,`nombre_produits` int(11)
,`taux_imposition` decimal(5,2)
,`section_produit` varchar(5)
,`sous_section_produit` varchar(10)
,`date_classification` timestamp
,`date_modification` timestamp
,`statut_validation` enum('en_attente','valide','rejete')
,`code_tarifaire` varchar(20)
,`valeur_declaree` decimal(10,2)
,`poids_kg` decimal(8,2)
,`confidence_score` decimal(5,2)
,`methode_classification` enum('automatique','manuelle','ai')
,`nom_user` varchar(100)
,`identifiant_user` varchar(50)
,`email` varchar(150)
,`description_taux` text
,`taux_officiel` decimal(5,2)
);

-- --------------------------------------------------------

--
-- Structure for view `vue_produits_complets`
--
DROP TABLE IF EXISTS `vue_produits_complets`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vue_produits_complets`  AS SELECT `p`.`id_produit` AS `id_produit`, `p`.`origine_produit` AS `origine_produit`, `p`.`description_produit` AS `description_produit`, `p`.`numero_serie` AS `numero_serie`, `p`.`is_groupe` AS `is_groupe`, `p`.`nombre_produits` AS `nombre_produits`, `p`.`taux_imposition` AS `taux_imposition`, `p`.`section_produit` AS `section_produit`, `p`.`sous_section_produit` AS `sous_section_produit`, `p`.`date_classification` AS `date_classification`, `p`.`date_modification` AS `date_modification`, `p`.`statut_validation` AS `statut_validation`, `p`.`code_tarifaire` AS `code_tarifaire`, `p`.`valeur_declaree` AS `valeur_declaree`, `p`.`poids_kg` AS `poids_kg`, `p`.`confidence_score` AS `confidence_score`, `p`.`methode_classification` AS `methode_classification`, `u`.`nom_user` AS `nom_user`, `u`.`identifiant_user` AS `identifiant_user`, `u`.`email` AS `email`, `ti`.`description_taux` AS `description_taux`, `ti`.`taux_pourcentage` AS `taux_officiel` FROM ((`produits` `p` join `user` `u` on((`p`.`user_id` = `u`.`user_id`))) left join `taux_imposition` `ti` on(((`p`.`section_produit` = `ti`.`section`) and (`ti`.`statut_taux` = 'actif'))))  ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `historique_classifications`
--
ALTER TABLE `historique_classifications`
  ADD PRIMARY KEY (`id_historique`),
  ADD KEY `idx_produit` (`id_produit`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_date` (`date_action`);

--
-- Indexes for table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id_produit`),
  ADD KEY `idx_section` (`section_produit`),
  ADD KEY `idx_user` (`user_id`),
  ADD KEY `idx_statut` (`statut_validation`),
  ADD KEY `idx_date` (`date_classification`);

--
-- Indexes for table `taux_imposition`
--
ALTER TABLE `taux_imposition`
  ADD PRIMARY KEY (`id_taux`),
  ADD KEY `idx_section` (`section`),
  ADD KEY `idx_statut` (`statut_taux`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `identifiant_user` (`identifiant_user`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `historique_classifications`
--
ALTER TABLE `historique_classifications`
  MODIFY `id_historique` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `produits`
--
ALTER TABLE `produits`
  MODIFY `id_produit` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `taux_imposition`
--
ALTER TABLE `taux_imposition`
  MODIFY `id_taux` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
