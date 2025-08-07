<?php
// API PHP pour les opérations de base de données
// api.php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    $pdo = DatabaseConfig::getConnection();
    
    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Récupérer l'action depuis URL ou depuis le body JSON
    $request = $_GET['action'] ?? $input['action'] ?? '';
    
    switch($method) {
        case 'POST':
            handlePost($pdo, $request, $input);
            break;
        case 'GET':
            handleGet($pdo, $request);
            break;
        case 'PUT':
            handlePut($pdo, $request, $input);
            break;
        case 'DELETE':
            handleDelete($pdo, $request, $input);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Méthode non autorisée']);
            break;
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}

function handlePost($pdo, $action, $data) {
    switch($action) {
        case 'login':
            login($pdo, $data);
            break;
        case 'register_user':
            registerUser($pdo, $data);
            break;
        case 'save_temp_classification':
            saveTempClassification($pdo, $data);
            break;
        case 'save_classified_product':
            saveClassifiedProduct($pdo, $data);
            break;
        case 'save_product':
            saveProduct($pdo, $data);
            break;
        case 'validate_product':
            validateProduct($pdo, $data);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action non trouvée: ' . $action]);
    }
}

function handleGet($pdo, $action) {
    switch($action) {
        case 'test_connection':
            echo json_encode(DatabaseConfig::testConnection());
            break;
        case 'get_tariff_rates':
            getTariffRates($pdo);
            break;
        case 'get_classifications':
            getClassifications($pdo);
            break;
        case 'get_user_stats':
            getUserStats($pdo, $_GET['user_id'] ?? null);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action non trouvée']);
    }
}

function handlePut($pdo, $action, $data) {
    switch($action) {
        case 'update_product':
            updateProduct($pdo, $data);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action non trouvée']);
    }
}

function handleDelete($pdo, $action, $data) {
    switch($action) {
        case 'delete_product':
            deleteProduct($pdo, $data);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action non trouvée']);
    }
}

// Fonction de connexion utilisateur - CORRIGÉE
function login($pdo, $data) {
    try {
        // Récupérer l'identifiant (peut être email ou identifiant_user)
        $identifiant = $data['identifiant'] ?? $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($identifiant) || empty($password)) {
            throw new Exception('Identifiant et mot de passe requis');
        }
        
        // Chercher l'utilisateur par email OU par identifiant_user
        $stmt = $pdo->prepare("
            SELECT * FROM User 
            WHERE (email = ? OR identifiant_user = ?) 
            AND statut_compte = 'actif'
        ");
        $stmt->execute([$identifiant, $identifiant]);
        $user = $stmt->fetch();
        
        if (!$user) {
            // Log pour debug
            error_log("Utilisateur non trouvé: " . $identifiant);
            throw new Exception('Identifiant ou mot de passe incorrect');
        }
        
        if (!password_verify($password, $user['mot_de_passe'])) {
            // Log pour debug
            error_log("Mot de passe incorrect pour: " . $identifiant);
            throw new Exception('Identifiant ou mot de passe incorrect');
        }
        
        // Mettre à jour la dernière connexion
        $updateStmt = $pdo->prepare("UPDATE User SET derniere_connexion = NOW() WHERE user_id = ?");
        $updateStmt->execute([$user['user_id']]);
        
        // Générer un token de session
        $sessionToken = bin2hex(random_bytes(32));
        
        // Nettoyer les données sensibles
        unset($user['mot_de_passe']);
        
        // 🚨 CORRECTION CRITIQUE: Convertir les entiers en booleans pour JavaScript
        $user['is_admin'] = (bool)$user['is_admin'];  // Convertir 0/1 en false/true
        
        // Log de succès avec debug
        error_log("Connexion réussie pour: " . $user['nom_user'] . " (ID: " . $user['user_id'] . ") - Is Admin: " . ($user['is_admin'] ? 'true' : 'false'));
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'session' => [
                'token' => $sessionToken,
                'expires_in' => 3600
            ],
            'message' => 'Connexion réussie'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction d'enregistrement d'utilisateur - CORRIGÉE
function registerUser($pdo, $data) {
    try {
        $nom = $data['nom'] ?? $data['nom_user'] ?? '';
        $identifiant = $data['identifiant'] ?? $data['identifiant_user'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        $isAdmin = isset($data['is_admin']) ? ($data['is_admin'] ? 1 : 0) : 0;  // Convertir boolean en 0/1 pour MySQL
        
        if (empty($nom) || empty($identifiant) || empty($email) || empty($password)) {
            throw new Exception('Tous les champs sont requis');
        }
        
        // Vérifier si l'utilisateur existe
        $checkStmt = $pdo->prepare("SELECT user_id FROM User WHERE email = ? OR identifiant_user = ?");
        $checkStmt->execute([$email, $identifiant]);
        if ($checkStmt->fetch()) {
            throw new Exception('Email ou identifiant déjà utilisé');
        }
        
        // Hasher le mot de passe
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        // Insérer l'utilisateur
        $stmt = $pdo->prepare("
            INSERT INTO User (nom_user, identifiant_user, email, mot_de_passe, is_admin) 
            VALUES (?, ?, ?, ?, ?)
        ");
        $stmt->execute([$nom, $identifiant, $email, $hashedPassword, $isAdmin]);
        
        $userId = $pdo->lastInsertId();
        
        // Récupérer l'utilisateur créé
        $getUserStmt = $pdo->prepare("SELECT * FROM User WHERE user_id = ?");
        $getUserStmt->execute([$userId]);
        $newUser = $getUserStmt->fetch();
        
        // Nettoyer les données sensibles
        unset($newUser['mot_de_passe']);
        
        // Convertir is_admin en boolean
        $newUser['is_admin'] = (bool)$newUser['is_admin'];
        
        echo json_encode([
            'success' => true,
            'user' => $newUser,
            'message' => 'Utilisateur créé avec succès'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction pour sauvegarder un produit classifié
function saveClassifiedProduct($pdo, $data) {
    try {
        $product = $data['product'] ?? [];
        
        if (empty($product)) {
            throw new Exception('Données produit manquantes');
        }
        
        // Utiliser un utilisateur par défaut si non spécifié (à adapter selon vos besoins)
        $defaultUserId = 5; // ID de l'admin par défaut
        
        $stmt = $pdo->prepare("
            INSERT INTO Produits (
                origine_produit, description_produit, numero_serie, is_groupe, 
                nombre_produits, taux_imposition, section_produit, sous_section_produit,
                user_id, statut_validation, code_tarifaire, valeur_declaree, 
                poids_kg, unite_mesure, commentaires
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $product['origine_produit'] ?? 'Non spécifié',
            $product['description_produit'] ?? '',
            $product['numero_serie'] ?? null,
            isset($product['is_groupe']) ? ($product['is_groupe'] ? 1 : 0) : 0,  // Convertir boolean en 0/1
            $product['nombre_produits'] ?? 1,
            $product['taux_imposition'] ?? 0,
            $product['section_produit'] ?? 'I',
            $product['sous_section_produit'] ?? null,
            $defaultUserId,
            $product['statut_validation'] ?? 'valide',
            $product['code_tarifaire'] ?? null,
            $product['valeur_declaree'] ?? 0,
            $product['poids_kg'] ?? 0,
            $product['unite_mesure'] ?? 'unité',
            $product['commentaires'] ?? null
        ]);
        
        $productId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'product_id' => $productId,
            'message' => 'Produit classifié sauvegardé avec succès'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction pour sauvegarder un produit générique
function saveProduct($pdo, $data) {
    try {
        $product = $data['product'] ?? [];
        
        if (empty($product)) {
            throw new Exception('Données produit manquantes');
        }
        
        // Utiliser un utilisateur par défaut si non spécifié
        $defaultUserId = 5;
        
        // Obtenir le taux d'imposition pour la section
        $taxRate = getTaxRateForSection($pdo, $product['section'] ?? 'I');
        
        $stmt = $pdo->prepare("
            INSERT INTO Produits (
                origine_produit, description_produit, section_produit, 
                code_tarifaire, taux_imposition, valeur_declaree, 
                user_id, statut_validation, commentaires
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $product['origin'] ?? 'Non spécifié',
            $product['description'] ?? '',
            $product['section'] ?? 'I',
            $product['code'] ?? null,
            $taxRate,
            $product['value'] ?? 0,
            $defaultUserId,
            ($product['confidence'] ?? 0) > 80 ? 'valide' : 'en_attente',
            'Classification automatique - Confiance: ' . ($product['confidence'] ?? 0) . '%'
        ]);
        
        $productId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'product_id' => $productId,
            'message' => 'Produit sauvegardé avec succès'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction utilitaire pour obtenir le taux d'imposition d'une section
function getTaxRateForSection($pdo, $section) {
    try {
        $stmt = $pdo->prepare("SELECT taux_pourcentage FROM Taux_Imposition WHERE section = ? AND statut_taux = 'actif'");
        $stmt->execute([$section]);
        $result = $stmt->fetch();
        
        return $result ? $result['taux_pourcentage'] : 10.00; // Taux par défaut
    } catch (Exception $e) {
        return 10.00; // Taux par défaut en cas d'erreur
    }
}

// Fonction pour sauvegarder une classification temporaire
function saveTempClassification($pdo, $data) {
    try {
        // Réutiliser la fonction saveClassifiedProduct
        saveClassifiedProduct($pdo, ['product' => $data]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction pour valider un produit
function validateProduct($pdo, $data) {
    try {
        $productId = $data['product_id'];
        $validatorId = $data['validator_id'];
        
        $pdo->beginTransaction();
        
        // Mettre à jour le statut du produit
        $stmt = $pdo->prepare("UPDATE Produits SET statut_validation = 'valide' WHERE id_produit = ?");
        $stmt->execute([$productId]);
        
        // Ajouter à l'historique
        $historyStmt = $pdo->prepare("
            INSERT INTO Historique_Classifications (id_produit, user_id, action_effectuee, commentaire_historique)
            VALUES (?, ?, 'validation', 'Produit validé')
        ");
        $historyStmt->execute([$productId, $validatorId]);
        
        $pdo->commit();
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit validé avec succès'
        ]);
        
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction pour récupérer les taux tarifaires
function getTariffRates($pdo) {
    try {
        $stmt = $pdo->query("SELECT * FROM Taux_Imposition WHERE statut_taux = 'actif'");
        $rates = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'rates' => $rates
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction pour récupérer les classifications - CORRIGÉE
function getClassifications($pdo) {
    try {
        $userId = $_GET['user_id'] ?? null;
        $status = $_GET['status'] ?? null;
        
        $sql = "SELECT p.*, u.nom_user, u.email FROM Produits p JOIN User u ON p.user_id = u.user_id WHERE 1=1";
        $params = [];
        
        if ($userId) {
            $sql .= " AND p.user_id = ?";
            $params[] = $userId;
        }
        
        if ($status) {
            $sql .= " AND p.statut_validation = ?";
            $params[] = $status;
        }
        
        $sql .= " ORDER BY p.date_classification DESC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $classifications = $stmt->fetchAll();
        
        // Convertir is_groupe en boolean pour chaque produit
        foreach ($classifications as &$classification) {
            $classification['is_groupe'] = (bool)$classification['is_groupe'];
        }
        
        echo json_encode([
            'success' => true,
            'classifications' => $classifications
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

// Fonction pour récupérer les statistiques utilisateur
function getUserStats($pdo, $userId) {
    try {
        if (!$userId) {
            throw new Exception('ID utilisateur requis');
        }
        
        $stmt = $pdo->prepare("CALL GetUserStatistics(?)");
        $stmt->execute([$userId]);
        $stats = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function updateProduct($pdo, $data) {
    try {
        $productId = $data['product_id'] ?? null;
        $updates = $data['updates'] ?? [];
        
        if (!$productId || empty($updates)) {
            throw new Exception('ID produit et données de mise à jour requis');
        }
        
        $setParts = [];
        $params = [];
        
        foreach ($updates as $field => $value) {
            // Convertir les booleans en 0/1 pour MySQL si nécessaire
            if ($field === 'is_groupe' && is_bool($value)) {
                $value = $value ? 1 : 0;
            }
            
            $setParts[] = "$field = ?";
            $params[] = $value;
        }
        
        $params[] = $productId;
        
        $sql = "UPDATE Produits SET " . implode(', ', $setParts) . " WHERE id_produit = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit mis à jour avec succès'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

function deleteProduct($pdo, $data) {
    try {
        $productId = $data['product_id'] ?? null;
        
        if (!$productId) {
            throw new Exception('ID produit requis');
        }
        
        $stmt = $pdo->prepare("DELETE FROM Produits WHERE id_produit = ?");
        $stmt->execute([$productId]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit supprimé avec succès'
        ]);
        
    } catch (Exception $e) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}
?>