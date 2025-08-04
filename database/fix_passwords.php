<?php
// Script pour corriger les mots de passe des utilisateurs
// Fichier: database/fix_passwords.php

require_once 'config.php';

try {
    $pdo = DatabaseConfig::getConnection();
    
    echo "=== CORRECTION DES MOTS DE PASSE ===\n";
    
    // Mots de passe corrects à appliquer
    $users = [
        'admin@douane.gov' => 'admin123',
        'marie@douane.gov' => 'marie123',
        'ahmed@douane.gov' => 'ahmed123',
        'fatou@douane.gov' => 'fatou123'
    ];
    
    foreach ($users as $email => $plainPassword) {
        // Hasher le mot de passe correctement
        $hashedPassword = password_hash($plainPassword, PASSWORD_DEFAULT);
        
        // Mettre à jour le mot de passe
        $stmt = $pdo->prepare("UPDATE user SET mot_de_passe = ? WHERE email = ?");
        $result = $stmt->execute([$hashedPassword, $email]);
        
        if ($result) {
            echo "✅ Mot de passe mis à jour pour: $email\n";
            echo "   🔑 Mot de passe: $plainPassword\n\n";
        } else {
            echo "❌ Erreur pour: $email\n\n";
        }
    }
    
    echo "=== VERIFICATION ===\n";
    
    // Tester la connexion pour admin
    $testEmail = 'admin@douane.gov';
    $testPassword = 'admin123';
    
    $stmt = $pdo->prepare("SELECT * FROM user WHERE email = ? AND statut_compte = 'actif'");
    $stmt->execute([$testEmail]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($testPassword, $user['mot_de_passe'])) {
        echo "✅ Test de connexion réussi pour admin@douane.gov\n";
        echo "📋 Détails utilisateur:\n";
        echo "   - ID: {$user['user_id']}\n";
        echo "   - Nom: {$user['nom_user']}\n";
        echo "   - Email: {$user['email']}\n";
        echo "   - Admin: " . ($user['is_admin'] ? 'Oui' : 'Non') . "\n";
        echo "   - Statut: {$user['statut_compte']}\n";
    } else {
        echo "❌ Test de connexion échoué pour admin@douane.gov\n";
    }
    
    echo "\n=== COMPTES DISPONIBLES ===\n";
    echo "admin@douane.gov / admin123 (Administrateur)\n";
    echo "marie@douane.gov / marie123 (Utilisateur)\n";
    echo "ahmed@douane.gov / ahmed123 (Utilisateur)\n";
    echo "fatou@douane.gov / fatou123 (Utilisateur)\n";
    
} catch (Exception $e) {
    echo "❌ Erreur: " . $e->getMessage() . "\n";
    echo "\nVérifiez que:\n";
    echo "1. MAMP est démarré avec MySQL\n";
    echo "2. La base de données 'douane' existe\n";
    echo "3. Les paramètres dans config.php sont corrects\n";
}
?>
