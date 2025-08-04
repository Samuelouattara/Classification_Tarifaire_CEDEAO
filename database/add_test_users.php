<?php
// Script pour ajouter des utilisateurs de test
// Fichier: database/add_test_users.php

require_once 'config.php';

try {
    $pdo = DatabaseConfig::getConnection();
    
    echo "=== AJOUT D'UTILISATEURS DE TEST ===\n";
    
    // Utilisateurs de test à ajouter
    $testUsers = [
        [
            'nom_user' => 'Jean Administrateur',
            'identifiant_user' => 'admin',
            'email' => 'admin@douane.gov',
            'password' => 'admin123',
            'is_admin' => true
        ],
        [
            'nom_user' => 'Marie Douanière',
            'identifiant_user' => 'marie.douane',
            'email' => 'marie@douane.gov',
            'password' => 'marie123',
            'is_admin' => false
        ],
        [
            'nom_user' => 'Ahmed Classificateur',
            'identifiant_user' => 'ahmed.class',
            'email' => 'ahmed@douane.gov',
            'password' => 'ahmed123',
            'is_admin' => false
        ],
        [
            'nom_user' => 'Fatou Inspectrice',
            'identifiant_user' => 'fatou.inspect',
            'email' => 'fatou@douane.gov',
            'password' => 'fatou123',
            'is_admin' => false
        ]
    ];
    
    foreach ($testUsers as $user) {
        try {
            // Vérifier si l'utilisateur existe déjà
            $checkStmt = $pdo->prepare("SELECT user_id FROM User WHERE email = ? OR identifiant_user = ?");
            $checkStmt->execute([$user['email'], $user['identifiant_user']]);
            
            if ($checkStmt->fetch()) {
                echo "⚠️  Utilisateur {$user['email']} existe déjà\n";
                continue;
            }
            
            // Hasher le mot de passe
            $hashedPassword = password_hash($user['password'], PASSWORD_DEFAULT);
            
            // Insérer l'utilisateur
            $stmt = $pdo->prepare("
                INSERT INTO User (nom_user, identifiant_user, email, mot_de_passe, is_admin) 
                VALUES (?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $user['nom_user'],
                $user['identifiant_user'],
                $user['email'],
                $hashedPassword,
                $user['is_admin'] ? 1 : 0
            ]);
            
            $userId = $pdo->lastInsertId();
            echo "✅ Utilisateur créé: {$user['nom_user']} (ID: {$userId})\n";
            echo "   📧 Email: {$user['email']}\n";
            echo "   🔑 Mot de passe: {$user['password']}\n";
            echo "   👤 Role: " . ($user['is_admin'] ? 'Administrateur' : 'Utilisateur') . "\n\n";
            
        } catch (Exception $e) {
            echo "❌ Erreur pour {$user['email']}: " . $e->getMessage() . "\n\n";
        }
    }
    
    // Afficher le nombre total d'utilisateurs
    $countStmt = $pdo->query("SELECT COUNT(*) as count FROM User");
    $count = $countStmt->fetch()['count'];
    echo "📊 Total d'utilisateurs dans la base: {$count}\n";
    
    echo "\n=== UTILISATEURS DE TEST PRÊTS ===\n";
    echo "Vous pouvez maintenant vous connecter avec:\n";
    echo "- admin@douane.gov / admin123 (Administrateur)\n";
    echo "- marie@douane.gov / marie123 (Utilisateur)\n";
    echo "- ahmed@douane.gov / ahmed123 (Utilisateur)\n";
    echo "- fatou@douane.gov / fatou123 (Utilisateur)\n";
    
} catch (Exception $e) {
    echo "❌ Erreur de connexion à la base de données: " . $e->getMessage() . "\n";
    echo "Vérifiez que:\n";
    echo "1. Le serveur MySQL est démarré\n";
    echo "2. La base de données 'douane' existe\n";
    echo "3. Les paramètres dans config.php sont corrects\n";
}
?>
