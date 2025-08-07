// Système de Classification Tarifaire CEDEAO - Version Propre et Fonctionnelle
let aiClassifier;
let isAIReady = false;
let classificationHistory = [];
let tableauFrame;
let dbManager = null;

// Initialisation principale
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initialisation du système...');
    initializeSystem();
});

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

// DatabaseManager de secours
// DatabaseManager de secours
function createFallbackDatabaseManager() {
    console.log('🔧 DatabaseManager de secours...');
    
    window.DatabaseManager = class {
        constructor() {
            // URLs harmonisées avec database-manager.js
            this.possibleUrls = [
                './api.php',                                                             // Chemin relatif
                'api.php',                                                               // Alternative  
                'http://localhost/Classification_Tarifaire_CEDEAO/1MILLION/api.php'     // Chemin absolu MAMP
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
            // S'assurer qu'on a une URL qui fonctionne
            if (!this.apiUrl) {
                const found = await this.findWorkingUrl();
                if (!found) {
                    // Fallback local si aucune API
                    this.saveToLocalHistory(productData.description_produit, {
                        section: { number: productData.section_produit },
                        confidence: 75,
                        code: productData.code_tarifaire
                    });
                    
                    return { 
                        success: false, 
                        message: 'Aucune API accessible. Sauvé localement.',
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
                // Fallback local en cas d'erreur
                this.saveToLocalHistory(productData.description_produit, {
                    section: { number: productData.section_produit },
                    confidence: 75,
                    code: productData.code_tarifaire
                });
                
                return { 
                    success: false, 
                    message: `Erreur DB: ${error.message}. Sauvé localement.`,
                    fallback: true
                };
            }
        }
        
        saveToLocalHistory(description, result) {
            try {
                let history = JSON.parse(localStorage.getItem('classification_history') || '[]');
                history.unshift({
                    timestamp: new Date().toISOString(),
                    description: description,
                    section: result.section?.number || 'Inconnu',
                    confidence: result.confidence || 0,
                    code: result.code || 'N/A'
                });
                if (history.length > 100) history = history.slice(0, 100);
                localStorage.setItem('classification_history', JSON.stringify(history));
                return history[0];
            } catch (error) {
                console.error('❌ Erreur sauvegarde locale:', error);
                return null;
            }
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
        alert('Veuillez saisir une description du produit.');
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
            results = classifySimple(description);
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
        alert('Erreur lors de la classification');
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

// Affichage résultats (VOTRE STYLE ORIGINAL RESTAURÉ)
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
            <h4 class="text-2xl font-bold text-douane-vert mb-3">📊 Analyse complète - ${results.length} résultat(s)</h4>
            <div class="flex flex-wrap gap-4 text-sm">
                <span class="bg-white/80 px-3 py-1 rounded-full text-gray-700 border border-gray-300">🕒 ${new Date().toLocaleTimeString()}</span>
                <span class="bg-douane-vert/20 px-3 py-1 rounded-full text-douane-vert border border-douane-vert/30">📈 Confiance globale: ${Math.round(results[0]?.confidence || 0)}%</span>
                ${(results[0]?.confidence || 0) < 70 ? '<span class="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 border border-yellow-300">⚠️ Validation requise</span>' : ''}
            </div>
        </div>
    `;
    
    results.forEach((result, index) => {
        const isMainResult = index === 0;
        
        const itemClass = isMainResult 
            ? 'bg-gradient-to-r from-douane-vert/5 to-douane-or/5 border-2 border-douane-or rounded-2xl p-6 mb-6 shadow-lg relative'
            : 'bg-white/95 border border-gray-200 rounded-xl p-6 mb-4 shadow-md hover:shadow-lg transition-shadow duration-300';
        
        html += `
            <div class="${itemClass}" data-section="${result.section.number}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-4">
                        <div class="bg-douane-vert text-white px-4 py-2 rounded-full font-bold text-lg">Section ${result.section.number}</div>
                        <div class="px-4 py-2 rounded-full text-sm font-semibold ${getCertaintyTailwindClass(result.confidence)}">
                            ${Math.round(result.confidence)}% - ${getCertaintyLevel(result.confidence)}
                        </div>
                    </div>
                    ${isMainResult ? '<div class="bg-douane-or text-douane-vert px-4 py-2 rounded-full font-bold text-sm">RECOMMANDÉ</div>' : ''}
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
    });
    
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

// Fonctions pour les boutons additionnels
function showSectionDetails(sectionNumber) {
    const description = getSectionDescription(sectionNumber);
    const taxRate = getTaxRate(sectionNumber);
    
    alert(`SECTION ${sectionNumber} - DÉTAILS COMPLETS\n\n` +
          `Description: ${description}\n\n` +
          `Taux d'imposition: ${taxRate}%\n\n` +
          `Cette section fait partie du Système Harmonisé (SH) 2022 utilisé par la CEDEAO.`);
}

function provideFeedback(sectionNumber, isCorrect) {
    const message = isCorrect 
        ? `✅ Merci ! Votre retour positif sur la Section ${sectionNumber} nous aide à améliorer le système.`
        : `👎 Merci pour votre retour. Nous noterons que la Section ${sectionNumber} n'était pas appropriée pour cette classification.`;
    
    alert(message);
    
    // Ici vous pourriez ajouter une logique pour envoyer le feedback à votre système d'apprentissage
    console.log(`Feedback: Section ${sectionNumber} - ${isCorrect ? 'Correct' : 'Incorrect'}`);
}

// FONCTION PRINCIPALE - Sélection et stockage
window.selectAndStoreClassification = async function(sectionNumber, sectionTitle, confidence, code) {
    const description = document.getElementById('product-description').value;
    
    if (!description) {
        alert('Description manquante');
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
                dbMessage = `Sauvegardé en base (ID: ${result.product_id})`;
            } else if (result && result.fallback) {
                dbSuccess = false;
                dbMessage = 'Base inaccessible, sauvegardé localement';
            } else {
                throw new Error(result?.message || 'Erreur inconnue');
            }
        } catch (dbError) {
            dbSuccess = false;
            dbMessage = `Erreur DB: ${dbError.message}`;
            saveToHistory(description, classificationResult);
        }
        
        // 3. Toujours sauvegarder localement
        saveToHistory(description, classificationResult);
        
        // 4. Message final
        const successMessage = dbSuccess 
            ? `✅ Classification stockée avec succès en Section ${sectionNumber}!\n${dbMessage}`
            : `⚠️ Classification partiellement stockée.\nSection ${sectionNumber} - Ajouté au tableau.\nBase de données: ${dbMessage}`;
        
        alert(successMessage);
        
        // 5. Réinitialiser
        if (confirm('Classifier un autre produit ?')) {
            document.getElementById('product-description').value = '';
            document.getElementById('results').classList.add('hidden');
        }
        
    } catch (error) {
        console.error('❌ Erreur stockage:', error);
        alert('Erreur de stockage: ' + error.message);
    }
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
        
        localStorage.setItem('classification_history', JSON.stringify(classificationHistory));
    } catch (error) {
        console.error('Erreur sauvegarde historique:', error);
    }
}

function loadClassificationHistory() {
    try {
        const stored = localStorage.getItem('classification_history');
        if (stored) {
            classificationHistory = JSON.parse(stored);
        }
    } catch (error) {
        console.error('Erreur chargement historique:', error);
        classificationHistory = [];
    }
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

console.log('✅ Script Advanced Clean chargé et prêt');