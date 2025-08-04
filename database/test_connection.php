<?php
// Script de test de la connexion à la base de données
// Fichier: database/test_connection.php

require_once 'config.php';

echo "=== TEST DE CONNEXION À LA BASE DE DONNÉES ===\n";

try {
    // Test de connexion
    $pdo = DatabaseConfig::getConnection();
    echo "✅ Connexion à la base de données réussie!\n\n";
    
    // Vérifier la base de données
    $stmt = $pdo->query("SELECT DATABASE() as db_name");
    $result = $stmt->fetch();
    echo "📊 Base de données connectée: {$result['db_name']}\n";
    
    // Vérifier la table users
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM user");
    $count = $stmt->fetch()['count'];
    echo "👥 Nombre d'utilisateurs: $count\n\n";
    
    // Lister les utilisateurs
    echo "=== LISTE DES UTILISATEURS ===\n";
    $stmt = $pdo->query("SELECT user_id, nom_user, email, is_admin, statut_compte FROM user ORDER BY user_id");
    $users = $stmt->fetchAll();
    
    foreach ($users as $user) {
        $role = $user['is_admin'] ? 'Admin' : 'User';
        echo "ID: {$user['user_id']} | {$user['nom_user']} | {$user['email']} | $role | {$user['statut_compte']}\n";
    }
    
    echo "\n=== TEST DE L'API LOGIN ===\n";
    
    // Simuler un test de login
    $testData = [
        'email' => 'admin@douane.gov',
        'password' => 'admin123'
    ];
    
    $stmt = $pdo->prepare("SELECT * FROM user WHERE email = ? AND statut_compte = 'actif'");
    $stmt->execute([$testData['email']]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "✅ Utilisateur trouvé: {$user['nom_user']}\n";
        
        if (password_verify($testData['password'], $user['mot_de_passe'])) {
            echo "✅ Mot de passe correct!\n";
            echo "🎉 La connexion devrait fonctionner!\n";
        } else {
            echo "❌ Mot de passe incorrect\n";
            echo "🔧 Hash actuel: " . substr($user['mot_de_passe'], 0, 20) . "...\n";
            echo "🔧 Hash attendu: " . substr(password_hash($testData['password'], PASSWORD_DEFAULT), 0, 20) . "...\n";
        }
    } else {
        echo "❌ Utilisateur non trouvé\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur de connexion: " . $e->getMessage() . "\n";
    echo "\n=== DIAGNOSTIC ===\n";
    echo "1. Vérifiez que MAMP est démarré\n";
    echo "2. Vérifiez que MySQL est en cours d'exécution\n";
    echo "3. Vérifiez que la base 'douane' existe\n";
    echo "4. Vérifiez les paramètres dans config.php:\n";
    echo "   - Host: " . DatabaseConfig::DB_HOST . "\n";
    echo "   - Database: " . DatabaseConfig::DB_NAME . "\n";
    echo "   - User: " . DatabaseConfig::DB_USER . "\n";
    echo "   - Password: " . (empty(DatabaseConfig::DB_PASS) ? '(vide)' : '(défini)') . "\n";
}
?>
