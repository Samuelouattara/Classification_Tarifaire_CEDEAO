<?php
/**
 * Intégration PHP pour le Bot CEDEAO
 * ==================================
 * 
 * Ce fichier permet l'intégration du bot Python CEDEAO avec le système PHP existant.
 * Il contient toutes les règles de classification et les fonctions d'intégration.
 */

class CEDEOBotIntegration {
    private $apiBaseUrl;
    private $timeout;
    
    public function __construct($apiBaseUrl = 'http://localhost:5001', $timeout = 10) {
        $this->apiBaseUrl = rtrim($apiBaseUrl, '/');
        $this->timeout = $timeout;
    }
    
    /**
     * Vérifier la connexion au bot CEDEAO
     */
    public function checkConnection() {
        try {
            $url = $this->apiBaseUrl . '/health';
            $response = $this->makeRequest($url, 'GET');
            
            if ($response && isset($response['status']) && $response['status'] === 'healthy') {
                return [
                    'success' => true,
                    'status' => 'connected',
                    'service' => $response['service'] ?? 'CEDEAO Bot - Version MySQL',
                    'version' => $response['version'] ?? '2.1.0',
                    'database_stats' => $response['database_stats'] ?? null
                ];
            }
            
            return [
                'success' => false,
                'status' => 'unhealthy',
                'message' => 'Bot non disponible'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Classifier un produit avec le bot CEDEAO
     */
    public function classifyProduct($productName) {
        try {
            if (empty($productName)) {
                throw new Exception('Nom du produit requis');
            }
            
            $url = $this->apiBaseUrl . '/classify';
            $data = ['product_name' => $productName];
            
            $response = $this->makeRequest($url, 'POST', $data);
            
            if ($response && !isset($response['error'])) {
                return $this->formatResult($response);
            }
            
            throw new Exception($response['error'] ?? 'Erreur de classification');
            
        } catch (Exception $e) {
            throw new Exception('Erreur de classification CEDEAO: ' . $e->getMessage());
        }
    }
    
    /**
     * Récupérer les règles de classification
     */
    public function getRules() {
        try {
            $url = $this->apiBaseUrl . '/rules';
            $response = $this->makeRequest($url, 'GET');
            
            if ($response) {
                return [
                    'success' => true,
                    'rules' => $response
                ];
            }
            
            throw new Exception('Impossible de récupérer les règles');
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => $e->getMessage()
            ];
        }
    }
    
    /**
     * Effectuer une requête HTTP
     */
    private function makeRequest($url, $method = 'GET', $data = null) {
        $ch = curl_init();
        
        curl_setopt_array($ch, [
            CURLOPT_URL => $url,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => $this->timeout,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => $method,
        ]);
        
        if ($method === 'POST' && $data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json',
                'Accept: application/json'
            ]);
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            throw new Exception('Erreur cURL: ' . $error);
        }
        
        if ($httpCode >= 400) {
            throw new Exception('Erreur HTTP ' . $httpCode);
        }
        
        $decoded = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Réponse JSON invalide');
        }
        
        return $decoded;
    }
    
    /**
     * Formater le résultat pour compatibilité avec le système existant
     */
    private function formatResult($botResponse) {
        return [
            'success' => true,
            'classification' => [
                'tariff_code' => $botResponse['tariff_code'] ?? '999999',
                'section' => $botResponse['section'] ?? 'XX',
                'chapter' => $botResponse['chapter'] ?? '99',
                'tax_rate' => $botResponse['tax_rate'] ?? 20.0,
                'classification_method' => $botResponse['classification_method'] ?? 'default',
                'confidence' => $botResponse['confidence'] ?? 0.1,
                'product_name' => $botResponse['product_name'] ?? '',
                'timestamp' => $botResponse['timestamp'] ?? date('c'),
                'matched_keyword' => $botResponse['matched_keyword'] ?? null,
                'matched_category' => $botResponse['matched_category'] ?? null
            ],
            'source' => 'CEDEAO_BOT',
            'message' => 'Classification CEDEAO réussie'
        ];
    }
}

/**
 * Fonctions globales pour l'intégration
 */

/**
 * Classifier un produit avec le bot CEDEAO (fonction globale)
 */
function classifyProductWithCEDEO($productName) {
    try {
        $bot = new CEDEOBotIntegration();
        $result = $bot->classifyProduct($productName);
        
        if ($result['success']) {
            return $result['classification'];
        }
        
        throw new Exception($result['message'] ?? 'Erreur de classification');
        
    } catch (Exception $e) {
        error_log('Erreur classification CEDEAO: ' . $e->getMessage());
        throw $e;
    }
}

/**
 * Vérifier la connexion au bot CEDEAO (fonction globale)
 */
function checkCEDEOConnection() {
    try {
        $bot = new CEDEOBotIntegration();
        return $bot->checkConnection();
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'status' => 'error',
            'message' => $e->getMessage()
        ];
    }
}

/**
 * Obtenir le statut du bot CEDEAO (fonction globale)
 */
function getCEDEOStatus() {
    return checkCEDEOConnection();
}

/**
 * Intégrer le bot CEDEAO avec le système existant
 */
function integrateWithExistingSystem($productName) {
    try {
        // Essayer d'abord le bot CEDEAO
        $cedeoResult = classifyProductWithCEDEO($productName);
        
        return [
            'success' => true,
            'classification' => $cedeoResult,
            'source' => 'CEDEAO_BOT',
            'message' => 'Classification CEDEAO réussie'
        ];
        
    } catch (Exception $e) {
        // Fallback vers le système existant
        error_log('Bot CEDEAO indisponible, utilisation du système existant: ' . $e->getMessage());
        
        return [
            'success' => true,
            'classification' => classifyWithExistingSystem($productName),
            'source' => 'EXISTING_SYSTEM',
            'fallback' => true,
            'message' => 'Classification avec système existant (bot CEDEAO indisponible)'
        ];
    }
}

/**
 * Système de classification existant (fallback)
 */
function classifyWithExistingSystem($productName) {
    $product = strtolower($productName);
    
    // Règles de classification existantes
    if (strpos($product, 'avion') !== false) {
        return [
            'tariff_code' => '880100',
            'section' => 'XVII',
            'chapter' => '88',
            'tax_rate' => 5.0,
            'classification_method' => 'keyword_based',
            'confidence' => 0.8
        ];
    }
    
    if (strpos($product, 'ordinateur') !== false) {
        return [
            'tariff_code' => '847100',
            'section' => 'XVI',
            'chapter' => '84',
            'tax_rate' => 5.0,
            'classification_method' => 'keyword_based',
            'confidence' => 0.8
        ];
    }
    
    if (strpos($product, 'telephone') !== false) {
        return [
            'tariff_code' => '851700',
            'section' => 'XVI',
            'chapter' => '85',
            'tax_rate' => 5.0,
            'classification_method' => 'keyword_based',
            'confidence' => 0.8
        ];
    }
    
    if (strpos($product, 'vetement') !== false || strpos($product, 'habit') !== false) {
        return [
            'tariff_code' => '620400',
            'section' => 'XI',
            'chapter' => '62',
            'tax_rate' => 20.0,
            'classification_method' => 'keyword_based',
            'confidence' => 0.8
        ];
    }
    
    if (strpos($product, 'jouet') !== false) {
        return [
            'tariff_code' => '950300',
            'section' => 'XX',
            'chapter' => '95',
            'tax_rate' => 20.0,
            'classification_method' => 'keyword_based',
            'confidence' => 0.8
        ];
    }
    
    // Classification par défaut
    return [
        'tariff_code' => '999999',
        'section' => 'XX',
        'chapter' => '99',
        'tax_rate' => 20.0,
        'classification_method' => 'default',
        'confidence' => 0.1
    ];
}

// Configuration par défaut
if (!defined('CEDEO_BOT_CONFIG')) {
    define('CEDEO_BOT_CONFIG', [
        'api_base_url' => 'http://localhost:5001',
        'timeout' => 10,
        'retry_attempts' => 3,
        'fallback_enabled' => true
    ]);
}

?>
