// logout-utils.js - Utilitaires simples pour la déconnexion

// Fonction simple de déconnexion
async function logout(showConfirmation = true) {
    // Demander confirmation si nécessaire
    if (showConfirmation) {
        if (!confirm('🚪 Êtes-vous sûr de vouloir vous déconnecter ?')) {
            return;
        }
    }
    
    try {
        // Récupérer les informations de session
        const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}');
        const sessionToken = localStorage.getItem('session_token');
        
        // Appeler logout.php
        const response = await fetch('logout.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: currentUser.user_id,
                session_token: sessionToken
            })
        });
        
        const result = await response.json();
        
        // Nettoyer le localStorage dans tous les cas
        localStorage.clear();
        sessionStorage.clear();
        
        console.log('✅ Déconnexion:', result.message);
        
        // Rediriger vers l'accueil
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('❌ Erreur de déconnexion:', error);
        
        // Nettoyer quand même et rediriger
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'index.html';
    }
}

// Déconnexion d'urgence (sans confirmation)
function emergencyLogout() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = 'logout.php?emergency=1';
}

// Ajouter un bouton de déconnexion simple à vos pages
function addLogoutButton(containerId = 'logout-container') {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <button onclick="logout()" 
                class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <span>🚪</span>
                <span>Déconnexion</span>
            </button>
        `;
    }
}

// Ajouter automatiquement des gestionnaires de déconnexion
document.addEventListener('DOMContentLoaded', function() {
    // Ajouter des boutons à tous les éléments avec la classe 'logout-btn'
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
    
    // Raccourci clavier Ctrl+Alt+L
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.altKey && e.key === 'l') {
            e.preventDefault();
            logout();
        }
    });
    
    // Déconnexion automatique à la fermeture
    window.addEventListener('beforeunload', () => {
        // Déconnexion silencieuse
        navigator.sendBeacon('logout.php', JSON.stringify({
            user_id: JSON.parse(localStorage.getItem('current_user') || '{}').user_id,
            session_token: localStorage.getItem('session_token')
        }));
    });
});

console.log('🚪 Utilitaires de déconnexion chargés');