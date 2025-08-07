<?php
// loginUser.php - Authentification des utilisateurs
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
    // Vérifier la méthode HTTP
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Méthode non autorisée. Utilisez POST.');
    }

    // Récupérer les données JSON
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validation des données d'entrée
    if (!$input) {
        throw new Exception('Données JSON invalides');
    }

    $identifiant = $input['identifiant'] ?? $input['email'] ?? '';
    $password = $input['password'] ?? '';

    if (empty($identifiant) || empty($password)) {
        throw new Exception('Identifiant et mot de passe requis');
    }

    // Connexion à la base de données
    $pdo = DatabaseConfig::getConnection();

    // Recherche de l'utilisateur (par email ou identifiant)
    $sql = "SELECT * FROM User WHERE (email = ? OR identifiant_user = ?) AND statut_compte = 'actif'";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$identifiant, $identifiant]);
    $user = $stmt->fetch();

    if (!$user) {
        // Log de tentative de connexion échouée
        error_log("Tentative de connexion échouée - Utilisateur non trouvé: " . $identifiant);
        throw new Exception('Identifiant ou mot de passe incorrect');
    }

    // Vérification du mot de passe
    if (!password_verify($password, $user['mot_de_passe'])) {
        // Log de tentative de connexion échouée
        error_log("Tentative de connexion échouée - Mot de passe incorrect pour: " . $identifiant);
        throw new Exception('Identifiant ou mot de passe incorrect');
    }

    // Mise à jour de la dernière connexion
    $updateStmt = $pdo->prepare("UPDATE User SET derniere_connexion = NOW() WHERE user_id = ?");
    $updateStmt->execute([$user['user_id']]);

    // Création de la session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['user_name'] = $user['nom_user'];
    $_SESSION['user_identifiant'] = $user['identifiant_user'];
    $_SESSION['is_admin'] = $user['is_admin'];
    $_SESSION['login_time'] = time();

    // Générer un token de session sécurisé
    $token = bin2hex(random_bytes(32));
    $_SESSION['token'] = $token;

    // Nettoyer les données sensibles
    unset($user['mot_de_passe']);

    // Ajouter des informations supplémentaires
    $user['session_token'] = $token;
    $user['login_time'] = date('Y-m-d H:i:s');

    // Log de connexion réussie
    error_log("Connexion réussie pour: " . $user['nom_user'] . " (" . $user['identifiant_user'] . ")");

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Connexion réussie',
        'user' => $user,
        'session' => [
            'token' => $token,
            'expires_in' => 3600 // 1 heure
        ]
    ]);

} catch (Exception $e) {
    // Log de l'erreur
    error_log("Erreur de connexion: " . $e->getMessage());

    // Réponse d'erreur
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>

<!-- Interface HTML intégrée -->
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - Système CEDEAO</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'douane-vert': '#1B5E20',
                        'douane-or': '#FFD700'
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen bg-gradient-to-br from-douane-vert to-gray-800 flex items-center justify-center">
    <div class="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-douane-vert mb-2">🏛️ Douanes CI</h1>
            <p class="text-gray-600">Système de Classification CEDEAO</p>
        </div>

        <form id="loginForm" class="space-y-6">
            <div>
                <label for="identifiant" class="block text-sm font-medium text-gray-700 mb-2">Identifiant ou Email :</label>
                <input type="text" id="identifiant" name="identifiant" required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                    placeholder="admin ou admin@douane.ci">
            </div>

            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Mot de passe :</label>
                <input type="password" id="password" name="password" required
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                    placeholder="Votre mot de passe">
            </div>

            <button type="submit" id="loginBtn"
                class="w-full bg-gradient-to-r from-douane-vert to-douane-or text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                🔐 Se connecter
            </button>
        </form>

        <div id="result" class="mt-6 p-4 rounded-lg hidden"></div>

        <div class="mt-8 bg-gray-50 p-4 rounded-lg">
            <h3 class="font-semibold text-gray-700 mb-2">👥 Comptes de test :</h3>
            <div class="space-y-1 text-sm text-gray-600">
                <div><strong>admin</strong> - Administrateur système</div>
                <div><strong>marie.douane</strong> - Marie Kouassi</div>
                <div><strong>ahmed.class</strong> - Ahmed Traoré</div>
                <div><strong>fatou.inspect</strong> - Fatou Koné</div>
            </div>
            <p class="text-xs text-gray-500 mt-2">Mot de passe par défaut : <code>password</code></p>
        </div>

        <div class="text-center mt-6 space-x-4">
            <a href="index.html" class="text-douane-vert hover:text-douane-or font-medium">
                ← Retour au système
            </a>
            <span class="text-gray-300">|</span>
            <a href="registerUser.php" class="text-douane-vert hover:text-douane-or font-medium">
                Créer un compte →
            </a>
        </div>
    </div>

    <script>
        // Vérifier si on accède directement au fichier PHP
        if (window.location.pathname.endsWith('.php')) {
            document.addEventListener('DOMContentLoaded', function() {
                const loginForm = document.getElementById('loginForm');
                const resultDiv = document.getElementById('result');
                const loginBtn = document.getElementById('loginBtn');

                loginForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const identifiant = document.getElementById('identifiant').value;
                    const password = document.getElementById('password').value;
                    
                    loginBtn.textContent = '🔄 Connexion...';
                    loginBtn.disabled = true;
                    
                    try {
                        const response = await fetch(window.location.href, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                identifiant: identifiant,
                                password: password
                            })
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            // Sauvegarder l'utilisateur connecté
                            localStorage.setItem('current_user', JSON.stringify(result.user));
                            localStorage.setItem('session_token', result.session.token);
                            
                            // Afficher le succès
                            resultDiv.className = 'mt-6 p-4 rounded-lg bg-green-100 border border-green-300';
                            resultDiv.innerHTML = `
                                <div class="text-green-800">
                                    <strong>✅ Connexion réussie !</strong><br>
                                    Bienvenue ${result.user.nom_user}<br>
                                    <small>Redirection automatique...</small>
                                </div>
                            `;
                            resultDiv.classList.remove('hidden');
                            
                            // Rediriger après 2 secondes
                            setTimeout(() => {
                                window.location.href = 'system.html';
                            }, 2000);
                            
                        } else {
                            throw new Error(result.message || 'Erreur de connexion');
                        }
                        
                    } catch (error) {
                        console.error('Erreur:', error);
                        resultDiv.className = 'mt-6 p-4 rounded-lg bg-red-100 border border-red-300';
                        resultDiv.innerHTML = `
                            <div class="text-red-800">
                                <strong>❌ Erreur de connexion</strong><br>
                                ${error.message}
                            </div>
                        `;
                        resultDiv.classList.remove('hidden');
                    }
                    
                    loginBtn.textContent = '🔐 Se connecter';
                    loginBtn.disabled = false;
                });

                // Vérifier si déjà connecté
                const currentUser = localStorage.getItem('current_user');
                if (currentUser) {
                    try {
                        const user = JSON.parse(currentUser);
                        resultDiv.className = 'mt-6 p-4 rounded-lg bg-blue-100 border border-blue-300';
                        resultDiv.innerHTML = `
                            <div class="text-blue-800">
                                <strong>ℹ️ Déjà connecté</strong><br>
                                Utilisateur : ${user.nom_user}<br>
                                <a href="system.html" class="text-blue-600 hover:underline">→ Aller au système</a>
                            </div>
                        `;
                        resultDiv.classList.remove('hidden');
                    } catch (e) {
                        localStorage.removeItem('current_user');
                        localStorage.removeItem('session_token');
                    }
                }
            });
        }
    </script>
</body>
</html>