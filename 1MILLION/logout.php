<?php
// logout.php - Déconnexion des utilisateurs
// Direction Générale des Douanes de Côte d'Ivoire

session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gestion des requêtes OPTIONS (CORS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    // Récupérer les données de la requête
    $input = json_decode(file_get_contents('php://input'), true);
    $method = $_SERVER['REQUEST_METHOD'];
    
    // Support des méthodes GET et POST pour plus de flexibilité
    if ($method === 'GET' || $method === 'POST') {
        
        $userId = null;
        $sessionToken = null;
        
        // Récupérer les informations utilisateur
        if ($method === 'POST' && $input) {
            $userId = $input['user_id'] ?? null;
            $sessionToken = $input['session_token'] ?? null;
        }
        
        // Fallback sur la session PHP si pas d'infos dans la requête
        if (!$userId && isset($_SESSION['user_id'])) {
            $userId = $_SESSION['user_id'];
        }
        
        if (!$sessionToken && isset($_SESSION['token'])) {
            $sessionToken = $_SESSION['token'];
        }
        
        // Connexion à la base de données pour le log
        $pdo = null;
        try {
            $pdo = DatabaseConfig::getConnection();
        } catch (Exception $e) {
            // Si pas de connexion DB, continuer quand même la déconnexion
            error_log("Impossible de se connecter à la DB pour le logout: " . $e->getMessage());
        }
        
        // Enregistrer la déconnexion en base si possible
        if ($pdo && $userId) {
            try {
                $stmt = $pdo->prepare("UPDATE User SET derniere_deconnexion = NOW() WHERE user_id = ?");
                $stmt->execute([$userId]);
                
                // Log d'audit optionnel
                $logStmt = $pdo->prepare("
                    INSERT INTO Logs_Connexions (user_id, action_log, ip_adresse, user_agent, date_action) 
                    VALUES (?, 'deconnexion', ?, ?, NOW())
                ");
                $logStmt->execute([
                    $userId,
                    $_SERVER['REMOTE_ADDR'] ?? 'unknown',
                    $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
                ]);
                
            } catch (Exception $e) {
                error_log("Erreur lors de l'enregistrement de la déconnexion: " . $e->getMessage());
            }
        }
        
        // Récupérer le nom d'utilisateur pour le log
        $userName = $_SESSION['user_name'] ?? 'Utilisateur inconnu';
        
        // Détruire complètement la session PHP
        session_unset();
        session_destroy();
        
        // Supprimer le cookie de session
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 3600, // 1 heure dans le passé
                $params["path"] ?? '/',
                $params["domain"] ?? '',
                $params["secure"] ?? false,
                $params["httponly"] ?? true
            );
        }
        
        // Log de succès
        error_log("✅ Déconnexion réussie - Utilisateur: $userName (ID: $userId)");
        
        // Réponse JSON
        echo json_encode([
            'success' => true,
            'message' => 'Déconnexion réussie',
            'user_name' => $userName,
            'redirect_url' => 'index.html',
            'timestamp' => date('Y-m-d H:i:s'),
            'session_destroyed' => true
        ]);
        
    } else {
        throw new Exception("Méthode non autorisée: $method");
    }
    
} catch (Exception $e) {
    // Log de l'erreur
    error_log("❌ Erreur lors de la déconnexion: " . $e->getMessage());
    
    // Même en cas d'erreur, on détruit la session
    session_unset();
    session_destroy();
    
    // Réponse d'erreur mais avec indication que la session est détruite
    http_response_code(200); // 200 car la déconnexion a quand même eu lieu
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'session_destroyed' => true,
        'redirect_url' => 'index.html',
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}

// Fonction pour forcer la déconnexion d'urgence (accessible via GET)
if (isset($_GET['emergency'])) {
    session_start();
    session_unset();
    session_destroy();
    
    // Redirection immédiate
    header('Location: index.html');
    exit();
}

// Support pour les appels directs (GET simple)
if ($_SERVER['REQUEST_METHOD'] === 'GET' && !isset($_GET['emergency'])) {
    // Afficher une interface simple pour confirmer la déconnexion
    if (!headers_sent()) {
        header('Content-Type: text/html; charset=UTF-8');
    }
    
    echo '
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Déconnexion - Système CEDEAO</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <script>
            tailwind.config = {
                theme: {
                    extend: {
                        colors: {
                            "douane-vert": "#1B5E20",
                            "douane-or": "#FFD700"
                        }
                    }
                }
            }
        </script>
    </head>
    <body class="bg-gradient-to-br from-douane-vert to-gray-800 min-h-screen flex items-center justify-center">
        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div class="text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-3xl">🚪</span>
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-4">Déconnexion du Système</h1>
                <p class="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir vous déconnecter du système CEDEAO ?
                </p>
                
                <div class="space-y-4">
                    <button onclick="performLogout()" 
                        class="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors">
                        🚪 Confirmer la déconnexion
                    </button>
                    
                    <button onclick="goBack()" 
                        class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors">
                        ← Retour au système
                    </button>
                    
                    <a href="?emergency=1" 
                        class="block w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium text-center transition-colors text-sm">
                        ⚡ Déconnexion d\'urgence
                    </a>
                </div>
                
                <div id="result" class="mt-6 hidden"></div>
            </div>
        </div>
        
        <script>
            async function performLogout() {
                const resultDiv = document.getElementById("result");
                
                try {
                    // Récupérer les infos de session
                    const currentUser = JSON.parse(localStorage.getItem("current_user") || "{}");
                    const sessionToken = localStorage.getItem("session_token");
                    
                    // Appel AJAX
                    const response = await fetch("logout.php", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            user_id: currentUser.user_id,
                            session_token: sessionToken
                        })
                    });
                    
                    const result = await response.json();
                    
                    // Nettoyer le localStorage dans tous les cas
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    if (result.success || result.session_destroyed) {
                        resultDiv.className = "mt-6 p-4 bg-green-100 border border-green-300 rounded-lg";
                        resultDiv.innerHTML = `
                            <div class="text-green-800 font-medium">
                                ✅ Déconnexion réussie !<br>
                                <small>Redirection automatique...</small>
                            </div>
                        `;
                        
                        setTimeout(() => {
                            window.location.href = "index.html";
                        }, 2000);
                    } else {
                        throw new Error(result.message || "Erreur inconnue");
                    }
                    
                } catch (error) {
                    console.error("Erreur:", error);
                    
                    // Nettoyer quand même
                    localStorage.clear();
                    sessionStorage.clear();
                    
                    resultDiv.className = "mt-6 p-4 bg-orange-100 border border-orange-300 rounded-lg";
                    resultDiv.innerHTML = `
                        <div class="text-orange-800 font-medium">
                            ⚠️ Déconnexion forcée<br>
                            <small>Redirection automatique...</small>
                        </div>
                    `;
                    
                    setTimeout(() => {
                        window.location.href = "index.html";
                    }, 2000);
                }
                
                resultDiv.classList.remove("hidden");
            }
            
            function goBack() {
                window.history.back();
            }
            
            // Vérifier si on est connecté
            const currentUser = localStorage.getItem("current_user");
            if (!currentUser) {
                document.body.innerHTML = `
                    <div class="bg-gradient-to-br from-douane-vert to-gray-800 min-h-screen flex items-center justify-center">
                        <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
                            <h1 class="text-2xl font-bold text-gray-900 mb-4">❌ Aucune session active</h1>
                            <p class="text-gray-600 mb-6">Vous n\'êtes pas connecté au système.</p>
                            <a href="index.html" class="inline-block bg-douane-vert hover:bg-green-800 text-white py-3 px-6 rounded-lg font-semibold transition-colors">
                                🏠 Retour à l\'accueil
                            </a>
                        </div>
                    </div>
                `;
            }
        </script>
    </body>
    </html>
    ';
    exit();
}
?>