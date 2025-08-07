<?php
// Configuration de la base de données MySQL - MISE À JOUR
// config.php

class DatabaseConfig {
    // CORRECTION : Configuration selon votre dump SQL
    const DB_HOST = 'localhost';
    const DB_PORT = '4240';        // Port MAMP MySQL (visible dans votre dump)
    const DB_NAME = 'douane';      // Nom de votre base (visible dans votre dump)
    const DB_USER = 'root';        // Utilisateur MySQL
    const DB_PASS = 'root';        // Mot de passe MySQL (à adapter si différent)
    const DB_CHARSET = 'utf8mb4';
    
    // Options PDO optimisées
    const PDO_OPTIONS = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4"
    ];
    
    /**
     * Créer une connexion à la base de données
     */
    public static function getConnection() {
        try {
            $dsn = "mysql:host=" . self::DB_HOST . ";port=" . self::DB_PORT . ";dbname=" . self::DB_NAME . ";charset=" . self::DB_CHARSET;
            
            error_log("Tentative de connexion à: $dsn");
            
            $pdo = new PDO($dsn, self::DB_USER, self::DB_PASS, self::PDO_OPTIONS);
            
            error_log("✅ Connexion MySQL réussie");
            return $pdo;
            
        } catch (PDOException $e) {
            error_log("❌ Erreur connexion MySQL: " . $e->getMessage());
            throw new Exception("Erreur de connexion à la base de données: " . $e->getMessage());
        }
    }
    
    /**
     * Tester la connexion à la base de données
     */
    public static function testConnection() {
        try {
            $pdo = self::getConnection();
            
            // Test avec votre table User
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM User");
            $result = $stmt->fetch();
            
            // Test avec votre table Produits
            $stmt2 = $pdo->query("SELECT COUNT(*) as count FROM Produits");
            $result2 = $stmt2->fetch();
            
            return [
                'success' => true,
                'message' => 'Connexion réussie à la base douane',
                'user_count' => $result['count'],
                'product_count' => $result2['count'],
                'database' => self::DB_NAME,
                'host' => self::DB_HOST . ':' . self::DB_PORT
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage(),
                'database' => self::DB_NAME,
                'host' => self::DB_HOST . ':' . self::DB_PORT
            ];
        }
    }
    
    /**
     * Vérifier que toutes les tables nécessaires existent
     */
    public static function verifyTables() {
        try {
            $pdo = self::getConnection();
            
            $requiredTables = ['User', 'Produits', 'Taux_Imposition', 'Historique_Classifications'];
            $existingTables = [];
            
            foreach ($requiredTables as $table) {
                $stmt = $pdo->query("SHOW TABLES LIKE '$table'");
                if ($stmt->rowCount() > 0) {
                    $existingTables[] = $table;
                }
            }
            
            return [
                'success' => count($existingTables) === count($requiredTables),
                'required' => $requiredTables,
                'existing' => $existingTables,
                'missing' => array_diff($requiredTables, $existingTables)
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtenir les utilisateurs de test
     */
    public static function getTestUsers() {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT user_id, nom_user, identifiant_user, email FROM User WHERE statut_compte = 'actif' LIMIT 5");
            $users = $stmt->fetchAll();
            
            return [
                'success' => true,
                'users' => $users
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

// Auto-test au chargement (optionnel)
if (php_sapi_name() === 'cli') {
    echo "Test de configuration de base de données...\n";
    $test = DatabaseConfig::testConnection();
    echo $test['success'] ? "✅ " : "❌ ";
    echo $test['message'] . "\n";
}
?>