// Système de Classification Tarifaire CEDEAO - Version avec Notifications Toast
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
        await initializeDatabaseManager();
        await initializeAIClassifier();
        initializeTableauIntegration();
        setupEventListeners();
        loadClassificationHistory();
        updateStatistics();
        console.log('✅ Système initialisé');
    } catch (error) {
        console.error('❌ Erreur initialisation:', error);
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
                        <p class="mt-2 text-gray-700 leading-relaxed text-lg font-semibold">${getTaxRate(result.section.number)}%</p>
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
        taux_imposition: getTaxRate(classificationResult.section.number),
        valeur_declaree: productInfo.value || 0,
        poids_kg: 0,
        unite_mesure: 'unité',
        statut_validation: classificationResult.confidence > 80 ? 'valide' : 'en_attente',
        commentaires: `Classification automatique - Confiance: ${classificationResult.confidence}%`
    };

    return await dbManager.saveClassifiedProduct(productData);
}

// Taux d'imposition
function getTaxRate(sectionNumber) {
    const taxRates = {
        'I': 10.50, 'II': 8.75, 'III': 12.00, 'IV': 15.25, 'V': 5.50,
        'VI': 18.75, 'VII': 14.50, 'VIII': 16.25, 'IX': 11.75, 'X': 13.50,
        'XI': 17.25, 'XII': 19.50, 'XIII': 9.25, 'XIV': 25.00, 'XV': 12.75,
        'XVI': 22.50, 'XVII': 20.75, 'XVIII': 16.50, 'XIX': 35.00, 'XX': 15.75,
        'XXI': 30.00
    };
    return taxRates[sectionNumber] || 10.50;
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