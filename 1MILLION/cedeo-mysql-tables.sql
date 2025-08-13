-- Tables CEDEAO pour MySQL
-- Structure pour stocker les règles du TEC CEDEAO

-- Table des sections
CREATE TABLE IF NOT EXISTS cedeo_sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_section VARCHAR(10) NOT NULL UNIQUE,
    titre_section VARCHAR(255) NOT NULL,
    description_section TEXT,
    taux_moyen DECIMAL(5,2) DEFAULT 15.00,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_section (code_section)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des chapitres
CREATE TABLE IF NOT EXISTS cedeo_chapitres (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_chapitre VARCHAR(10) NOT NULL UNIQUE,
    titre_chapitre VARCHAR(255) NOT NULL,
    description_chapitre TEXT,
    code_section VARCHAR(10) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_chapitre (code_chapitre),
    INDEX idx_code_section (code_section),
    FOREIGN KEY (code_section) REFERENCES cedeo_sections(code_section) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des codes tarifaires
CREATE TABLE IF NOT EXISTS cedeo_codes_tarifaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code_tarifaire VARCHAR(20) NOT NULL UNIQUE,
    description_produit TEXT NOT NULL,
    taux_imposition DECIMAL(5,2) DEFAULT 15.00,
    unite_mesure VARCHAR(50) DEFAULT 'unité',
    code_chapitre VARCHAR(10) NOT NULL,
    code_section VARCHAR(10) NOT NULL,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_modification TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code_tarifaire (code_tarifaire),
    INDEX idx_code_chapitre (code_chapitre),
    INDEX idx_code_section (code_section),
    INDEX idx_description (description_produit(100)),
    FOREIGN KEY (code_chapitre) REFERENCES cedeo_chapitres(code_chapitre) ON DELETE CASCADE,
    FOREIGN KEY (code_section) REFERENCES cedeo_sections(code_section) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table des mots-clés pour la recherche
CREATE TABLE IF NOT EXISTS cedeo_mots_cles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mot_cle VARCHAR(100) NOT NULL,
    code_tarifaire VARCHAR(20) NOT NULL,
    poids_recherche INT DEFAULT 1,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mot_cle (mot_cle),
    INDEX idx_code_tarifaire (code_tarifaire),
    UNIQUE KEY unique_mot_code (mot_cle, code_tarifaire),
    FOREIGN KEY (code_tarifaire) REFERENCES cedeo_codes_tarifaires(code_tarifaire) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table de cache pour les classifications
CREATE TABLE IF NOT EXISTS cedeo_cache_classifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produit_recherche VARCHAR(255) NOT NULL,
    produit_normalise VARCHAR(255) NOT NULL,
    code_tarifaire_trouve VARCHAR(20) NOT NULL,
    description_trouvee TEXT,
    taux_imposition DECIMAL(5,2),
    score_confiance DECIMAL(5,2),
    methode_recherche VARCHAR(50),
    nombre_utilisations INT DEFAULT 1,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_derniere_utilisation TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_produit_normalise (produit_normalise),
    INDEX idx_code_tarifaire (code_tarifaire_trouve),
    INDEX idx_date_utilisation (date_derniere_utilisation),
    UNIQUE KEY unique_produit (produit_normalise),
    FOREIGN KEY (code_tarifaire_trouve) REFERENCES cedeo_codes_tarifaires(code_tarifaire) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vue pour faciliter les requêtes complètes
CREATE OR REPLACE VIEW vue_cedeo_complete AS
SELECT 
    ct.code_tarifaire,
    ct.description_produit,
    ct.taux_imposition,
    ct.unite_mesure,
    c.code_chapitre,
    c.titre_chapitre,
    s.code_section,
    s.titre_section,
    s.taux_moyen as taux_section
FROM cedeo_codes_tarifaires ct
JOIN cedeo_chapitres c ON ct.code_chapitre = c.code_chapitre
JOIN cedeo_sections s ON ct.code_section = s.code_section;

-- Note: La procédure stockée sera créée séparément si nécessaire
