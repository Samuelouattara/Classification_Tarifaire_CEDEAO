// Script de diagnostic pour vérifier le chargement des dépendances
// À ajouter temporairement pour diagnostiquer les problèmes

(function() {
    console.log('🔧 DIAGNOSTIC DU SYSTÈME - DÉBUT');
    
    // Vérifier la présence des classes/fonctions essentielles
    const checks = [
        { name: 'DatabaseManager', obj: window.DatabaseManager, type: 'class' },
        { name: 'TariffAIClassifier', obj: window.TariffAIClassifier, type: 'class' },
        { name: 'codesSpecifiques', obj: window.codesSpecifiques, type: 'object' },
        { name: 'rechercherCodesSpecifiques', obj: window.rechercherCodesSpecifiques, type: 'function' }
    ];
    
    checks.forEach(check => {
        if (check.obj) {
            console.log(`✅ ${check.name} : Disponible (${check.type})`);
        } else {
            console.error(`❌ ${check.name} : MANQUANT (${check.type})`);
        }
    });
    
    // Vérifier l'initialisation du dbManager
    setTimeout(() => {
        if (window.dbManager) {
            console.log('✅ window.dbManager : Initialisé');
            
            // Vérifier les méthodes essentielles
            const methods = ['saveClassifiedProduct', 'saveToLocalHistory', 'testConnection'];
            methods.forEach(method => {
                if (typeof window.dbManager[method] === 'function') {
                    console.log(`✅ dbManager.${method} : Disponible`);
                } else {
                    console.error(`❌ dbManager.${method} : MANQUANT`);
                }
            });
        } else {
            console.error('❌ window.dbManager : NON INITIALISÉ');
        }
    }, 2000);
    
    // Vérifier le localStorage
    try {
        localStorage.setItem('test', 'ok');
        localStorage.removeItem('test');
        console.log('✅ localStorage : Fonctionnel');
    } catch (error) {
        console.error('❌ localStorage : ERREUR', error);
    }
    
    // Vérifier l'iframe du tableau
    setTimeout(() => {
        const iframe = document.querySelector('iframe[src="tableau.html"]');
        if (iframe) {
            console.log('✅ Tableau iframe : Trouvée');
            
            iframe.addEventListener('load', () => {
                if (iframe.contentWindow && iframe.contentWindow.addProductToTable) {
                    console.log('✅ Tableau.addProductToTable : Disponible');
                } else {
                    console.warn('⚠️ Tableau.addProductToTable : Non accessible');
                }
            });
        } else {
            console.error('❌ Tableau iframe : MANQUANTE');
        }
    }, 1000);
    
    console.log('🔧 DIAGNOSTIC DU SYSTÈME - FIN');
})();

// Fonction utilitaire pour débugger les erreurs
window.debugClassification = function() {
    console.log('🐛 DEBUG CLASSIFICATION');
    console.log('DatabaseManager:', typeof window.DatabaseManager);
    console.log('dbManager:', typeof window.dbManager);
    console.log('aiClassifier:', typeof window.aiClassifier);
    
    if (window.dbManager) {
        console.log('dbManager methods:', Object.getOwnPropertyNames(window.dbManager));
    }
    
    // Tester la sauvegarde locale
    try {
        const testEntry = {
            section: { number: 'TEST', title: 'Test Section' },
            confidence: 99,
            code: 'TEST.00.00.00'
        };
        
        if (window.dbManager && typeof window.dbManager.saveToLocalHistory === 'function') {
            window.dbManager.saveToLocalHistory('Test debug', testEntry);
            console.log('✅ Test sauvegarde locale : Réussi');
        } else {
            console.error('❌ Test sauvegarde locale : Échec');
        }
    } catch (error) {
        console.error('❌ Erreur test sauvegarde locale:', error);
    }
};