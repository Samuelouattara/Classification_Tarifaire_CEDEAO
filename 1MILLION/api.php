<?php
// API PHP pour les opérations de base de données
// Fichier: database/api.php

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
        case 'validate_product':
            validateProduct($pdo, $data);
            break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Action non trouvée']);
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

// Fonction de connexion utilisateur
function login($pdo, $data) {
    try {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
        if (empty($email) || empty($password)) {
            throw new Exception('Email et mot de passe requis');
        }
        
        $stmt = $pdo->prepare("SELECT * FROM User WHERE email = ? AND statut_compte = 'actif'");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['mot_de_passe'])) {
            throw new Exception('Email ou mot de passe incorrect');
        }
        
        // Mettre à jour la dernière connexion
        $updateStmt = $pdo->prepare("UPDATE User SET derniere_connexion = NOW() WHERE user_id = ?");
        $updateStmt->execute([$user['user_id']]);
        
        // Nettoyer les données sensibles
        unset($user['mot_de_passe']);
        
        echo json_encode([
            'success' => true,
            'user' => $user,
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

// Fonction d'enregistrement d'utilisateur
function registerUser($pdo, $data) {
    try {
        $nom = $data['nom_user'] ?? '';
        $identifiant = $data['identifiant_user'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';
        
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
            INSERT INTO User (nom_user, identifiant_user, email, mot_de_passe) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$nom, $identifiant, $email, $hashedPassword]);
        
        $userId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'user_id' => $userId,
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

// Fonction pour sauvegarder une classification temporaire
function saveTempClassification($pdo, $data) {
    try {
        // Ici on peut stocker temporairement ou directement selon le besoin
        // Pour l'instant, on stocke directement avec statut 'en_attente'
        
        $stmt = $pdo->prepare("
            INSERT INTO Produits (
                origine_produit, description_produit, numero_serie, is_groupe, 
                nombre_produits, taux_imposition, section_produit, sous_section_produit,
                user_id, statut_validation, code_tarifaire, valeur_declaree, 
                poids_kg, unite_mesure, commentaires
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'en_attente', ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['origine_produit'],
            $data['description_produit'],
            $data['numero_serie'] ?? null,
            $data['is_groupe'] ? 1 : 0,
            $data['nombre_produits'] ?? 1,
            $data['taux_imposition'],
            $data['section_produit'],
            $data['sous_section_produit'] ?? null,
            $data['user_id'],
            $data['code_tarifaire'] ?? null,
            $data['valeur_declaree'] ?? 0,
            $data['poids_kg'] ?? 0,
            $data['unite_mesure'] ?? 'unité',
            $data['commentaires'] ?? null
        ]);
        
        $productId = $pdo->lastInsertId();
        
        echo json_encode([
            'success' => true,
            'temp_id' => $productId,
            'message' => 'Classification temporaire sauvegardée'
        ]);
        
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

// Fonction pour récupérer les classifications
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
    // Implémentation de la mise à jour de produit
    echo json_encode(['success' => false, 'message' => 'Non implémenté']);
}

function deleteProduct($pdo, $data) {
    // Implémentation de la suppression de produit
    echo json_encode(['success' => false, 'message' => 'Non implémenté']);
}
?>
