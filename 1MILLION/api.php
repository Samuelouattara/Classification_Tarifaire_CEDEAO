<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Gestion des requêtes OPTIONS pour CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration de la base de données
$host = 'localhost:4240';
$dbname = 'douane';
$username = 'root';
$password = 'root';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données: ' . $e->getMessage()
    ]);
    exit();
}

// Récupération et décodage des données
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['action'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Action non spécifiée'
    ]);
    exit();
}

// Traitement selon l'action
switch ($data['action']) {
    case 'save_classified_product':
        saveClassifiedProduct($pdo, $data);
        break;
    
    case 'login':
        authenticateUser($pdo, $data);
        break;
    
    case 'get_user_stats':
        getUserStats($pdo, $data);
        break;
    
    case 'get_user_history':
        getUserHistory($pdo, $data);
        break;
    
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Action non reconnue'
        ]);
        break;
}

/**
 * Sauvegarde un produit classifié automatiquement
 */
function saveClassifiedProduct($pdo, $data) {
    try {
        if (!isset($data['product'])) {
            throw new Exception('Données du produit manquantes');
        }
        
        $product = $data['product'];
        
        // Valeurs par défaut et validation
        $origine_produit = $product['origine_produit'] ?? 'Non spécifié';
        $description_produit = $product['description_produit'] ?? '';
        $section_produit = $product['section_produit'] ?? '';
        $code_tarifaire = $product['code_tarifaire'] ?? null;
        $taux_imposition = floatval($product['taux_imposition'] ?? 0);
        $valeur_declaree = floatval($product['valeur_declaree'] ?? 0);
        $poids_kg = floatval($product['poids_kg'] ?? 0);
        $unite_mesure = $product['unite_mesure'] ?? 'unité';
        $statut_validation = $product['statut_validation'] ?? 'en_attente';
        $commentaires = $product['commentaires'] ?? '';
        
        // Validation des champs obligatoires
        if (empty($description_produit)) {
            throw new Exception('Description du produit obligatoire');
        }
        
        if (empty($section_produit)) {
            throw new Exception('Section du produit obligatoire');
        }
        
        // Obtenir l'utilisateur par défaut (user_id = 1 pour le système automatique)
        // En production, utiliser l'utilisateur connecté
        $user_id = getCurrentUserId($pdo);
        
        // Préparer la requête d'insertion
        $sql = "INSERT INTO produits (
            origine_produit, 
            description_produit, 
            section_produit, 
            code_tarifaire, 
            taux_imposition, 
            valeur_declaree, 
            poids_kg, 
            unite_mesure, 
            user_id, 
            statut_validation, 
            commentaires,
            date_classification
        ) VALUES (
            :origine_produit, 
            :description_produit, 
            :section_produit, 
            :code_tarifaire, 
            :taux_imposition, 
            :valeur_declaree, 
            :poids_kg, 
            :unite_mesure, 
            :user_id, 
            :statut_validation, 
            :commentaires,
            NOW()
        )";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':origine_produit' => $origine_produit,
            ':description_produit' => $description_produit,
            ':section_produit' => $section_produit,
            ':code_tarifaire' => $code_tarifaire,
            ':taux_imposition' => $taux_imposition,
            ':valeur_declaree' => $valeur_declaree,
            ':poids_kg' => $poids_kg,
            ':unite_mesure' => $unite_mesure,
            ':user_id' => $user_id,
            ':statut_validation' => $statut_validation,
            ':commentaires' => $commentaires
        ]);
        
        $product_id = $pdo->lastInsertId();
        
        // Ajouter une entrée dans l'historique
        addToHistory($pdo, $product_id, $user_id, 'creation', 'Création automatique via système de classification IA');
        
        echo json_encode([
            'success' => true,
            'message' => 'Produit sauvegardé avec succès',
            'product_id' => $product_id,
            'data' => [
                'id' => $product_id,
                'section' => $section_produit,
                'code_tarifaire' => $code_tarifaire,
                'taux_imposition' => $taux_imposition,
                'statut' => $statut_validation
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la sauvegarde: ' . $e->getMessage()
        ]);
    }
}

/**
 * Authentification utilisateur
 */
function authenticateUser($pdo, $data) {
    try {
        if (!isset($data['email']) || !isset($data['password'])) {
            throw new Exception('Email et mot de passe requis');
        }
        
        $email = $data['email'];
        $password = $data['password'];
        
        // Requête pour trouver l'utilisateur
        $sql = "SELECT user_id, nom_user, identifiant_user, email, mot_de_passe, is_admin, statut_compte 
                FROM user 
                WHERE email = :email AND statut_compte = 'actif'";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':email' => $email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            throw new Exception('Utilisateur non trouvé ou compte inactif');
        }
        
        // Vérification du mot de passe (utilisation de password_verify en production)
        // Pour le test, on utilise une vérification simple
        if (!password_verify($password, $user['mot_de_passe'])) {
            // Vérification de secours pour les mots de passe de test
            $testPasswords = [
                'admin123' => 'admin@douane.gov',
                'marie123' => 'marie@douane.gov',
                'ahmed123' => 'ahmed@douane.gov',
                'fatou123' => 'fatou@douane.gov'
            ];
            
            $validTestLogin = false;
            foreach ($testPasswords as $testPass => $testEmail) {
                if ($password === $testPass && $email === $testEmail) {
                    $validTestLogin = true;
                    break;
                }
            }
            
            if (!$validTestLogin) {
                throw new Exception('Mot de passe incorrect');
            }
        }
        
        // Mettre à jour la dernière connexion
        $updateSql = "UPDATE user SET derniere_connexion = NOW() WHERE user_id = :user_id";
        $updateStmt = $pdo->prepare($updateSql);
        $updateStmt->execute([':user_id' => $user['user_id']]);
        
        // Créer une session simple (en production, utiliser des tokens JWT)
        session_start();
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['user_email'] = $user['email'];
        
        echo json_encode([
            'success' => true,
            'message' => 'Connexion réussie',
            'user' => [
                'user_id' => $user['user_id'],
                'nom_complet' => $user['nom_user'],
                'nom_user' => $user['nom_user'], // Compatibility
                'identifiant_user' => $user['identifiant_user'],
                'email' => $user['email'],
                'is_admin' => $user['is_admin'],
                'role' => $user['is_admin'] ? 'administrateur' : 'utilisateur',
                'organisation' => 'Direction Générale des Douanes'
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
}

/**
 * Obtenir les statistiques d'un utilisateur
 */
function getUserStats($pdo, $data) {
    try {
        $user_id = getCurrentUserId($pdo);
        
        // Statistiques de base
        $sql = "SELECT 
                    COUNT(*) as total_classifications,
                    SUM(CASE WHEN statut_validation = 'valide' THEN 1 ELSE 0 END) as classifications_validees,
                    SUM(CASE WHEN statut_validation = 'en_attente' THEN 1 ELSE 0 END) as classifications_en_attente,
                    SUM(CASE WHEN DATE(date_classification) = CURDATE() THEN 1 ELSE 0 END) as classifications_today,
                    ROUND(AVG(CASE WHEN statut_validation = 'valide' THEN 100 ELSE 0 END), 1) as accuracy_rate
                FROM produits 
                WHERE user_id = :user_id";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([':user_id' => $user_id]);
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'stats' => $stats
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération des statistiques: ' . $e->getMessage()
        ]);
    }
}

/**
 * Obtenir l'historique d'un utilisateur
 */
function getUserHistory($pdo, $data) {
    try {
        $user_id = getCurrentUserId($pdo);
        $limit = isset($data['limit']) ? intval($data['limit']) : 50;
        $offset = isset($data['offset']) ? intval($data['offset']) : 0;
        
        // Récupérer l'historique avec pagination
        $sql = "SELECT 
                    p.id_produit,
                    p.origine_produit,
                    p.description_produit,
                    p.section_produit,
                    p.code_tarifaire,
                    p.taux_imposition,
                    p.statut_validation,
                    p.date_classification,
                    p.valeur_declaree,
                    p.poids_kg,
                    p.unite_mesure,
                    p.commentaires
                FROM produits p
                WHERE p.user_id = :user_id
                ORDER BY p.date_classification DESC
                LIMIT :limit OFFSET :offset";
        
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        $history = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Compter le total pour la pagination
        $countSql = "SELECT COUNT(*) as total FROM produits WHERE user_id = :user_id";
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute([':user_id' => $user_id]);
        $total = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
        
        echo json_encode([
            'success' => true,
            'history' => $history,
            'pagination' => [
                'total' => intval($total),
                'limit' => $limit,
                'offset' => $offset,
                'has_more' => ($offset + $limit) < $total
            ]
        ]);
        
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Erreur lors de la récupération de l\'historique: ' . $e->getMessage()
        ]);
    }
}

/**
 * Ajouter une entrée dans l'historique des classifications
 */
function addToHistory($pdo, $product_id, $user_id, $action, $comment) {
    try {
        $sql = "INSERT INTO historique_classifications 
                (id_produit, user_id, action_effectuee, commentaire_historique, date_action) 
                VALUES (:product_id, :user_id, :action, :comment, NOW())";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':product_id' => $product_id,
            ':user_id' => $user_id,
            ':action' => $action,
            ':comment' => $comment
        ]);
        
        return true;
    } catch (Exception $e) {
        error_log("Erreur ajout historique: " . $e->getMessage());
        return false;
    }
}

/**
 * Obtenir l'ID de l'utilisateur courant
 */
function getCurrentUserId($pdo) {
    // En production, récupérer depuis la session/token
    session_start();
    
    if (isset($_SESSION['user_id'])) {
        return $_SESSION['user_id'];
    }
    
    // Fallback : utiliser le premier utilisateur admin
    $sql = "SELECT user_id FROM user WHERE is_admin = 1 AND statut_compte = 'actif' LIMIT 1";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result ? $result['user_id'] : 5; // ID 5 = admin par défaut
}

/**
 * Créer un utilisateur de test
 */
function createTestUser($pdo, $name, $email, $password, $is_admin = false) {
    try {
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "INSERT INTO user (nom_user, identifiant_user, email, mot_de_passe, is_admin, statut_compte) 
                VALUES (:nom, :identifiant, :email, :password, :is_admin, 'actif')";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':nom' => $name,
            ':identifiant' => explode('@', $email)[0],
            ':email' => $email,
            ':password' => $hashedPassword,
            ':is_admin' => $is_admin ? 1 : 0
        ]);
        
        return $pdo->lastInsertId();
        
    } catch (Exception $e) {
        error_log("Erreur création utilisateur test: " . $e->getMessage());
        return false;
    }
}

// Initialisation des utilisateurs de test si nécessaire
function initializeTestUsers($pdo) {
    try {
        // Vérifier si les utilisateurs existent déjà
        $sql = "SELECT COUNT(*) as count FROM user";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        if ($count == 0) {
            // Créer les utilisateurs de test
            createTestUser($pdo, 'Administrateur Système', 'admin@douane.gov', 'admin123', true);
            createTestUser($pdo, 'Marie Douanière', 'marie@douane.gov', 'marie123', false);
            createTestUser($pdo, 'Ahmed Classificateur', 'ahmed@douane.gov', 'ahmed123', false);
            createTestUser($pdo, 'Fatou Inspectrice', 'fatou@douane.gov', 'fatou123', false);
        }
        
    } catch (Exception $e) {
        error_log("Erreur initialisation utilisateurs: " . $e->getMessage());
    }
}

// Appeler l'initialisation si nécessaire
// initializeTestUsers($pdo);

?>