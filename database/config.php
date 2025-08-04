<?php
// Configuration de la base de données MySQL
// Fichier: config/database.php

class DatabaseConfig {
    // Configuration de la base de données
    const DB_HOST = 'localhost';
    const DB_PORT = '4240';    // Port MAMP MySQL
    const DB_NAME = 'douane';  // Nom de votre base de données
    const DB_USER = 'root';    // Utilisateur MySQL (généralement 'root' en local)
    const DB_PASS = 'root';    // Mot de passe MySQL
    const DB_CHARSET = 'utf8mb4';
    
    // Options PDO
    const PDO_OPTIONS = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    /**
     * Créer une connexion à la base de données
     */
    public static function getConnection() {
        try {
            $dsn = "mysql:host=" . self::DB_HOST . ";port=" . self::DB_PORT . ";dbname=" . self::DB_NAME . ";charset=" . self::DB_CHARSET;
            $pdo = new PDO($dsn, self::DB_USER, self::DB_PASS, self::PDO_OPTIONS);
            return $pdo;
        } catch (PDOException $e) {
            throw new Exception("Erreur de connexion à la base de données: " . $e->getMessage());
        }
    }
    
    /**
     * Tester la connexion à la base de données
     */
    public static function testConnection() {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM User");
            $result = $stmt->fetch();
            return [
                'success' => true,
                'message' => 'Connexion réussie',
                'user_count' => $result['count']
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
}

// Fonction utilitaire pour la connexion
function getDB() {
    return DatabaseConfig::getConnection();
}
?>
