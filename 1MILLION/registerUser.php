<?php
// registerUser.php - Inscription des utilisateurs
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

    $nom = trim($input['nom'] ?? '');
    $identifiant = trim($input['identifiant'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    $confirmPassword = $input['confirmPassword'] ?? '';

    // Validations
    if (empty($nom) || empty($identifiant) || empty($email) || empty($password)) {
        throw new Exception('Tous les champs sont obligatoires');
    }

    if (strlen($nom) < 2) {
        throw new Exception('Le nom doit contenir au moins 2 caractères');
    }

    if (strlen($identifiant) < 3) {
        throw new Exception('L\'identifiant doit contenir au moins 3 caractères');
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Format d\'email invalide');
    }

    if (strlen($password) < 6) {
        throw new Exception('Le mot de passe doit contenir au moins 6 caractères');
    }

    if ($password !== $confirmPassword) {
        throw new Exception('Les mots de passe ne correspondent pas');
    }

    // Vérifier que l'identifiant ne contient que des caractères autorisés
    if (!preg_match('/^[a-zA-Z0-9._-]+$/', $identifiant)) {
        throw new Exception('L\'identifiant ne peut contenir que des lettres, chiffres, points, tirets et underscores');
    }

    // Connexion à la base de données
    $pdo = DatabaseConfig::getConnection();

    // Vérifier si l'utilisateur existe déjà
    $checkStmt = $pdo->prepare("SELECT user_id FROM User WHERE email = ? OR identifiant_user = ?");
    $checkStmt->execute([$email, $identifiant]);
    
    if ($checkStmt->fetch()) {
        throw new Exception('Un compte avec cet email ou identifiant existe déjà');
    }

    // Hasher le mot de passe
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insérer le nouvel utilisateur
    $insertStmt = $pdo->prepare("
        INSERT INTO User (nom_user, identifiant_user, email, mot_de_passe, statut_compte) 
        VALUES (?, ?, ?, ?, 'actif')
    ");
    
    $insertStmt->execute([$nom, $identifiant, $email, $hashedPassword]);
    $userId = $pdo->lastInsertId();

    // Récupérer les informations de l'utilisateur créé
    $userStmt = $pdo->prepare("SELECT user_id, nom_user, identifiant_user, email, is_admin, date_creation FROM User WHERE user_id = ?");
    $userStmt->execute([$userId]);
    $newUser = $userStmt->fetch();

    // Log de création de compte
    error_log("Nouveau compte créé: " . $newUser['nom_user'] . " (" . $newUser['identifiant_user'] . ") - " . $newUser['email']);

    // Réponse de succès
    echo json_encode([
        'success' => true,
        'message' => 'Compte créé avec succès',
        'user' => $newUser
    ]);

} catch (Exception $e) {
    // Log de l'erreur
    error_log("Erreur d'inscription: " . $e->getMessage());

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
    <title>Inscription - Système CEDEAO</title>
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
<body class="min-h-screen bg-gradient-to-br from-douane-vert to-gray-800 py-8">
    <div class="max-w-md mx-auto">
        <div class="bg-white rounded-2xl shadow-2xl p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-douane-vert mb-2">🏛️ Douanes CI</h1>
                <p class="text-gray-600">Créer un nouveau compte</p>
            </div>

            <form id="registerForm" class="space-y-6">
                <div>
                    <label for="nom" class="block text-sm font-medium text-gray-700 mb-2">Nom complet :</label>
                    <input type="text" id="nom" name="nom" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                        placeholder="Ex: Jean Dupont">
                </div>

                <div>
                    <label for="identifiant" class="block text-sm font-medium text-gray-700 mb-2">Identifiant :</label>
                    <input type="text" id="identifiant" name="identifiant" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                        placeholder="Ex: jean.dupont">
                    <small class="text-gray-500">Lettres, chiffres, points, tirets et underscores uniquement</small>
                </div>

                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-2">Email :</label>
                    <input type="email" id="email" name="email" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                        placeholder="jean.dupont@douane.ci">
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-2">Mot de passe :</label>
                    <input type="password" id="password" name="password" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                        placeholder="Minimum 6 caractères">
                    <div id="passwordStrength" class="mt-1 text-xs"></div>
                </div>

                <div>
                    <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe :</label>
                    <input type="password" id="confirmPassword" name="confirmPassword" required
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-douane-vert focus:border-douane-vert transition-colors"
                        placeholder="Répétez le mot de passe">
                    <div id="passwordMatch" class="mt-1 text-xs"></div>
                </div>

                <button type="submit" id="registerBtn"
                    class="w-full bg-gradient-to-r from-douane-vert to-douane-or text-white py-3 px-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                    ✅ Créer le compte
                </button>
            </form>

            <div id="result" class="mt-6 p-4 rounded-lg hidden"></div>

            <div class="text-center mt-6 space-x-4">
                <a href="loginUser.php" class="text-douane-vert hover:text-douane-or font-medium">
                    ← J'ai déjà un compte
                </a>
                <span class="text-gray-300">|</span>
                <a href="index.html" class="text-douane-vert hover:text-douane-or font-medium">
                    Retour au système →
                </a>
            </div>
        </div>
    </div>

    <script>
        // Vérifier si on accède directement au fichier PHP
        if (window.location.pathname.endsWith('.php')) {
            document.addEventListener('DOMContentLoaded', function() {
                const registerForm = document.getElementById('registerForm');
                const resultDiv = document.getElementById('result');
                const registerBtn = document.getElementById('registerBtn');
                const passwordInput = document.getElementById('password');
                const confirmPasswordInput = document.getElementById('confirmPassword');
                const passwordStrengthDiv = document.getElementById('passwordStrength');
                const passwordMatchDiv = document.getElementById('passwordMatch');

                // Vérification force du mot de passe en temps réel
                passwordInput.addEventListener('input', function() {
                    const password = this.value;
                    let strength = 0;
                    let message = '';
                    let color = '';

                    if (password.length >= 6) strength++;
                    if (password.match(/[a-z]/)) strength++;
                    if (password.match(/[A-Z]/)) strength++;
                    if (password.match(/[0-9]/)) strength++;
                    if (password.match(/[^a-zA-Z0-9]/)) strength++;

                    switch(strength) {
                        case 0:
                        case 1:
                            message = 'Très faible';
                            color = 'text-red-600';
                            break;
                        case 2:
                            message = 'Faible';
                            color = 'text-orange-600';
                            break;
                        case 3:
                            message = 'Moyen';
                            color = 'text-yellow-600';
                            break;
                        case 4:
                            message = 'Fort';
                            color = 'text-green-600';
                            break;
                        case 5:
                            message = 'Très fort';
                            color = 'text-green-700';
                            break;
                    }

                    passwordStrengthDiv.textContent = password.length > 0 ? `Force: ${message}` : '';
                    passwordStrengthDiv.className = `mt-1 text-xs ${color}`;
                });

                // Vérification correspondance des mots de passe
                function checkPasswordMatch() {
                    const password = passwordInput.value;
                    const confirmPassword = confirmPasswordInput.value;

                    if (confirmPassword.length > 0) {
                        if (password === confirmPassword) {
                            passwordMatchDiv.textContent = '✅ Les mots de passe correspondent';
                            passwordMatchDiv.className = 'mt-1 text-xs text-green-600';
                        } else {
                            passwordMatchDiv.textContent = '❌ Les mots de passe ne correspondent pas';
                            passwordMatchDiv.className = 'mt-1 text-xs text-red-600';
                        }
                    } else {
                        passwordMatchDiv.textContent = '';
                    }
                }

                confirmPasswordInput.addEventListener('input', checkPasswordMatch);
                passwordInput.addEventListener('input', checkPasswordMatch);

                // Soumission du formulaire
                registerForm.addEventListener('submit', async function(e) {
                    e.preventDefault();
                    
                    const formData = new FormData(registerForm);
                    const data = Object.fromEntries(formData);
                    
                    registerBtn.textContent = '🔄 Création...';
                    registerBtn.disabled = true;
                    
                    try {
                        const response = await fetch(window.location.href, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(data)
                        });
                        
                        const result = await response.json();
                        
                        if (result.success) {
                            // Afficher le succès
                            resultDiv.className = 'mt-6 p-4 rounded-lg bg-green-100 border border-green-300';
                            resultDiv.innerHTML = `
                                <div class="text-green-800">
                                    <strong>✅ Compte créé avec succès !</strong><br>
                                    Bienvenue ${result.user.nom_user}<br>
                                    <small>Redirection vers la connexion...</small>
                                </div>
                            `;
                            resultDiv.classList.remove('hidden');
                            
                            // Rediriger vers la page de connexion après 3 secondes
                            setTimeout(() => {
                                window.location.href = 'loginUser.php';
                            }, 3000);
                            
                        } else {
                            throw new Error(result.message || 'Erreur lors de la création du compte');
                        }
                        
                    } catch (error) {
                        console.error('Erreur:', error);
                        resultDiv.className = 'mt-6 p-4 rounded-lg bg-red-100 border border-red-300';
                        resultDiv.innerHTML = `
                            <div class="text-red-800">
                                <strong>❌ Erreur</strong><br>
                                ${error.message}
                            </div>
                        `;
                        resultDiv.classList.remove('hidden');
                    }
                    
                    registerBtn.textContent = '✅ Créer le compte';
                    registerBtn.disabled = false;
                });
            });
        }
    </script>
</body>
</html>