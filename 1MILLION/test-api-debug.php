<?php
// Test de debug pour l'API PHP
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

echo "Test de debug API PHP\n";
echo "====================\n";

// Test 1: Vérifier que les fichiers existent
echo "1. Vérification des fichiers:\n";
$files = [
    'api.php',
    'cedeo-bot-integration.php',
    'config.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        echo "   ✅ $file existe\n";
    } else {
        echo "   ❌ $file manquant\n";
    }
}

// Test 2: Vérifier la connexion MySQL
echo "\n2. Test de connexion MySQL:\n";
try {
    $pdo = new PDO(
        'mysql:host=localhost;port=4240;dbname=douane;charset=utf8mb4',
        'root',
        'root',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
    echo "   ✅ Connexion MySQL réussie\n";
    
    // Vérifier les tables CEDEAO
    $tables = ['cedeo_sections', 'cedeo_chapitres', 'cedeo_codes_tarifaires', 'cedeo_mots_cles'];
    foreach ($tables as $table) {
        $stmt = $pdo->query("SELECT COUNT(*) FROM $table");
        $count = $stmt->fetchColumn();
        echo "   📊 Table $table: $count enregistrements\n";
    }
    
} catch (PDOException $e) {
    echo "   ❌ Erreur MySQL: " . $e->getMessage() . "\n";
}

// Test 3: Vérifier l'inclusion des fichiers
echo "\n3. Test d'inclusion des fichiers:\n";
try {
    require_once 'config.php';
    echo "   ✅ config.php inclus\n";
    
    require_once 'cedeo-bot-integration.php';
    echo "   ✅ cedeo-bot-integration.php inclus\n";
    
} catch (Exception $e) {
    echo "   ❌ Erreur inclusion: " . $e->getMessage() . "\n";
}

// Test 4: Test de la fonction de classification
echo "\n4. Test de classification:\n";
try {
    if (function_exists('classifyProductWithCEDEO')) {
        echo "   ✅ Fonction classifyProductWithCEDEO existe\n";
        
        $result = classifyProductWithCEDEO('avion');
        echo "   📊 Résultat pour 'avion':\n";
        echo "      " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
        
    } else {
        echo "   ❌ Fonction classifyProductWithCEDEO manquante\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Erreur classification: " . $e->getMessage() . "\n";
}

echo "\nTest terminé.\n";
?>
