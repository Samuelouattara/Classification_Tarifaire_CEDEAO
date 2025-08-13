<?php
// Test simple de l'API PHP
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

echo "Test simple de l'API PHP\n";
echo "=======================\n";

// Simuler les paramètres POST
$_POST['action'] = 'classify_cedeo';
$_POST['product'] = 'avion';

// Inclure les fichiers
require_once 'config.php';
require_once 'cedeo-bot-integration.php';

try {
    echo "Test de classification pour 'avion'...\n";
    
    $result = classifyProductWithCEDEO('avion');
    
    echo "Résultat:\n";
    echo json_encode($result, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage() . "\n";
}

echo "\nTest terminé.\n";
?>
