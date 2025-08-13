<?php
// Test de connexion MySQL avec PDO
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test de connexion MySQL PDO\n";
echo "==========================\n";

try {
    $pdo = new PDO(
        'mysql:host=localhost;port=4240;dbname=douane;charset=utf8mb4',
        'root',
        'root',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    
    echo "✅ Connexion MySQL réussie!\n";
    
    // Vérifier les tables CEDEAO
    $tables = ['cedeo_sections', 'cedeo_chapitres', 'cedeo_codes_tarifaires', 'cedeo_mots_cles'];
    
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "📊 Table $table: $count enregistrements\n";
    }
    
} catch (PDOException $e) {
    echo "❌ Erreur MySQL: " . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo "❌ Erreur générale: " . $e->getMessage() . "\n";
}

echo "\nTest terminé.\n";
?>
