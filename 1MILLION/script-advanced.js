// Système de Classification Tarifaire CEDEAO - Version Avancée avec IA
// Intégration du moteur d'IA pour une classification de précision maximale
// AVEC INTEGRATION TABLEAU ET BASE DE DONNÉES

// Initialisation du classificateur IA
let aiClassifier;
let isAIReady = false;
let classificationHistory = [];

// Référence au tableau intégré
let tableauFrame;

// Initialisation principale
document.addEventListener('DOMContentLoaded', function() {
    // Check for test parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const testDescription = urlParams.get('test');
    
    if (testDescription) {
        setTimeout(() => {
            document.getElementById('product-description').value = testDescription;
            setTimeout(() => {
                classifyProduct();
            }, 1500);
        }, 500);
    }
    
    initializeSystem();
    setupDropdownControls();
});

// Initialisation complète du système
async function initializeSystem() {
    try {
        await initializeAIClassifier();
        loadSections();
        setupEventListeners();
        loadStatistics();
        loadClassificationHistory();
        initializeTableauIntegration();
        showWelcomeMessage();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showErrorMessage('Erreur système', 'Impossible d\'initialiser le système de classification');
    }
}

// Initialisation de l'intégration avec le tableau
function initializeTableauIntegration() {
    // Récupérer la référence de l'iframe du tableau
    tableauFrame = document.querySelector('iframe[src="tableau.html"]');
    
    if (tableauFrame) {
        console.log('✅ Tableau intégré détecté');
        
        // Attendre que le tableau soit chargé
        tableauFrame.addEventListener('load', function() {
            console.log('✅ Tableau chargé et prêt');
            
            // Vérifier que la fonction d'ajout est disponible
            if (tableauFrame.contentWindow && tableauFrame.contentWindow.addProductToTable) {
                console.log('✅ Fonction d\'ajout au tableau disponible');
            } else {
                console.warn('⚠️ Fonction d\'ajout au tableau non trouvée');
            }
        });
    } else {
        console.warn('⚠️ Tableau non trouvé dans la page');
    }
}

// Initialisation du classificateur IA
async function initializeAIClassifier() {
    try {
        // Simulation d'un chargement asynchrone
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (typeof TariffAIClassifier !== 'undefined') {
            aiClassifier = new TariffAIClassifier();
            isAIReady = true;
            console.log('✅ Classificateur IA initialisé avec succès');
            updateAIStatus(true);
        } else {
            throw new Error('TariffAIClassifier non disponible');
        }
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'IA:', error);
        isAIReady = false;
        updateAIStatus(false);
        // Fallback vers le système classique
        initializeFallbackClassifier();
    }
}

// Système de classification de secours
function initializeFallbackClassifier() {
    console.log('🔄 Utilisation du système de classification de secours');
    isAIReady = false;
}

// Mise à jour du statut de l'IA dans l'interface
function updateAIStatus(ready) {
    const statusElement = document.getElementById('ai-status');
    if (statusElement) {
        if (ready) {
            statusElement.innerHTML = '<span class="text-green-400 font-semibold">🤖 IA Avancée Activée</span>';
            statusElement.className = 'mt-4 px-4 py-2 bg-green-900/20 rounded-lg border border-green-400/30';
        } else {
            statusElement.innerHTML = '<span class="text-yellow-400 font-semibold">📊 Système Classique</span>';
            statusElement.className = 'mt-4 px-4 py-2 bg-yellow-900/20 rounded-lg border border-yellow-400/30';
        }
    }
}

// Message de bienvenue
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    // Transformé : welcome-message -> Tailwind
    welcomeDiv.className = 'fixed top-20 right-8 max-w-md bg-gradient-to-br from-douane-vert to-douane-or rounded-2xl shadow-2xl p-6 text-white z-50 transform translate-x-full transition-all duration-500';
    welcomeDiv.innerHTML = `
        <div class="space-y-4">
            <h3 class="text-xl font-bold text-white">🎯 Système de Classification Tarifaire CEDEAO</h3>
            <p class="text-white/90 text-sm">Système intelligent avec intégration tableau automatique</p>
            <div class="grid grid-cols-2 gap-2 text-xs">
                <span class="bg-white/20 px-2 py-1 rounded-full text-center">✅ Analyse sémantique avancée</span>
                <span class="bg-white/20 px-2 py-1 rounded-full text-center">✅ Stockage automatique</span>
                <span class="bg-white/20 px-2 py-1 rounded-full text-center">✅ Base de données intégrée</span>
                <span class="bg-white/20 px-2 py-1 rounded-full text-center">✅ Tableau interactif</span>
            </div>
        </div>
        <button onclick="this.parentElement.remove()" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-bold transition-colors duration-300">×</button>
    `;
    
    document.body.appendChild(welcomeDiv);
    
    // Animation d'entrée
    setTimeout(() => {
        welcomeDiv.classList.remove('translate-x-full');
        welcomeDiv.classList.add('translate-x-0');
    }, 100);
    
    // Auto-suppression après 10 secondes
    setTimeout(() => {
        if (welcomeDiv.parentElement) {
            welcomeDiv.classList.add('translate-x-full');
            setTimeout(() => welcomeDiv.remove(), 500);
        }
    }, 10000);
}

// Configuration des événements
function setupEventListeners() {
    const classifyBtn = document.getElementById('classify-btn');
    const productDescription = document.getElementById('product-description');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    if (classifyBtn && productDescription) {
        classifyBtn.addEventListener('click', handleClassification);
        
        // Classification avec Ctrl+Entrée
        productDescription.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                handleClassification();
            }
        });

        // Fonction pour quand on presse sur la touche entrer ca classifie le produit
        document.getElementById("product-description").addEventListener("keydown", function(event) {
    // Vérifie que la touche Entrée est pressée sans Shift (pour éviter les sauts de ligne)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Empêche la création d'une nouvelle ligne
      document.getElementById("classify-btn").click(); // Déclenche le bouton
    }
  });
        
        // Suggestions en temps réel (debounced)
        let suggestionTimeout;
        productDescription.addEventListener('input', function() {
            clearTimeout(suggestionTimeout);
            suggestionTimeout = setTimeout(() => {
                showRealTimeSuggestions(this.value);
            }, 500);
        });
    }
}

// Gestion de la classification principale
async function handleClassification() {
    const productDescription = document.getElementById('product-description');
    const loadingDiv = document.getElementById('loading');
    const resultsDiv = document.getElementById('results');
    
    const description = productDescription.value.trim();
    
    if (!description) {
        showErrorMessage('Description manquante', 'Veuillez saisir une description du produit.');
        return;
    }
    
    // Affichage du loading avec progression
    showLoadingWithProgress();
    resultsDiv.classList.add('hidden');
    
    try {
        let results;
        
        if (isAIReady) {
            // Classification avec IA avancée
            results = await classifyWithAI(description);
        } else {
            // Classification avec système de secours
            results = await classifyWithFallback(description);
        }
        
        // Génération du rapport détaillé
        const detailedReport = generateDetailedReport(results, description);
        
        // Affichage des résultats
        displayAdvancedResults(detailedReport);
        
        // Sauvegarde dans l'historique
        saveToHistory(description, results[0]);
        
        // Mise à jour des statistiques
        updateStatistics();
        
        loadingDiv.classList.add('hidden');
        resultsDiv.classList.remove('hidden');
        resultsDiv.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Erreur lors de la classification:', error);
        loadingDiv.classList.add('hidden');
        showErrorMessage('Erreur de classification', 'Une erreur est survenue lors de l\'analyse. Veuillez réessayer.');
    }
}

// Classification avec IA avancée
async function classifyWithAI(description) {
    // Simulation du délai de traitement IA
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return aiClassifier.classifyWithAI(description);
}

// Classification avec système de secours
async function classifyWithFallback(description) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Implémentation du système classique amélioré
    return classifyProductFallback(description);
}

// Système de classification de secours amélioré
function classifyProductFallback(description) {
    const results = [];
    const descriptionLower = description.toLowerCase();
    
    // Analyse de base avec les sections du TEC CEDEAO
    const words = descriptionLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    // Base de données simplifiée pour le fallback
    const simpleSections = {
        "Section I": {
            section: { number: "I", title: "Animaux vivants et produits du règne animal" },
            keywords: ["animal", "viande", "poisson", "lait", "œuf", "miel", "fromage", "bœuf", "porc"],
            confidence: 0
        },
        "Section II": {
            section: { number: "II", title: "Produits du règne végétal" },
            keywords: ["plante", "légume", "fruit", "céréale", "riz", "blé", "café", "thé"],
            confidence: 0
        },
        "Section IV": {
            section: { number: "IV", title: "Produits des industries alimentaires" },
            keywords: ["conserve", "sucre", "chocolat", "biscuit", "boisson", "alcool"],
            confidence: 0
        },
        "Section XVI": {
            section: { number: "XVI", title: "Machines et appareils électriques" },
            keywords: ["machine", "électrique", "ordinateur", "téléphone", "moteur"],
            confidence: 0
        },
        "Section XVII": {
            section: { number: "XVII", title: "Matériel de transport" },
            keywords: ["véhicule", "voiture", "camion", "bateau", "avion", "moto"],
            confidence: 0
        }
    };
    
    // Calcul des scores
    Object.keys(simpleSections).forEach(sectionKey => {
        let score = 0;
        const section = simpleSections[sectionKey];
        
        section.keywords.forEach(keyword => {
            words.forEach(word => {
                if (word.includes(keyword) || keyword.includes(word)) {
                    score += 10;
                }
            });
        });
        
        section.confidence = Math.min(score * 2, 100);
        section.validationStatus = "VALID";
        section.certaintyLevel = section.confidence > 70 ? "ÉLEVÉE" : section.confidence > 40 ? "MOYENNE" : "FAIBLE";
        section.recommendations = [];
        section.matchedTerms = [];
    });
    
    return Object.values(simpleSections)
        .filter(section => section.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 3);
}

// Affichage du loading avec progression
function showLoadingWithProgress() {
    const loadingDiv = document.getElementById('loading');
    loadingDiv.classList.remove('hidden');
    
    const progressSteps = [
        "Analyse sémantique...",
        "Reconnaissance des termes techniques...",
        "Application des règles contextuelles...",
        "Validation des résultats...",
        "Génération du rapport..."
    ];
    
    let currentStep = 0;
    const progressText = loadingDiv.querySelector('p');
    
    const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
            progressText.textContent = progressSteps[currentStep];
            currentStep++;
        } else {
            clearInterval(progressInterval);
        }
    }, 300);
    
    // Nettoyage automatique
    setTimeout(() => clearInterval(progressInterval), 2000);
}

// Affichage des résultats avancés avec intégration tableau
function displayAdvancedResults(report) {
    const resultsContainer = document.getElementById('classification-result');
    
    if (!report.results || report.results.length === 0) {
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
            <h4 class="text-2xl font-bold text-douane-vert mb-3">📊 Analyse complète - ${report.results.length} résultat(s)</h4>
            <div class="flex flex-wrap gap-4 text-sm">
                <span class="bg-white/80 px-3 py-1 rounded-full text-gray-700 border border-gray-300">🕒 ${new Date(report.analysisTimestamp).toLocaleTimeString()}</span>
                <span class="bg-douane-vert/20 px-3 py-1 rounded-full text-douane-vert border border-douane-vert/30">📈 Confiance globale: ${Math.round(report.confidence)}%</span>
                ${report.needsHumanValidation ? '<span class="bg-yellow-100 px-3 py-1 rounded-full text-yellow-800 border border-yellow-300">⚠️ Validation requise</span>' : ''}
            </div>
        </div>
    `;
    
    report.results.forEach((result, index) => {
        const isMainResult = index === 0;
        
        const itemClass = isMainResult 
            ? 'bg-gradient-to-r from-douane-vert/5 to-douane-or/5 border-2 border-douane-or rounded-2xl p-6 mb-6 shadow-lg relative'
            : 'bg-white/95 border border-gray-200 rounded-xl p-6 mb-4 shadow-md hover:shadow-lg transition-shadow duration-300';
        
        html += `
            <div class="${itemClass}" data-section="${result.section.number}">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex items-center gap-4">
                        <div class="bg-douane-vert text-white px-4 py-2 rounded-full font-bold text-lg">Section ${result.section.number}</div>
                        <div class="px-4 py-2 rounded-full text-sm font-semibold ${getCertaintyTailwindClass(result.certaintyLevel)}">
                            ${Math.round(result.confidence)}% - ${result.certaintyLevel}
                        </div>
                    </div>
                    ${isMainResult ? '<div class="bg-douane-or text-douane-vert px-4 py-2 rounded-full font-bold text-sm">RECOMMANDÉ</div>' : ''}
                </div>
                
                <h4 class="text-2xl font-bold text-douane-vert mb-6">${result.section.title}</h4>
                
                <div class="space-y-4">
                    <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
                        <strong class="text-douane-or font-semibold">📖 Description :</strong>
                        <p class="mt-2 text-gray-700 leading-relaxed">${result.section.description || 'Description non disponible'}</p>
                    </div>
                    
                    ${result.matchedTerms && result.matchedTerms.length > 0 ? `
                    <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
                        <strong class="text-douane-or font-semibold">🎯 Termes correspondants :</strong>
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${result.matchedTerms.map(term => 
                                `<span class="px-3 py-1 rounded-full text-sm font-medium ${getTermBadgeClass(term.type)}">${term.keyword}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${result.reasons && result.reasons.length > 0 ? `
                    <div class="bg-white/80 rounded-lg p-4 border border-gray-200">
                        <strong class="text-douane-or font-semibold">📝 Justifications :</strong>
                        <ul class="mt-2 space-y-2 text-gray-700">
                            ${result.reasons.map(reason => `<li class="flex items-start gap-2"><span class="text-douane-vert mt-1">•</span><span>${reason}</span></li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${result.warnings && result.warnings.length > 0 ? `
                    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <strong class="text-yellow-800 font-semibold">⚠️ Avertissements :</strong>
                        <ul class="mt-2 space-y-2 text-yellow-700">
                            ${result.warnings.map(warning => `<li class="flex items-start gap-2"><span class="text-yellow-600 mt-1">•</span><span>${warning}</span></li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${result.recommendations && result.recommendations.length > 0 ? `
                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <strong class="text-blue-800 font-semibold">💡 Recommandations :</strong>
                        <ul class="mt-2 space-y-2 text-blue-700">
                            ${result.recommendations.map(rec => `<li class="flex items-start gap-2"><span class="text-blue-600 mt-1">•</span><span>${rec}</span></li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                <div class="flex flex-wrap gap-3 mt-6 pt-4 border-t border-gray-200">
                    <button 
                        class="px-6 py-3 bg-douane-vert text-white rounded-xl hover:bg-douane-vert/90 cursor-pointer transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center gap-2"
                        onclick="selectAndStoreClassification('${result.section.number}', '${result.section.title}', ${result.confidence})"
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
    
    // Ajout des recommandations globales
    if (report.recommendations && report.recommendations.length > 0) {
        html += `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mt-6">
                <h5 class="text-xl font-bold text-blue-800 mb-4">🔍 Recommandations générales :</h5>
                <ul class="space-y-3 text-blue-700">
                    ${report.recommendations.map(rec => `<li class="flex items-start gap-3"><span class="text-blue-500 font-bold mt-1">→</span><span>${rec}</span></li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = html;
}

// NOUVELLE FONCTION : Sélection et stockage automatique
async function selectAndStoreClassification(sectionNumber, sectionTitle, confidence) {
    const description = document.getElementById('product-description').value;
    
    if (!description) {
        showErrorMessage('Erreur', 'Description du produit manquante');
        return;
    }
    
    // Préparer les informations du produit
    const productInfo = {
        description: description,
        origin: 'Non spécifié', // Peut être étendu avec un champ dédié
        value: 0, // Peut être étendu avec un champ dédié
        timestamp: new Date().toISOString()
    };
    
    // Préparer le résultat de classification
    const classificationResult = {
        section: {
            number: sectionNumber,
            title: sectionTitle
        },
        confidence: confidence,
        code: generateTariffCode(sectionNumber),
        timestamp: new Date().toISOString()
    };
    
    // Afficher le loading
    showSuccessMessage('Stockage en cours', 'Ajout du produit au tableau et à la base de données...');
    
    try {
        // 1. Ajouter au tableau intégré
        if (tableauFrame && tableauFrame.contentWindow && tableauFrame.contentWindow.addProductToTable) {
            tableauFrame.contentWindow.addProductToTable(productInfo, classificationResult);
            console.log('✅ Produit ajouté au tableau');
        } else {
            console.warn('⚠️ Impossible d\'ajouter au tableau - iframe non accessible');
        }
        
        // 2. Sauvegarder en base de données
        await saveProductToDatabase(productInfo, classificationResult);
        
        // 3. Sauvegarde locale
        saveToHistory(description, {
            section: { number: sectionNumber, title: sectionTitle },
            confidence: confidence
        });
        
        // 4. Notification de succès
        showSuccessMessage(
            'Classification stockée avec succès', 
            `Produit classifié en Section ${sectionNumber} et ajouté au tableau`
        );
        
        // 5. Mise à jour des statistiques
        updateStatistics();
        
        // 6. Optionnel : Réinitialiser le formulaire
        if (confirm('Voulez-vous réinitialiser le formulaire pour une nouvelle classification ?')) {
            document.getElementById('product-description').value = '';
            document.getElementById('results').classList.add('hidden');
        }
        
    } catch (error) {
        console.error('❌ Erreur lors du stockage:', error);
        showErrorMessage('Erreur de stockage', 'Impossible de stocker la classification: ' + error.message);
    }
}

// Fonction de sauvegarde en base de données
async function saveProductToDatabase(productInfo, classificationResult) {
    try {
        const productData = {
            origine_produit: productInfo.origin || 'Non spécifié',
            description_produit: productInfo.description,
            section_produit: classificationResult.section.number,
            code_tarifaire: classificationResult.code,
            taux_imposition: getTaxRate(classificationResult.section.number),
            valeur_declaree: productInfo.value || 0,
            poids_kg: 0, // Peut être étendu
            unite_mesure: 'unité',
            statut_validation: classificationResult.confidence > 80 ? 'valide' : 'en_attente',
            commentaires: `Classification automatique - Confiance: ${classificationResult.confidence}%`
        };
        
        const response = await fetch('../database/api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'save_classified_product',
                product: productData
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Produit sauvegardé en base avec ID:', result.product_id);
            return result.product_id;
        } else {
            throw new Error(result.message || 'Erreur lors de la sauvegarde');
        }
        
    } catch (error) {
        console.error('❌ Erreur sauvegarde base de données:', error);
        throw error;
    }
}

// Fonction pour générer un code tarifaire basique
function generateTariffCode(sectionNumber) {
    const sectionCodes = {
        'I': '0101', 'II': '0601', 'III': '1501', 'IV': '1601', 'V': '2501',
        'VI': '2801', 'VII': '3901', 'VIII': '4101', 'IX': '4401', 'X': '4701',
        'XI': '5001', 'XII': '6401', 'XIII': '6801', 'XIV': '7101', 'XV': '7201',
        'XVI': '8401', 'XVII': '8601', 'XVIII': '9001', 'XIX': '9301', 'XX': '9401',
        'XXI': '9701'
    };
    
    return (sectionCodes[sectionNumber] || '9999') + ".00.00.00";
}

// Fonction pour obtenir le taux d'imposition
function getTaxRate(sectionNumber) {
    const taxRates = {
        'I': 10.50, 'II': 8.75, 'III': 12.00, 'IV': 15.25, 'V': 5.50,
        'VI': 18.75, 'VII': 14.50, 'VIII': 16.25, 'IX': 11.75, 'X': 13.50,
        'XI': 17.25, 'XII': 19.50, 'XIII': 9.25, 'XIV': 25.00, 'XV': 12.75,
        'XVI': 22.50, 'XVII': 20.75, 'XVIII': 16.50, 'XIX': 35.00, 'XX': 15.75,
        'XXI': 30.00
    };
    
    return taxRates[sectionNumber] || 0;
}

// Utilitaires pour l'affichage
function getCertaintyTailwindClass(certaintyLevel) {
    switch(certaintyLevel) {
        case "TRÈS ÉLEVÉE": return "bg-green-100 text-green-800 border border-green-300";
        case "ÉLEVÉE": return "bg-green-100 text-green-800 border border-green-300";
        case "MOYENNE": return "bg-yellow-100 text-yellow-800 border border-yellow-300";
        case "FAIBLE": return "bg-red-100 text-red-800 border border-red-300";
        default: return "bg-gray-100 text-gray-800 border border-gray-300";
    }
}

function getTermBadgeClass(termType) {
    switch(termType) {
        case 'exact': return "bg-douane-vert text-white";
        case 'partial': return "bg-douane-or text-douane-vert";
        case 'contextual': return "bg-vert-ci text-white";
        default: return "bg-gray-200 text-gray-800";
    }
}

// Sélection d'une classification (fonction originale maintenue pour compatibilité)
function selectClassification(sectionNumber, sectionTitle) {
    // Rediriger vers la nouvelle fonction avec stockage
    selectAndStoreClassification(sectionNumber, sectionTitle, 75);
}

// Affichage des détails d'une section
function showSectionDetails(sectionNumber) {
    // À implémenter : modal avec détails complets de la section
    alert(`Détails de la Section ${sectionNumber} - Fonctionnalité à venir`);
}

// Système de feedback
function provideFeedback(sectionNumber, isCorrect) {
    if (isAIReady && aiClassifier) {
        const description = document.getElementById('product-description').value;
        aiClassifier.learnFromClassification(description, `Section ${sectionNumber}`, isCorrect ? 'correct' : 'incorrect');
    }
    
    showSuccessMessage(
        'Feedback enregistré', 
        `Merci pour votre retour sur la Section ${sectionNumber}`
    );
}

// Messages d'état
function showSuccessMessage(title, message) {
    showMessage(title, message, 'success');
}

function showErrorMessage(title, message) {
    showMessage(title, message, 'error');
}

function showMessage(title, message, type) {
    const messageDiv = document.createElement('div');
    const typeClasses = type === 'success' 
        ? 'bg-green-100 border-green-300 text-green-800'
        : 'bg-red-100 border-red-300 text-red-800';
    
    messageDiv.className = `fixed top-4 right-4 max-w-sm ${typeClasses} border rounded-xl p-4 shadow-lg z-50 transform translate-x-full transition-all duration-500`;
    messageDiv.innerHTML = `
        <div class="flex justify-between items-start gap-3">
            <div class="flex-1">
                <strong class="block font-semibold">${title}</strong>
                <p class="text-sm mt-1">${message}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-lg font-bold hover:opacity-70 transition-opacity">×</button>
        </div>
    `;
    
    document.body.appendChild(messageDiv);
    
    // Animation d'entrée
    setTimeout(() => {
        messageDiv.classList.remove('translate-x-full');
        messageDiv.classList.add('translate-x-0');
    }, 100);
    
    // Auto-suppression
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.classList.add('translate-x-full');
            setTimeout(() => messageDiv.remove(), 500);
        }
    }, 5000);
}

// Gestion de l'historique
function saveToHistory(description, result) {
    classificationHistory.unshift({
        timestamp: new Date().toISOString(),
        description: description,
        result: result
    });
    
    // Limiter l'historique à 50 entrées
    if (classificationHistory.length > 50) {
        classificationHistory = classificationHistory.slice(0, 50);
    }
    
    localStorage.setItem('classification_history', JSON.stringify(classificationHistory));
}

function loadClassificationHistory() {
    const stored = localStorage.getItem('classification_history');
    if (stored) {
        classificationHistory = JSON.parse(stored);
    }
}

// Statistiques
function loadStatistics() {
    const stats = {
        totalClassifications: classificationHistory.length,
        averageConfidence: calculateAverageConfidence(),
        mostUsedSections: getMostUsedSections()
    };
    
    displayStatistics(stats);
}

function calculateAverageConfidence() {
    if (classificationHistory.length === 0) return 0;
    const total = classificationHistory.reduce((sum, item) => sum + (item.result?.confidence || 0), 0);
    return Math.round(total / classificationHistory.length);
}

function getMostUsedSections() {
    const sectionCounts = {};
    classificationHistory.forEach(item => {
        const section = item.result?.section?.number;
        if (section) {
            sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        }
    });
    
    return Object.entries(sectionCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([section, count]) => ({ section, count }));
}

function displayStatistics(stats) {
    const statsContainer = document.getElementById('statistics');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="bg-gradient-to-r from-gray-800/90 to-douane-vert/90 p-6 rounded-2xl shadow-xl mb-6 text-center">
                <h2 class="text-2xl font-bold text-white mb-6">📊 Statistiques du système</h2>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <!-- Stats statiques officielles -->
                    <div class="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-douane-or/30 hover:bg-white/30 transition-all duration-300">
                        <span class="block text-2xl font-bold text-white mb-2">21</span>
                        <span class="text-sm text-white/80">Sections</span>
                    </div>
                    <div class="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-douane-or/30 hover:bg-white/30 transition-all duration-300">
                        <span class="block text-2xl font-bold text-white mb-2">97</span>
                        <span class="text-sm text-white/80">Chapitres</span>
                    </div>
                    <div class="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-douane-or/30 hover:bg-white/30 transition-all duration-300">
                        <span class="block text-2xl font-bold text-white mb-2">5000+</span>
                        <span class="text-sm text-white/80">Codes tarifaires</span>
                    </div>
                    <div class="bg-white/20 backdrop-blur-sm p-6 rounded-xl border border-douane-or/30 hover:bg-white/30 transition-all duration-300">
                        <span class="block text-2xl font-bold text-white mb-2">2022</span>
                        <span class="text-sm text-white/80">Version SH</span>
                    </div>
                </div>
                
                <!-- Stats dynamiques en dessous -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20">
                    <div class="bg-douane-vert/30 p-4 rounded-xl border border-douane-or/20">
                        <span class="block text-xl font-bold text-douane-or mb-1">${stats.totalClassifications || 0}</span>
                        <span class="text-xs text-white/90">Classifications effectuées</span>
                    </div>
                    <div class="bg-douane-vert/30 p-4 rounded-xl border border-douane-or/20">
                        <span class="block text-xl font-bold text-douane-or mb-1">${stats.averageConfidence || 0}%</span>
                        <span class="text-xs text-white/90">Confiance moyenne</span>
                    </div>
                    <div class="bg-douane-vert/30 p-4 rounded-xl border border-douane-or/20">
                        <span class="block text-xl font-bold text-douane-or mb-1">${stats.mostUsedSections.length || 0}</span>
                        <span class="text-xs text-white/90">Sections utilisées</span>
                    </div>
                </div>
            </div>
        `;
    }
}

function updateStatistics() {
    loadStatistics();
}

// Génération de rapport détaillé
function generateDetailedReport(results, description) {
    return {
        inputDescription: description,
        analysisTimestamp: new Date().toISOString(),
        results: results,
        confidence: results.length > 0 ? results[0].confidence : 0,
        needsHumanValidation: results.length === 0 || (results[0] && results[0].confidence < 70),
        recommendations: generateRecommendations(results)
    };
}

function generateRecommendations(results) {
    const recommendations = [];
    
    if (results.length === 0) {
        recommendations.push("Description trop vague - Ajouter plus de détails spécifiques");
    } else if (results[0] && results[0].confidence < 50) {
        recommendations.push("Confiance faible - Consulter un expert en classification");
    } else if (results.length > 1 && results[1] && results[1].confidence > 60) {
        recommendations.push("Plusieurs classifications possibles - Examiner les alternatives");
    }
    
    return recommendations;
}

// Suggestions en temps réel
function showRealTimeSuggestions(input) {
    if (input.length < 3) return;
    
    const suggestionsContainer = document.getElementById('real-time-suggestions');
    if (!suggestionsContainer) return;
    
    // Suggestions basiques
    const suggestions = generateQuickSuggestions(input);
    
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                <h6 class="font-semibold text-douane-vert mb-3">💡 Suggestions rapides :</h6>
                <div class="flex flex-wrap gap-2">
                    ${suggestions.map(suggestion => 
                        `<span class="px-3 py-2 bg-douane-or hover:bg-douane-or/90 text-douane-vert rounded-full cursor-pointer transition-all duration-300 text-sm font-medium shadow-sm hover:shadow-md transform hover:-translate-y-0.5" onclick="applySuggestion('${suggestion}')">${suggestion}</span>`
                    ).join('')}
                </div>
            </div>
        `;
        suggestionsContainer.classList.remove('hidden');
    } else {
        suggestionsContainer.classList.add('hidden');
    }
}

// Génération de suggestions rapides
function generateQuickSuggestions(input) {
    const suggestions = [];
    const inputLower = input.toLowerCase();
    
    // Suggestions basées sur des mots-clés communs
    const keywordSuggestions = {
        "animal": ["animal vivant", "viande fraîche", "produit laitier"],
        "plante": ["plante vivante", "légume frais", "fruit tropical"],
        "machine": ["machine industrielle", "appareil électrique", "équipement technique"],
        "voiture": ["véhicule automobile", "transport terrestre", "pièce automobile"]
    };
    
    Object.keys(keywordSuggestions).forEach(keyword => {
        if (inputLower.includes(keyword)) {
            suggestions.push(...keywordSuggestions[keyword]);
        }
    });
    
    return suggestions.slice(0, 5);
}

// Application d'une suggestion
function applySuggestion(suggestion) {
    const productDescription = document.getElementById('product-description');
    productDescription.value = suggestion;
    document.getElementById('real-time-suggestions').classList.add('hidden');
}

// Chargement des sections dans le dropdown
function loadSections() {
    const sectionsContainer = document.getElementById('sections-list');
    if (!sectionsContainer) return;
    
    // Vider le conteneur
    sectionsContainer.innerHTML = '';
    
    // Utiliser les données de l'IA si disponible, sinon fallback
    const sections = isAIReady && aiClassifier ? 
        aiClassifier.sectionsData : 
        getBasicSectionsData();
    
    Object.values(sections).forEach(section => {
        const sectionItem = document.createElement('div');
        sectionItem.className = 'flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-200';
        sectionItem.setAttribute('data-section', section.number);
        sectionItem.innerHTML = `
            <div class="bg-douane-vert text-white px-3 py-1 rounded-full text-sm font-bold min-w-fit">${section.number}</div>
            <div class="flex-1 min-w-0">
                <div class="font-semibold text-douane-vert text-sm truncate">${section.title}</div>
                <div class="text-xs text-gray-600 mt-1 line-clamp-2">${section.description}</div>
                <div class="text-xs text-gray-500 mt-1">Chapitres: ${section.chapters.join(', ')}</div>
            </div>
        `;
        
        sectionItem.addEventListener('click', () => {
            selectSection(section);
            closeDropdown();
        });
        
        sectionsContainer.appendChild(sectionItem);
    });
}

// Contrôles du dropdown
function setupDropdownControls() {
    const dropdownBtn = document.getElementById('sections-dropdown-btn');
    const dropdownContent = document.getElementById('sections-dropdown-content');
    const sectionsSearch = document.getElementById('sections-search');
    
    if (!dropdownBtn || !dropdownContent) return;
    
    // Toggle dropdown
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDropdown();
    });
    
    // Fermer dropdown en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!dropdownContent.contains(e.target) && !dropdownBtn.contains(e.target)) {
            closeDropdown();
        }
    });
    
    // Recherche dans les sections
    if (sectionsSearch) {
        sectionsSearch.addEventListener('input', (e) => {
            filterSections(e.target.value);
        });
        
        sectionsSearch.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

function toggleDropdown() {
    const dropdownBtn = document.getElementById('sections-dropdown-btn');
    const dropdownContent = document.getElementById('sections-dropdown-content');
    
    if (dropdownContent.classList.contains('show')) {
        closeDropdown();
    } else {
        openDropdown();
    }
}

function openDropdown() {
    const dropdownBtn = document.getElementById('sections-dropdown-btn');
    const dropdownContent = document.getElementById('sections-dropdown-content');
    
    dropdownBtn.classList.add('active');
    dropdownContent.classList.remove('opacity-0', 'invisible', 'translate-y-2');
    dropdownContent.classList.add('opacity-100', 'visible', 'translate-y-0');
}

function closeDropdown() {
    const dropdownBtn = document.getElementById('sections-dropdown-btn');
    const dropdownContent = document.getElementById('sections-dropdown-content');
    
    dropdownBtn.classList.remove('active');
    dropdownContent.classList.remove('opacity-100', 'visible', 'translate-y-0');
    dropdownContent.classList.add('opacity-0', 'invisible', 'translate-y-2');
}

function filterSections(searchText) {
    const sectionItems = document.querySelectorAll('[data-section]');
    const searchLower = searchText.toLowerCase();
    
    sectionItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(searchLower)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

function selectSection(section) {
    // Pré-remplir le champ de description avec des exemples de la section
    const descriptionField = document.getElementById('product-description');
    if (descriptionField && !descriptionField.value.trim()) {
        const examples = getSectionExamples(section.number);
        if (examples.length > 0) {
            descriptionField.value = examples[0];
        }
    }
    
    // Afficher les détails de la section
    showSectionDetails(section.number);
    
    // Message de succès
    showSuccessMessage('Section sélectionnée', `Section ${section.number}: ${section.title}`);
}

function getSectionExamples(sectionNumber) {
    const examples = {
        'I': ['viande de bœuf fraîche', 'poisson saumon', 'lait frais'],
        'II': ['riz blanc long grain', 'tomates fraîches', 'bananes'],
        'IV': ['pain de mie', 'confiture de fraises', 'chocolat au lait'],
        'VI': ['médicament antibiotique', 'parfum', 'peinture acrylique'],
        'VII': ['plastique PVC', 'caoutchouc naturel'],
        'VIII': ['sac en cuir', 'chaussures en cuir'],
        'IX': ['planches en bois', 'meubles en bois'],
        'X': ['papier A4', 'carton ondulé'],
        'XI': ['chemise en coton', 'tissu en soie'],
        'XII': ['chaussures de sport', 'bottes en cuir'],
        'XIII': ['vase en céramique', 'carrelage'],
        'XIV': ['bijoux en or', 'perles'],
        'XV': ['outils en métal', 'clous'],
        'XVI': ['smartphone', 'ordinateur portable'],
        'XVII': ['voiture d\'occasion', 'camion de transport'],
        'XVIII': ['montre', 'instruments de musique'],
        'XX': ['jouets en plastique', 'meubles'],
        'XXI': ['œuvres d\'art', 'antiquités']
    };
    
    return examples[sectionNumber] || [];
}

// Données de base pour le fallback
function getBasicSectionsData() {
    return {
        "Section I": {
            number: "I",
            title: "Animaux vivants et produits du règne animal",
            chapters: ["01", "02", "03", "04", "05"],
            description: "Animaux vivants, viandes, poissons, produits laitiers, œufs, miel"
        },
        "Section II": {
            number: "II",
            title: "Produits du règne végétal", 
            chapters: ["06", "07", "08", "09", "10", "11", "12", "13", "14"],
            description: "Plantes, légumes, fruits, céréales, épices, graines"
        },
        "Section IV": {
            number: "IV",
            title: "Produits des industries alimentaires",
            chapters: ["16", "17", "18", "19", "20", "21", "22", "23", "24"],
            description: "Préparations alimentaires, boissons, tabac"
        }
    };
}

// Export des fonctions globales pour compatibilité
window.selectClassification = selectClassification;
window.selectAndStoreClassification = selectAndStoreClassification;
window.showSectionDetails = showSectionDetails;
window.provideFeedback = provideFeedback;
window.applySuggestion = applySuggestion;