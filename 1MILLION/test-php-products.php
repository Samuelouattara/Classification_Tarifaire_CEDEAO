<?php
// Test de classification de plusieurs produits via l'API PHP
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test de classification PHP - Produits multiples\n";
echo "===============================================\n";

// Inclure les fichiers nécessaires
require_once 'config.php';
require_once 'cedeo-bot-integration.php';

// Liste de produits à tester
$products = [
    "avion",
    "voiture", 
    "telephone",
    "vetement",
    "bambou",
    "cafe",
    "chocolat",
    "medicament"
];

$results = [];

foreach ($products as $product) {
    try {
        echo "\n🔍 Test de '$product'...\n";
        
        $result = classifyProductWithCEDEO($product);
        
        if ($result) {
            echo "   ✅ Code: " . ($result['tariff_code'] ?? 'N/A') . "\n";
            echo "   📊 Taux: " . ($result['tax_rate'] ?? 'N/A') . "%\n";
            echo "   🎯 Méthode: " . ($result['classification_method'] ?? 'N/A') . "\n";
            
            $results[] = [
                'product' => $product,
                'success' => true,
                'code' => $result['tariff_code'] ?? 'N/A',
                'rate' => $result['tax_rate'] ?? 'N/A'
            ];
        } else {
            echo "   ❌ Aucun résultat\n";
            $results[] = [
                'product' => $product,
                'success' => false,
                'error' => 'Aucun résultat'
            ];
        }
        
    } catch (Exception $e) {
        echo "   ❌ Erreur: " . $e->getMessage() . "\n";
        $results[] = [
            'product' => $product,
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}

// Résumé
echo "\n📊 RÉSUMÉ DES TESTS PHP\n";
echo "===============================================\n";

$successful = array_filter($results, function($r) { return $r['success']; });
$failed = array_filter($results, function($r) { return !$r['success']; });

echo "✅ Succès: " . count($successful) . "/" . count($results) . "\n";
echo "❌ Échecs: " . count($failed) . "/" . count($results) . "\n";

if ($successful) {
    echo "\n🎯 Classifications réussies:\n";
    foreach ($successful as $result) {
        echo "   " . $result['product'] . ": " . $result['code'] . " (" . $result['rate'] . "%)\n";
    }
}

if ($failed) {
    echo "\n⚠️ Échecs:\n";
    foreach ($failed as $result) {
        echo "   " . $result['product'] . ": " . $result['error'] . "\n";
    }
}

echo "\nTest terminé.\n";
?>
