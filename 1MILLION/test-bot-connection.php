<?php
// Test de connexion au bot Python depuis PHP
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "Test de connexion au bot Python\n";
echo "===============================\n";

// Test 1: Vérifier si le bot Python répond
echo "1. Test de santé du bot Python...\n";
try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'http://localhost:5001/health',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_FOLLOWLOCATION => true
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "   ❌ Erreur cURL: $error\n";
    } elseif ($httpCode == 200) {
        $data = json_decode($response, true);
        echo "   ✅ Bot Python accessible\n";
        echo "   📊 Status: " . ($data['status'] ?? 'N/A') . "\n";
        echo "   📊 Service: " . ($data['service'] ?? 'N/A') . "\n";
        echo "   📊 Version: " . ($data['version'] ?? 'N/A') . "\n";
    } else {
        echo "   ❌ Erreur HTTP: $httpCode\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n";
}

// Test 2: Test de classification directe
echo "\n2. Test de classification directe...\n";
try {
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'http://localhost:5001/classify',
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['product' => 'avion']),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Accept: application/json'
        ]
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);
    
    if ($error) {
        echo "   ❌ Erreur cURL: $error\n";
    } elseif ($httpCode == 200) {
        $data = json_decode($response, true);
        echo "   ✅ Classification réussie\n";
        echo "   📊 Code: " . ($data['code_tarifaire'] ?? 'N/A') . "\n";
        echo "   📊 Taux: " . ($data['taux_imposition'] ?? 'N/A') . "%\n";
        echo "   📊 Source: " . ($data['source'] ?? 'N/A') . "\n";
    } else {
        echo "   ❌ Erreur HTTP: $httpCode\n";
        echo "   📄 Réponse: $response\n";
    }
    
} catch (Exception $e) {
    echo "   ❌ Exception: " . $e->getMessage() . "\n";
}

echo "\nTest terminé.\n";
?>
