// Système de Classification Tarifaire CEDEAO - Version avec Notifications Toast
// Bot CEDEAO comme système principal de classification
let aiClassifier;
let isAIReady = false;
let classificationHistory = [];
let tableauFrame;
let dbManager = null;

// Initialisation principale
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du système...');
    initializeSystem();
    createToastStyles(); // Ajouter les styles pour les toasts
});

// Créer les styles CSS pour les notifications toast
function createToastStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            pointer-events: none;
        }
        
        .toast {
            background: linear-gradient(135deg, #4ade80, #22c55e);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            margin-bottom: 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            transform: translateX(100%);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events: auto;
            max-width: 400px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
        }
        
        .toast.show {
            transform: translateX(0);
        }
        
        .toast.success {
            background: linear-gradient(135deg, #4ade80, #22c55e);
        }
        
        .toast.positive {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }
        
        .toast.negative {
            background: linear-gradient(135deg, #f59e0b, #d97706);
        }
        
        .toast.error {
            background: linear-gradient(135deg, #ef4444, #dc2626);
        }
        
        .toast.info {
            background: linear-gradient(135deg, #06b6d4, #0891b2);
        }
        
        .toast .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .toast .toast-icon {
            font-size: 24px;
            flex-shrink: 0;
        }
        
        .toast .toast-text {
            flex: 1;
        }
        
        .toast .toast-title {
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 4px;
        }
        
        .toast .toast-message {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Créer le conteneur pour les toasts
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
}

// Fonction principale pour afficher les toasts
function showToast(config) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Supprimer tous les toasts existants
    const existingToasts = container.querySelectorAll('.toast');
    existingToasts.forEach(toast => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 200);
    });

    
    const toast = document.createElement('div');
    toast.className = `toast ${config.type || 'success'}`;
    
    // Ajouter la classe clickable si nécessaire
    if (config.clickable) {
        toast.style.cursor = 'pointer';
        toast.addEventListener('click', () => {
            if (config.onClick) {
                config.onClick();
                // Fermer le toast après clic
                toast.classList.remove('show');
                setTimeout(() => {
                    if (toast && toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }
        });
    }
    
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">${config.icon}</div>
            <div class="toast-text">
                <div class="toast-title">${config.title}</div>
                ${config.message ? `<div class="toast-message">${config.message}</div>` : ''}
            </div>
        </div>
    `;
    
    container.appendChild(toast);
    
    // Animation d'entrée
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Suppression automatique (sauf si clickable et pas de durée spécifiée)
    const duration = config.duration || (config.clickable ? 8000 : 4000);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, duration);
}

// Fonctions spécifiques pour chaque type de toast et cliquable quand le message contient "Cliquez pour continuer"
function showSuccessToast(title, message = '', duration = 4000) {
    const isClickable = message.includes('Cliquez pour continuer');
    
    showToast({
        type: 'success',
        icon: '✅',
        title: title,
        message: message,
        duration: duration,
        clickable: isClickable,
        onClick: isClickable ? () => {
            continueClassification();
        } : undefined
    });
}

function showPositiveToast(title, message = '', duration = 3000) {
    showToast({
        type: 'positive',
        icon: '👍',
        title: title,
        message: message,
        duration: duration
    });
}

function showNegativeToast(title, message = '', duration = 3500) {
    showToast({
        type: 'negative',
        icon: '📝',
        title: title,
        message: message,
        duration: duration
    });
}

function showErrorToast(title, message = '', duration = 5000) {
    showToast({
        type: 'error',
        icon: '❌',
        title: title,
        message: message,
        duration: duration
    });
}

function showInfoToast(title, message = '', duration = 4000) {
    showToast({
        type: 'info',
        icon: 'ℹ️',
        title: title,
        message: message,
        duration: duration
    });
}

// Initialisation du système
async function initializeSystem() {
    try {
        // Charger les règles CEDEAO
        await loadCEDEORules();
        
        await initializeDatabaseManager();
        await initializeAIClassifier();
        initializeTableauIntegration();
        setupEventListeners();
        loadClassificationHistory();
        updateStatistics();
        console.log('✅ Système initialisé avec règles CEDEAO');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
    }
}


// Charger les règles CEDEAO
async function loadCEDEORules() {
    try {
        // Vérifier si le script est déjà chargé
        if (typeof classifyProductWithCEDEO === 'function') {
            console.log('✅ Règles CEDEAO déjà disponibles');
            return;
        }
        
        // Charger le script des règles CEDEAO
        const script = document.createElement('script');
        script.src = 'cedeo-bot-rules.js';
        script.onload = () => {
            console.log('✅ Règles CEDEAO chargées avec succès');
        };
        script.onerror = () => {
            console.warn('⚠️ Impossible de charger les règles CEDEAO, utilisation du système existant');
        };
        document.head.appendChild(script);
    } catch (error) {
        console.warn('⚠️ Erreur chargement règles CEDEAO:', error);
    }
}

// Initialisation DatabaseManager
async function initializeDatabaseManager() {
    console.log('🔄 Initialisation DatabaseManager...');
    
    try {
        if (typeof window.DatabaseManager !== 'undefined') {
            dbManager = new window.DatabaseManager();
            window.dbManager = dbManager;
            
            const testResult = await dbManager.testConnection();
            if (testResult.success) {
                console.log('✅ DatabaseManager connecté');
                return true;
            } else {
                console.warn('⚠️ Connexion DB échouée:', testResult.message);
            }
        }
    } catch (error) {
        console.error('❌ Erreur DatabaseManager:', error);
    }
    
    // Créer DatabaseManager de secours
    createFallbackDatabaseManager();
    return false;
}

// DatabaseManager de secours (sans localStorage)
function createFallbackDatabaseManager() {
    console.log('🔧 DatabaseManager de secours...');
    
    window.DatabaseManager = class {
        constructor() {
            this.possibleUrls = [
                './api.php',
                'api.php'
            ];
            this.apiUrl = null;
        }
        
        async findWorkingUrl() {
            for (const url of this.possibleUrls) {
                try {
                    const response = await fetch(url + '?action=test_connection');
                    if (response.ok) {
                        const result = await response.json();
                        if (result.success) {
                            this.apiUrl = url;
                            console.log(`✅ URL fonctionnelle: ${url}`);
                            return true;
                        }
                    }
                } catch (error) {
                    console.log(`❌ ${url}: ${error.message}`);
                }
            }
            return false;
        }
        
        async testConnection() {
            if (!this.apiUrl) {
                await this.findWorkingUrl();
            }
            
            if (!this.apiUrl) {
                return { success: false, message: 'Aucune API accessible' };
            }
            
            try {
                const response = await fetch(this.apiUrl + '?action=test_connection');
                return await response.json();
            } catch (error) {
                return { success: false, message: error.message };
            }
        }
        
        async saveClassifiedProduct(productData) {
            if (!this.apiUrl) {
                const found = await this.findWorkingUrl();
                if (!found) {
                    this.saveToMemoryHistory(productData.description_produit, {
                        section: { number: productData.section_produit },
                        confidence: 75,
                        code: productData.code_tarifaire
                    });
                    
                    return { 
                        success: false, 
                        message: 'Mode hors ligne',
                        fallback: true
                    };
                }
            }

            try {
                const response = await fetch(this.apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'save_classified_product',
                        product: productData
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    return result;
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            } catch (error) {
                this.saveToMemoryHistory(productData.description_produit, {
                    section: { number: productData.section_produit },
                    confidence: 75,
                    code: productData.code_tarifaire
                });
                
                return { 
                    success: false, 
                    message: 'Mode hors ligne',
                    fallback: true
                };
            }
        }
        
        saveToMemoryHistory(description, result) {
            const historyItem = {
                timestamp: new Date().toISOString(),
                description: description,
                section: result.section?.number || 'Inconnu',
                confidence: result.confidence || 0,
                code: result.code || 'N/A'
            };
            
            classificationHistory.unshift(historyItem);
            if (classificationHistory.length > 100) {
                classificationHistory = classificationHistory.slice(0, 100);
            }
            
            return historyItem;
        }
    };
    
    dbManager = new window.DatabaseManager();
    window.dbManager = dbManager;
}

// Initialisation IA
async function initializeAIClassifier() {
    try {
        if (typeof TariffAIClassifier !== 'undefined') {
            aiClassifier = new TariffAIClassifier();
            isAIReady = true;
            console.log('✅ IA initialisée');
            updateAIStatus(true);
        } else {
            throw new Error('TariffAIClassifier non disponible');
        }
    } catch (error) {
        console.log('⚠️ IA non disponible, mode fallback');
        isAIReady = false;
        updateAIStatus(false);
    }
}

// Initialisation tableau
function initializeTableauIntegration() {
    tableauFrame = document.querySelector('iframe[src="tableau.html"]');
    if (tableauFrame) {
        console.log('✅ Tableau détecté');
        tableauFrame.addEventListener('load', function() {
            console.log('✅ Tableau chargé');
        });
    }
}

// Configuration événements
function setupEventListeners() {
    const classifyBtn = document.getElementById('classify-btn');
    const productDescription = document.getElementById('product-description');
    
    if (classifyBtn) {
        classifyBtn.addEventListener('click', handleClassification);
    }
    
    if (productDescription) {
        productDescription.addEventListener('keydown', function(event) {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleClassification();
            }
        });
    }
}

// Gestion classification
async function handleClassification() {
    const productDescription = document.getElementById('product-description');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    const description = productDescription.value.trim();
    
    if (!description) {
        showErrorToast('Description requise', 'Veuillez saisir une description du produit à classifier');
        productDescription.focus();
        return;
    }
    
    // Loading
    if (loadingDiv) loadingDiv.classList.remove('hidden');
    if (resultsDiv) resultsDiv.classList.add('hidden');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        let results;
        
        // Utiliser le bot CEDEAO comme système principal
        try {
            const response = await fetch('api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'classify_cedeo',
                    product_name: description
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Convertir le format CEDEAO au format attendu par le système
                results = [{
                    section: { 
                        number: result.classification.section,
                        title: getSectionTitle(result.classification.section) // Ajout du titre de la section
                    },
                    chapter: result.classification.chapter,
                    description: description,
                    confidence: Math.round(result.classification.confidence * 100),
                    method: result.classification.classification_method,
                    tax_rate: result.classification.tax_rate,
                    code: result.classification.tariff_code, // Ajout du champ 'code' attendu par le frontend
                    tariff_code: result.classification.tariff_code,
                    source: result.source,
                    fallback: result.fallback || false
                }];
                
                console.log('🎯 Bot CEDEAO utilisé:', result);
                
                // Afficher une notification selon la source
                if (result.source === 'CEDEAO_BOT') {
                    showSuccessToast('Classification CEDEAO', 'Produit classifié avec le bot CEDEAO');
                } else {
                    showInfoToast('Système de secours', 'Classification avec le système existant (bot CEDEAO indisponible)');
                }
            } else {
                throw new Error(result.message || 'Erreur de classification');
            }
        } catch (error) {
            console.warn('⚠️ Erreur bot CEDEAO, fallback vers système existant:', error);
            // Continuer avec la logique existante
        }
        
        // Si CEDEAO n'a pas fonctionné, utiliser la logique existante
        if (!results) {
            if (isAIReady) {
                results = await aiClassifier.classifyWithAI(description);
            } else {
                // Utiliser l'IA personnalisée ultra-optimisée en priorité
                if (typeof window.CustomCedeoAI !== 'undefined') {
                    try {
                        const customAI = new window.CustomCedeoAI();
                        results = await customAI.classifyWithAI(description);
                        console.log('🚀 IA CEDEAO ultra-optimisée utilisée');
                    } catch (error) {
                        console.warn('Erreur avec CustomCedeoAI, fallback vers IntelligentTariffClassifier:', error);
                        
                        // Fallback vers IntelligentTariffClassifier
                        if (typeof window.IntelligentTariffClassifier !== 'undefined') {
                            try {
                                const intelligentClassifier = new window.IntelligentTariffClassifier();
                                results = await intelligentClassifier.classifyProduct(description);
                                console.log('🧠 Classification intelligente utilisée (fallback)');
                            } catch (error2) {
                                console.warn('Erreur avec IntelligentTariffClassifier, fallback vers classifyProductImproved:', error2);
                                if (typeof classifyProductImproved === 'function') {
                                    results = classifyProductImproved(description);
                                } else {
                                    results = classifySimple(description);
                                }
                            }
                        } else if (typeof classifyProductImproved === 'function') {
                            try {
                                results = classifyProductImproved(description);
                            } catch (error2) {
                                console.warn('Erreur avec classifyProductImproved, fallback vers classifySimple:', error2);
                                results = classifySimple(description);
                            }
                        } else {
                            console.warn('classifyProductImproved non disponible, utilisation de classifySimple');
                            results = classifySimple(description);
                        }
                    }
                } else if (typeof window.IntelligentTariffClassifier !== 'undefined') {
                    try {
                        const intelligentClassifier = new window.IntelligentTariffClassifier();
                        results = await intelligentClassifier.classifyProduct(description);
                        console.log('🧠 Classification intelligente utilisée');
                    } catch (error) {
                        console.warn('Erreur avec IntelligentTariffClassifier, fallback vers classifyProductImproved:', error);
                        if (typeof classifyProductImproved === 'function') {
                            results = classifyProductImproved(description);
                        } else {
                            results = classifySimple(description);
                        }
                    }
                } else if (typeof classifyProductImproved === 'function') {
                    try {
                        results = classifyProductImproved(description);
                    } catch (error) {
                        console.warn('Erreur avec classifyProductImproved, fallback vers classifySimple:', error);
                        results = classifySimple(description);
                    }
                } else {
                    console.warn('classifyProductImproved non disponible, utilisation de classifySimple');
                    results = classifySimple(description);
                }
            }
        }
        
        displayResults(results);
        saveToHistory(description, results[0]);
        updateStatistics();
        
        if (loadingDiv) loadingDiv.classList.add('hidden');
        if (resultsDiv) {
            resultsDiv.classList.remove('hidden');
            resultsDiv.scrollIntoView({ behavior: 'smooth' });
        }
        
    } catch (error) {
        console.error('Erreur classification:', error);
        if (loadingDiv) loadingDiv.classList.add('hidden');
        showErrorToast('Erreur de classification', 'Une erreur s\'est produite. Veuillez réessayer.');
    }
}

// Classification simple (fallback)
function classifySimple(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('riz') || desc.includes('blé') || desc.includes('céréale')) {
        return [{
            section: { number: 'II', title: 'Produits du règne végétal' },
            confidence: 85,
            code: '1006.30.00.00'
        }];
    } else if (desc.includes('viande') || desc.includes('poisson') || desc.includes('animal')) {
        return [{
            section: { number: 'I', title: 'Animaux vivants et produits du règne animal' },
            confidence: 80,
            code: '0201.10.00.00'
        }];
    } else if (desc.includes('téléphone') || desc.includes('ordinateur') || desc.includes('électronique')) {
        return [{
            section: { number: 'XVI', title: 'Machines et appareils électriques' },
            confidence: 90,
            code: '8517.12.00.00'
        }];
    } else if (desc.includes('voiture') || desc.includes('véhicule')) {
        return [{
            section: { number: 'XVII', title: 'Matériel de transport' },
            confidence: 85,
            code: '8703.23.00.00'
        }];
    } else {
        return [{
            section: { number: 'XX', title: 'Marchandises et produits divers' },
            confidence: 60,
            code: '9999.00.00.00'
        }];
    }
}

// Affichage résultats (conservé votre style original)
function displayResults(results) {
    const resultsContainer = document.getElementById('classification-result');
    if (!resultsContainer) return;
    
    if (!results || results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-8 text-center space-y-4">
                <h4 class="text-2xl font-bold text-red-600">❌ Aucune classification trouvée</h4>
                <p class="text-red-700">Aucune correspondance satisfaisante n'a été trouvée.</p>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                    <h5 class="text-lg font-semibold text-blue-800 mb-3">💡 Suggestions d'amélioration :</h5>
                    <ul class="text-left text-blue-700 space-y-2 max-w-md mx-auto">
                        <li class="flex items-start gap-2"><span class="text-blue-500">•</span>Utilisez des termes plus spécifiques</li>
                        <li class="flex items-start gap-2"><span class="text-blue-500">•</span>Ajoutez des détails sur la matière ou l'usage</li>
                        <li class="flex items-start gap-2"><span class="text-blue-500">•</span>Précisez l'état du produit (brut, transformé, etc.)</li>
                    </ul>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="bg-gradient-to-r from-douane-vert/10 to-douane-or/10 rounded-xl p-6 mb-6 border border-douane-or/20">
            <h4 class="text-2xl font-bold text-douane-vert mb-3">📊 Analyse complète - 1 résultat</h4>
            <div class="flex flex-wrap gap-4 text-sm">
                <span class="bg-white/80 px-3 py-1 rounded-full text-gray-700 border border-gray-300">🕒 ${new Date().toLocaleTimeString()}</span>
                <span class="bg-douane-vert/20 px-3 py-1 rounded-full text-douane-vert border border-douane-vert/30">📈 Confiance globale: ${Math.round(results[0]?.confidence || 0)}%</span>
                ${(results[0]?.confidence || 0) < 70 ? '<span class="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 border border-yellow-300">⚠️ Validation requise</span>' : ''}
            </div>
        </div>
    `;
    
    // Afficher seulement le premier résultat (le plus pertinent)
    const result = results[0];
    const isMainResult = true;
    
    const itemClass = 'bg-gradient-to-r from-douane-vert/5 to-douane-or/5 border-2 border-douane-or rounded-2xl p-6 mb-6 shadow-lg relative';
    
    html += `
            <div class="${itemClass}" data-section="${result.section.number}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-4">
                        <div class="bg-douane-vert text-white px-4 py-2 rounded-full font-bold text-lg">Section ${result.section.number}</div>
                        <div class="px-4 py-2 rounded-full text-sm font-semibold ${getCertaintyTailwindClass(result.confidence)}">
                            ${Math.round(result.confidence)}% - ${getCertaintyLevel(result.confidence)}
                        </div>
                    </div>
                    <div class="bg-douane-or text-douane-vert px-4 py-2 rounded-full font-bold text-sm">RECOMMANDÉ</div>
                </div>
                
                <h4 class="text-2xl font-bold text-douane-vert mb-6">${result.section.title}</h4>
                
                <div class="space-y-4">
                    <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
                        <strong class="text-douane-or font-semibold">🎯 Code Tarifaire :</strong>
                        <p class="mt-2 text-gray-700 leading-relaxed font-mono text-lg">${result.code}</p>
                    </div>
                    
                    <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
                        <strong class="text-douane-or font-semibold">💰 Taux d'imposition :</strong>
                        <p class="mt-2 text-gray-700 leading-relaxed text-lg font-semibold">${getTaxRate(result.section.number, result.code)}%</p>
                    </div>
                    
                    <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
                        <strong class="text-douane-or font-semibold">📖 Description Section :</strong>
                        <p class="mt-2 text-gray-700 leading-relaxed">${getSectionDescription(result.section.number)}</p>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                        class="px-6 py-3 bg-douane-vert text-white rounded-xl hover:bg-douane-vert/90 cursor-pointer transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                        onclick="selectAndStoreClassification('${result.section.number}', '${result.section.title}', ${result.confidence}, '${result.code}')"
                    >
                        ✅ Sélectionner et Stocker
                    </button>
                    
                    <button 
                        class="px-4 py-3 bg-douane-or text-douane-vert rounded-xl hover:bg-douane-or/90 cursor-pointer transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                        onclick="showSectionDetails('${result.section.number}')"
                    >
                        ℹ️ Plus d'infos
                    </button>
                    
                    <button 
                        class="px-4 py-3 bg-green-100 text-green-800 border border-green-300 rounded-xl hover:bg-green-200 cursor-pointer transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                        onclick="provideFeedback('${result.section.number}', true)"
                    >
                        👍 Correct
                    </button>
                    
                    <button 
                        class="px-4 py-3 bg-red-100 text-red-800 border border-red-300 rounded-xl hover:bg-red-200 cursor-pointer transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
                        onclick="provideFeedback('${result.section.number}', false)"
                    >
                        👎 Incorrect
                    </button>
                </div>
            </div>
        `;
    
    resultsContainer.innerHTML = html;
}

// Fonctions utilitaires pour l'affichage
function getCertaintyTailwindClass(confidence) {
    if (confidence >= 85) return "bg-green-100 text-green-800 border border-green-300";
    if (confidence >= 70) return "bg-green-100 text-green-800 border border-green-300";
    if (confidence >= 55) return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    if (confidence >= 40) return "bg-red-100 text-red-800 border border-red-300";
    return "bg-gray-100 text-gray-800 border border-gray-300";
}

function getCertaintyLevel(confidence) {
    if (confidence >= 85) return "TRÈS ÉLEVÉE";
    if (confidence >= 70) return "ÉLEVÉE";
    if (confidence >= 55) return "MOYENNE";
    if (confidence >= 40) return "FAIBLE";
    return "TRÈS FAIBLE";
}

function getSectionDescription(sectionNumber) {
    const descriptions = {
        'I': 'Animaux vivants, viandes et abats comestibles, poissons et crustacés, mollusques et autres invertébrés aquatiques, laits et produits de la laiterie, œufs d\'oiseaux, miel naturel',
        'II': 'Plantes vivantes et produits de la floriculture, légumes, plantes, racines et tubercules alimentaires, fruits comestibles, café, thé, maté et épices, céréales',
        'III': 'Graisses et huiles animales, végétales ou d\'origine microbienne et produits de leur dissociation; graisses alimentaires élaborées; cires d\'origine animale ou végétale',
        'IV': 'Préparations de viande, de poissons ou de crustacés, de mollusques ou d\'autres invertébrés aquatiques, sucres et sucreries, cacao et ses préparations, préparations à base de céréales',
        'V': 'Sel; soufre; terres et pierres; plâtres, chaux et ciments, minerais, scories et cendres, combustibles minéraux, huiles minérales et produits de leur distillation',
        'VI': 'Produits chimiques inorganiques; composés inorganiques ou organiques de métaux précieux, produits pharmaceutiques, engrais, extraits tannants ou tinctoriaux',
        'VII': 'Matières plastiques et ouvrages en ces matières, caoutchouc et ouvrages en caoutchouc',
        'VIII': 'Peaux (autres que les pelleteries) et cuirs, ouvrages en cuir; articles de bourrellerie ou de sellerie; articles de voyage, sacs à main',
        'IX': 'Bois, charbon de bois et ouvrages en bois, liège et ouvrages en liège, ouvrages de sparterie ou de vannerie',
        'X': 'Pâtes de bois ou d\'autres matières fibreuses cellulosiques; papier ou carton à recycler, papiers et cartons; ouvrages en pâte de cellulose',
        'XI': 'Matières textiles et ouvrages en ces matières (soie, laine, coton, fibres synthétiques, tissus, vêtements)',
        'XII': 'Chaussures, guêtres et articles analogues; parties de ces objets, coiffures et parties de coiffures, parapluies, ombrelles',
        'XIII': 'Ouvrages en pierres, plâtre, ciment, amiante, mica ou matières analogues, produits céramiques, verre et ouvrages en verre',
        'XIV': 'Perles fines ou de culture, pierres gemmes ou similaires, métaux précieux, plaqués ou doublés de métaux précieux et ouvrages en ces matières',
        'XV': 'Métaux communs et ouvrages en ces métaux (fonte, fer, acier, cuivre, aluminium, outils, outillage)',
        'XVI': 'Machines et appareils, matériel électrique et leurs parties; appareils d\'enregistrement ou de reproduction du son, appareils électroniques',
        'XVII': 'Matériel de transport (véhicules automobiles, tracteurs, cycles, navires, aéronefs)',
        'XVIII': 'Instruments et appareils d\'optique, de photographie, de mesure, de contrôle ou de précision; instruments médico-chirurgicaux; horlogerie; instruments de musique',
        'XIX': 'Armes, munitions et leurs parties et accessoires',
        'XX': 'Marchandises et produits divers (meubles, jouets, jeux, articles pour divertissements ou pour sports)',
        'XXI': 'Objets d\'art, de collection ou d\'antiquité'
    };
    return descriptions[sectionNumber] || 'Description non disponible';
}

function getSectionTitle(sectionNumber) {
    const titles = {
        'I': 'Animaux vivants et produits du règne animal',
        'II': 'Produits du règne végétal',
        'III': 'Graisses et huiles animales, végétales ou d\'origine microbienne',
        'IV': 'Produits des industries alimentaires; boissons, liquides alcooliques et vinaigres; tabacs',
        'V': 'Produits minéraux',
        'VI': 'Produits des industries chimiques ou des industries connexes',
        'VII': 'Matières plastiques et ouvrages en ces matières; caoutchouc et ouvrages en caoutchouc',
        'VIII': 'Peaux, cuirs, pelleteries et ouvrages en ces matières',
        'IX': 'Bois, charbon de bois et ouvrages en bois; liège et ouvrages en liège',
        'X': 'Pâtes de bois ou d\'autres matières fibreuses cellulosiques; papier ou carton',
        'XI': 'Matières textiles et ouvrages en ces matières',
        'XII': 'Chaussures, coiffures, parapluies, cannes, fouets, cravaches',
        'XIII': 'Ouvrages en pierres, plâtre, ciment, amiante, mica; produits céramiques; verre',
        'XIV': 'Perles fines ou de culture, pierres gemmes, métaux précieux',
        'XV': 'Métaux communs et ouvrages en ces métaux',
        'XVI': 'Machines et appareils, matériel électrique et leurs parties',
        'XVII': 'Matériel de transport',
        'XVIII': 'Instruments et appareils d\'optique, de photographie, de mesure, de contrôle',
        'XIX': 'Armes, munitions et leurs parties et accessoires',
        'XX': 'Marchandises et produits divers',
        'XXI': 'Objets d\'art, de collection ou d\'antiquité'
    };
    return titles[sectionNumber] || 'Section inconnue';
}

// Fonction mise à jour pour afficher les détails complets dans un toast (style image)
window.showSectionDetails = function(sectionNumber) {
    const description = getSectionDescription(sectionNumber);
    const taxRate = getTaxRate(sectionNumber);
    const sectionTitle = getSectionTitle(sectionNumber);
    
    // Toast détaillé reproduisant le style de votre image
    showToast({
        type: 'info',
        icon: '📊',
        title: `SECTION ${sectionNumber} - DÉTAILS COMPLETS`,
        message: `
            <div style="margin-top: 15px; text-align: left; line-height: 1.7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
                
                <!-- Titre de la section -->
                <div style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(8, 145, 178, 0.1)); padding: 14px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(6, 182, 212, 0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 20px;">🏷️</span>
                        <strong style="color: #0891b2; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Titre Officiel</strong>
                    </div>
                    <div style="color: rgba(255,255,255,0.95); font-size: 15px; font-weight: 600; line-height: 1.4;">${sectionTitle}</div>
                </div>
                
                <!-- Description détaillée -->
                <div style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(217, 119, 6, 0.1)); padding: 14px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(245, 158, 11, 0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 20px;">📖</span>
                        <strong style="color: #d97706; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Description</strong>
                    </div>
                    <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.5;">${description}</div>
                </div>
                
                <!-- Taux d'imposition -->
                <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1)); padding: 14px; border-radius: 12px; margin-bottom: 12px; border: 1px solid rgba(34, 197, 94, 0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 20px;">💰</span>
                        <strong style="color: #16a34a; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Taux d'imposition</strong>
                    </div>
                    <div style="color: rgba(255,255,255,0.95); font-size: 18px; font-weight: 700;">${taxRate}%</div>
                </div>
                
                <!-- Système de référence -->
                <div style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(147, 51, 234, 0.1)); padding: 14px; border-radius: 12px; border: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                        <span style="font-size: 20px;">🌍</span>
                        <strong style="color: #a855f7; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px;">Système de référence</strong>
                    </div>
                    <div style="color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.4;">
                        Cette section fait partie du Système Harmonisé (SH) 2022 utilisé par la CEDEAO.
                    </div>
                </div>
                
            </div>
        `,
        duration: 12000,
        clickable: true,
        onClick: () => {
            console.log(`Détails Section ${sectionNumber} consultés`);
        }
    });
};

window.provideFeedback = function(sectionNumber, isCorrect) {
    if (isCorrect) {
        showPositiveToast(
            'Merci pour votre retour !',
            `Classification Section ${sectionNumber} validée`
        );
    } else {
        showNegativeToast(
            'Correction notée',
            `Section ${sectionNumber} marquée comme incorrecte`
        );
    }
    
    console.log(`Feedback: Section ${sectionNumber} - ${isCorrect ? 'Correct' : 'Incorrect'}`);
};

// FONCTION PRINCIPALE - Sélection et stockage avec toast de succès
window.selectAndStoreClassification = async function(sectionNumber, sectionTitle, confidence, code) {
    const description = document.getElementById('product-description').value;
    
    if (!description) {
        showErrorToast('Description manquante', 'Impossible de stocker sans description du produit');
        return;
    }
    
    console.log('🔄 Stockage en cours...');
    
    const productInfo = {
        description: description,
        origin: 'Non spécifié',
        value: 0,
        timestamp: new Date().toISOString()
    };
    
    const classificationResult = {
        section: { number: sectionNumber, title: sectionTitle },
        confidence: confidence,
        code: code,
        timestamp: new Date().toISOString()
    };
    
    let dbSuccess = false;
    let dbMessage = '';
    
    try {
        // 1. Ajouter au tableau
        if (tableauFrame && tableauFrame.contentWindow && tableauFrame.contentWindow.addProductToTable) {
            tableauFrame.contentWindow.addProductToTable(productInfo, classificationResult);
            console.log('✅ Ajouté au tableau');
        } else {
            console.warn('⚠️ Tableau non accessible');
        }
        
        // 2. Sauvegarder en base
        try {
            const result = await saveProductToDatabase(productInfo, classificationResult);
            
            if (result && result.success) {
                dbSuccess = true;
                dbMessage = `Base de données connectée`;
                showSuccessToast(
                    'Classification stockée avec succès !',
                    `Section ${sectionNumber} • Base de données connectée • Cliquez pour continuer`,
                    6000
                );
            } else if (result && result.fallback) {
                dbSuccess = false;
                dbMessage = 'Mode hors ligne';
                showSuccessToast(
                    'Classification stockée !',
                    `Section ${sectionNumber} • Mode hors ligne • Cliquez pour continuer`,
                    6000
                );
            } else {
                throw new Error(result?.message || 'Erreur inconnue');
            }
        } catch (dbError) {
            dbSuccess = false;
            dbMessage = 'Mode hors ligne';
            saveToHistory(description, classificationResult);
            showSuccessToast(
                'Classification stockée !',
                `Section ${sectionNumber} • Mode hors ligne • Cliquez pour continuer`,
                6000
            );
        }
        
        // 3. Toujours sauvegarder localement
        saveToHistory(description, classificationResult);
        
    } catch (error) {
        console.error('❌ Erreur stockage:', error);
        showErrorToast(
            'Erreur de stockage',
            error.message || 'Une erreur inattendue s\'est produite'
        );
    }
};

// Fonction helper pour continuer la classification
window.continueClassification = function() {
    document.getElementById('product-description').value = '';
    document.getElementById('results').classList.add('hidden');
    document.getElementById('product-description').focus();
};

// Sauvegarde base de données
async function saveProductToDatabase(productInfo, classificationResult) {
    if (!dbManager) {
        throw new Error('DatabaseManager non disponible');
    }

    const productData = {
        origine_produit: productInfo.origin || 'Non spécifié',
        description_produit: productInfo.description,
        section_produit: classificationResult.section.number,
        code_tarifaire: classificationResult.code,
        taux_imposition: getTaxRate(classificationResult.section.number, classificationResult.code),
        valeur_declaree: productInfo.value || 0,
        poids_kg: 0,
        unite_mesure: 'unité',
        statut_validation: classificationResult.confidence > 80 ? 'valide' : 'en_attente',
        commentaires: `Classification automatique - Confiance: ${classificationResult.confidence}%`
    };

    return await dbManager.saveClassifiedProduct(productData);
}

// Taux d'imposition CORRIGÉS selon les codes tarifaires spécifiques du fichier TEC CEDEAO officiel
function getTaxRate(sectionNumber, tariffCode = null) {
    // Si on a un code tarifaire spécifique, l'utiliser en priorité
    if (tariffCode) {
        const specificRate = getSpecificTariffRate(tariffCode);
        if (specificRate !== null) {
            return specificRate;
        }
    }
    
    // Sinon, utiliser les taux par section (moyenne des codes de la section)
    const sectionAverageRates = {
        'I': 19,   // Moyenne des codes 0201-0210, 0301-0307, etc.
        'II': 17,  // Moyenne des codes 0601-0614, 0701-0714, etc.
        'III': 20, // Code 1501-1522
        'IV': 23,  // Moyenne des codes 1601-1624, 1701-1724, etc.
        'V': 8,    // Moyenne des codes 2501-2529, 2601-2621, 2701-2716
        'VI': 11,  // Moyenne des codes 2801-2853, 2901-2942, etc.
        'VII': 15, // Codes 3901-3926, 4001-4017
        'VIII': 20, 'IX': 15, 'X': 15, 'XI': 20, 'XII': 25, 'XIII': 15,
        'XIV': 10, 'XV': 15, 'XVI': 15, 'XVII': 5, 'XVIII': 15, 'XIX': 10,
        'XX': 20, 'XXI': 5
    };
    
    return sectionAverageRates[sectionNumber] || 15;
}

// Fonction pour obtenir le taux spécifique d'un code tarifaire
function getSpecificTariffRate(tariffCode) {
    // Taux spécifiques extraits du fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt
    const specificRates = {
        // Section I - Chapitre 02 (Viandes)
        '0201.10.00.00': 35, '0201.20.00.00': 35, '0201.30.00.00': 35,
        '0202.10.00.00': 35, '0202.20.00.00': 35, '0202.30.00.00': 35,
        '0203.11.00.00': 35, '0203.12.00.00': 35, '0203.19.00.00': 35,
        '0203.21.00.00': 35, '0203.22.00.00': 35, '0203.29.00.00': 35,
        '0204.10.00.00': 35, '0204.21.00.00': 35, '0204.22.00.00': 35,
        '0204.23.00.00': 35, '0204.30.00.00': 35, '0204.41.00.00': 35,
        '0204.42.00.00': 35, '0204.43.00.00': 35, '0204.50.00.00': 35,
        '0205.00.00.00': 20, // Viandes chevalines - taux différent !
        '0206.10.00.00': 35, '0206.21.00.00': 35, '0206.22.00.00': 35,
        '0206.29.00.00': 35, '0206.30.00.00': 35, '0206.41.00.00': 35,
        '0206.49.00.00': 35, '0206.80.00.00': 35, '0206.90.00.00': 35,
        '0207.11.00.00': 35, '0207.12.00.00': 35, '0207.13.00.00': 35,
        '0207.14.00.00': 35, '0207.24.00.00': 35, '0207.25.00.00': 35,
        '0207.26.00.00': 35, '0207.27.00.00': 35, '0207.41.00.00': 35,
        '0207.42.00.00': 35, '0207.43.00.00': 35, '0207.44.00.00': 35,
        '0207.45.00.00': 35, '0207.51.00.00': 35, '0207.52.00.00': 35,
        '0207.53.00.00': 35, '0207.54.00.00': 35, '0207.55.00.00': 35,
        '0207.60.00.00': 35, '0208.10.00.00': 20, '0208.30.00.00': 20,
        '0208.40.00.00': 20, '0208.50.00.00': 20, '0208.60.00.00': 20,
        '0208.90.00.00': 20, '0209.10.00.00': 20, '0209.90.00.00': 20,
        '0210.11.00.00': 20, '0210.12.00.00': 20, '0210.19.00.00': 20,
        '0210.20.00.00': 35, '0210.91.00.00': 20, '0210.92.00.00': 20,
        '0210.93.00.00': 20, '0210.99.00.00': 20,
        
        // Section I - Chapitre 03 (Poissons)
        '0301.11.00.00': 10, '0301.19.00.00': 10, '0301.91.10.00': 5,
        '0301.91.90.00': 10, '0301.92.10.00': 5, '0301.92.90.00': 10,
        '0301.93.10.00': 5, '0301.93.90.00': 10, '0301.94.10.00': 5,
        '0301.94.90.00': 10, '0301.95.10.00': 5, '0301.95.90.00': 10,
        '0301.99.10.00': 5, '0301.99.90.00': 10,
        '0302.11.00.00': 10, '0302.13.00.00': 10, '0302.14.00.00': 10,
        '0302.19.00.00': 10, '0302.21.00.00': 10, '0302.22.00.00': 10,
        '0302.23.00.00': 10, '0302.24.00.00': 10, '0302.29.00.00': 10,
        '0302.31.00.00': 10, '0302.32.00.00': 10, '0302.33.00.00': 10,
        '0302.34.00.00': 10, '0302.35.00.00': 10, '0302.36.00.00': 10,
        '0302.39.00.00': 10, '0302.41.00.00': 10, '0302.42.00.00': 10,
        
        // Section VI - Chapitre 28 (Produits chimiques)
        '2843.10.00.00': 5, '2843.21.00.00': 5, '2843.29.00.00': 5,
        '2843.30.00.00': 5, '2843.90.00.00': 5, '2844.10.00.00': 5,
        '2844.20.00.00': 5, '2844.30.00.00': 5, '2844.41.00.00': 5,
        '2844.42.00.00': 5, '2844.43.00.00': 5, '2844.44.00.00': 5,
        '2844.50.00.00': 5, '2845.10.00.00': 5, '2845.20.00.00': 5,
        '2845.30.00.00': 5, '2845.40.00.00': 5, '2845.90.00.00': 5,
        '2846.10.00.00': 5, '2846.90.00.00': 5, '2847.00.00.00': 5,
        '2849.10.00.00': 5, '2849.20.00.00': 5, '2849.90.00.00': 5,
        '2850.00.00.00': 5,
        
        // Section XVII - Chapitre 88 (Véhicules aériens) - CORRIGÉ
        '8801.00.00.00': 5,  // Ballons et dirigeables; planeurs, ailes volantes
        '8802.11.00.00': 5,  // Hélicoptères, poids ≤ 2000 kg
        '8802.12.00.00': 5,  // Hélicoptères, poids > 2000 kg
        '8802.20.00.00': 5,  // Avions et autres véhicules aériens, poids ≤ 2000 kg
        '8802.30.00.00': 5,  // Avions et autres véhicules aériens, 2000 kg < poids ≤ 15000 kg
        '8802.40.00.00': 5,  // Avions et autres véhicules aériens, poids > 15000 kg
        '8802.60.00.00': 5,  // Véhicules spatiaux et satellites
        '8804.00.00.00': 5,  // Parachutes et leurs parties
        '8805.10.00.00': 5,  // Appareils de lancement et d'appontage
        '8805.21.00.00': 5,  // Simulateurs de combat aérien
        '8805.29.00.00': 5,  // Autres simulateurs d'entraînement au vol
        '8806.10.00.00': 5,  // Véhicules aériens sans pilote, transport passagers
        '8806.21.00.00': 5,  // Drones téléguidés, poids ≤ 250 g
        '8806.22.00.00': 5,  // Drones téléguidés, 250 g < poids ≤ 7 kg
        '8806.23.00.00': 5,  // Drones téléguidés, 7 kg < poids ≤ 25 kg
        '8806.24.00.00': 5,  // Drones téléguidés, 25 kg < poids ≤ 150 kg
        '8806.29.00.00': 5,  // Autres drones téléguidés
        '8806.91.00.00': 5,  // Autres drones, poids ≤ 250 g
        '8806.92.00.00': 5,  // Autres drones, 250 g < poids ≤ 7 kg
        '8806.93.00.00': 5,  // Autres drones, 7 kg < poids ≤ 25 kg
        '8806.94.00.00': 5,  // Autres drones, 25 kg < poids ≤ 150 kg
        '8806.99.00.00': 5,  // Autres drones
        '8807.10.00.00': 5,  // Hélices et rotors
        '8807.20.00.00': 5,  // Trains d'atterrissage
        '8807.30.00.00': 5,  // Autres parties d'avions/hélicoptères
        '8807.90.00.00': 5,  // Autres parties
        
        // Codes génériques utilisés par le bot CEDEAO
        '880100': 5,  // Code générique pour avions (bot CEDEAO)
        '880200': 5,  // Code générique pour hélicoptères (bot CEDEAO)
        '880300': 5,  // Code générique pour autres véhicules aériens (bot CEDEAO)
        '880400': 5,  // Code générique pour parachutes (bot CEDEAO)
        '880500': 5,  // Code générique pour appareils de lancement (bot CEDEAO)
        '880600': 5,  // Code générique pour drones (bot CEDEAO)
        '880700': 5   // Code générique pour parties (bot CEDEAO)
    };
    
    return specificRates[tariffCode] || null;
}

// Historique local
function saveToHistory(description, result) {
    try {
        classificationHistory.unshift({
            timestamp: new Date().toISOString(),
            description: description,
            result: result
        });
        
        if (classificationHistory.length > 50) {
            classificationHistory = classificationHistory.slice(0, 50);
        }
        
        console.log('📚 Historique mis à jour:', classificationHistory.length, 'éléments');
    } catch (error) {
        console.error('Erreur sauvegarde historique:', error);
    }
}

function loadClassificationHistory() {
    classificationHistory = [];
    console.log('📚 Historique initialisé (mode mémoire)');
}

// Statistiques
function updateStatistics() {
    const stats = {
        totalClassifications: classificationHistory.length,
        averageConfidence: calculateAverageConfidence()
    };
    displayStatistics(stats);
}

function calculateAverageConfidence() {
    if (classificationHistory.length === 0) return 0;
    const total = classificationHistory.reduce((sum, item) => sum + (item.result?.confidence || 0), 0);
    return Math.round(total / classificationHistory.length);
}

function displayStatistics(stats) {
    const statsContainer = document.getElementById('statistics');
    if (statsContainer) {
        const existingContent = statsContainer.innerHTML;
        const dynamicStats = `
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3);">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #FFD700;">${stats.totalClassifications}</div>
                        <div style="font-size: 0.8em; opacity: 0.9;">Classifications</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 1.5em; font-weight: bold; color: #FFD700;">${stats.averageConfidence}%</div>
                        <div style="font-size: 0.8em; opacity: 0.9;">Confiance moy.</div>
                    </div>
                </div>
            </div>
        `;
        
        // Ajouter seulement si pas déjà présent
        if (!existingContent.includes('Classifications')) {
            statsContainer.innerHTML = existingContent + dynamicStats;
        }
    }
}

// Mise à jour statut IA
function updateAIStatus(ready) {
    const statusElement = document.getElementById('ai-status');
    if (statusElement) {
        if (ready) {
            statusElement.innerHTML = '<span style="color: #4ade80; font-weight: 600;">🤖 IA Avancée Activée</span>';
        } else {
            statusElement.innerHTML = '<span style="color: #fbbf24; font-weight: 600;">📊 Système Classique</span>';
        }
    }
}

// Export compatibilité
window.selectClassification = window.selectAndStoreClassification;

console.log('✅ Script avec Notifications Toast chargé et prêt');