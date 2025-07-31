// Système de Classification Tarifaire CEDEAO - Version Avancée avec IA
// Intégration du moteur d'IA pour une classification de précision maximale

// Initialisation du classificateur IA
let aiClassifier;
let isAIReady = false;
let classificationHistory = [];

// Initialisation principale
document.addEventListener('DOMContentLoaded', function() {
    // Check for test parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const testDescription = urlParams.get('test');
    
    if (testDescription) {
        setTimeout(() => {
            document.getElementById('productDescription').value = testDescription;
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
        showWelcomeMessage();
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
        showErrorMessage('Erreur système', 'Impossible d\'initialiser le système de classification');
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
        statusElement.innerHTML = ready ? 
            '<span class="status-ready">🤖 IA Avancée Activée</span>' : 
            '<span class="status-fallback">📊 Système Classique</span>';
        statusElement.className = ready ? 'ai-status ready' : 'ai-status fallback';
    }
}

// Message de bienvenue
function showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'welcome-message';
    welcomeDiv.innerHTML = `
        <div class="welcome-content">
            <h3>🎯 Système de Classification Tarifaire CEDEAO</h3>
            <p>Système intelligent basé sur le TEC CEDEAO SH 2022</p>
            <div class="features">
                <span class="feature">✅ Analyse sémantique avancée</span>
                <span class="feature">✅ Reconnaissance des codes tarifaires</span>
                <span class="feature">✅ Validation multi-niveaux</span>
                <span class="feature">✅ Apprentissage automatique</span>
            </div>
        </div>
        <button onclick="this.parentElement.remove()" class="close-welcome">×</button>
    `;
    
    document.querySelector('.container').insertBefore(welcomeDiv, document.querySelector('main'));
    
    // Auto-suppression après 10 secondes
    setTimeout(() => {
        if (welcomeDiv.parentElement) {
            welcomeDiv.remove();
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

// Affichage des résultats avancés
function displayAdvancedResults(report) {
    const resultsContainer = document.getElementById('classification-result');
    
    if (!report.results || report.results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <h4>❌ Aucune classification trouvée</h4>
                <p>Aucune correspondance satisfaisante n'a été trouvée.</p>
                <div class="suggestions">
                    <h5>💡 Suggestions d'amélioration :</h5>
                    <ul>
                        <li>Utilisez des termes plus spécifiques</li>
                        <li>Ajoutez des détails sur la matière ou l'usage</li>
                        <li>Précisez l'état du produit (brut, transformé, etc.)</li>
                    </ul>
                </div>
            </div>
        `;
        return;
    }
    
    let html = `
        <div class="results-header">
            <h4>📊 Analyse complète - ${report.results.length} résultat(s)</h4>
            <div class="analysis-info">
                <span class="info-item">🕒 ${new Date(report.analysisTimestamp).toLocaleTimeString()}</span>
                <span class="info-item">📈 Confiance globale: ${Math.round(report.confidence)}%</span>
                ${report.needsHumanValidation ? '<span class="info-item warning">⚠️ Validation requise</span>' : ''}
            </div>
        </div>
    `;
    
    report.results.forEach((result, index) => {
        const isMainResult = index === 0;
        
        html += `
            <div class="classification-item ${isMainResult ? 'main-result' : 'alternative-result'}" data-section="${result.section.number}">
                <div class="result-header">
                    <div class="section-info">
                        <div class="section-code">Section ${result.section.number}</div>
                        <div class="confidence-badge confidence-${getCertaintyClass(result.certaintyLevel)}">
                            ${Math.round(result.confidence)}% - ${result.certaintyLevel}
                        </div>
                    </div>
                    ${isMainResult ? '<div class="main-badge">RECOMMANDÉ</div>' : ''}
                </div>
                
                <h4>${result.section.title}</h4>
                
                <div class="result-details">
                    <div class="detail-section">
                        <strong>📖 Description :</strong>
                        <p>${result.section.description || 'Description non disponible'}</p>
                    </div>
                    
                    ${result.matchedTerms && result.matchedTerms.length > 0 ? `
                    <div class="detail-section">
                        <strong>🎯 Termes correspondants :</strong>
                        <div class="matched-terms">
                            ${result.matchedTerms.map(term => 
                                `<span class="term-badge term-${term.type}">${term.keyword}</span>`
                            ).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${result.reasons && result.reasons.length > 0 ? `
                    <div class="detail-section">
                        <strong>📝 Justifications :</strong>
                        <ul class="reasons-list">
                            ${result.reasons.map(reason => `<li>${reason}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${result.warnings && result.warnings.length > 0 ? `
                    <div class="detail-section warnings">
                        <strong>⚠️ Avertissements :</strong>
                        <ul class="warnings-list">
                            ${result.warnings.map(warning => `<li>${warning}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                    
                    ${result.recommendations && result.recommendations.length > 0 ? `
                    <div class="detail-section recommendations">
                        <strong>💡 Recommandations :</strong>
                        <ul class="recommendations-list">
                            ${result.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}
                </div>
                
                <div class="result-actions">
                    <button class="action-btn select-btn" onclick="selectClassification('${result.section.number}', '${result.section.title}')">
                        ✅ Sélectionner cette classification
                    </button>
                    <button class="action-btn info-btn" onclick="showSectionDetails('${result.section.number}')">
                        ℹ️ Plus d'infos
                    </button>
                    <button class="action-btn feedback-btn" onclick="provideFeedback('${result.section.number}', true)">
                        👍 Correct
                    </button>
                    <button class="action-btn feedback-btn" onclick="provideFeedback('${result.section.number}', false)">
                        👎 Incorrect
                    </button>
                </div>
            </div>
        `;
    });
    
    // Ajout des recommandations globales
    if (report.recommendations && report.recommendations.length > 0) {
        html += `
            <div class="global-recommendations">
                <h5>🔍 Recommandations générales :</h5>
                <ul>
                    ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    resultsContainer.innerHTML = html;
}

// Utilitaires pour l'affichage
function getCertaintyClass(certaintyLevel) {
    switch(certaintyLevel) {
        case "TRÈS ÉLEVÉE": return "very-high";
        case "ÉLEVÉE": return "high";
        case "MOYENNE": return "medium";
        case "FAIBLE": return "low";
        default: return "very-low";
    }
}

// Sélection d'une classification
function selectClassification(sectionNumber, sectionTitle) {
    showSuccessMessage(
        'Classification sélectionnée', 
        `Section ${sectionNumber}: ${sectionTitle}`
    );
    
    // Sauvegarde de la sélection
    const selection = {
        timestamp: new Date().toISOString(),
        section: sectionNumber,
        title: sectionTitle,
        description: document.getElementById('product-description').value
    };
    
    saveSelection(selection);
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

// Suggestions en temps réel
function showRealTimeSuggestions(input) {
    if (input.length < 3) return;
    
    const suggestionsContainer = document.getElementById('real-time-suggestions');
    if (!suggestionsContainer) return;
    
    // Suggestions basiques
    const suggestions = generateQuickSuggestions(input);
    
    if (suggestions.length > 0) {
        suggestionsContainer.innerHTML = `
            <div class="suggestions-content">
                <h6>💡 Suggestions rapides :</h6>
                ${suggestions.map(suggestion => 
                    `<span class="suggestion-tag" onclick="applySuggestion('${suggestion}')">${suggestion}</span>`
                ).join('')}
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

// Messages d'état
function showSuccessMessage(title, message) {
    showMessage(title, message, 'success');
}

function showErrorMessage(title, message) {
    showMessage(title, message, 'error');
}

function showMessage(title, message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.innerHTML = `
        <div class="message-content">
            <strong>${title}</strong>
            <p>${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="close-message">×</button>
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
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

function saveSelection(selection) {
    let selections = JSON.parse(localStorage.getItem('user_selections') || '[]');
    selections.unshift(selection);
    if (selections.length > 100) {
        selections = selections.slice(0, 100);
    }
    localStorage.setItem('user_selections', JSON.stringify(selections));
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
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${stats.totalClassifications}</div>
                    <div class="stat-label">Classifications</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.averageConfidence}%</div>
                    <div class="stat-label">Confiance moyenne</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.mostUsedSections.length}</div>
                    <div class="stat-label">Sections actives</div>
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
        sectionItem.className = 'section-dropdown-item';
        sectionItem.setAttribute('data-section', section.number);
        sectionItem.innerHTML = `
            <div class="section-number">${section.number}</div>
            <div class="section-info">
                <div class="section-title">${section.title}</div>
                <div class="section-description">${section.description}</div>
                <div class="section-chapters">Chapitres: ${section.chapters.join(', ')}</div>
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
    dropdownContent.classList.add('show');
}

function closeDropdown() {
    const dropdownBtn = document.getElementById('sections-dropdown-btn');
    const dropdownContent = document.getElementById('sections-dropdown-content');
    
    dropdownBtn.classList.remove('active');
    dropdownContent.classList.remove('show');
}

function filterSections(searchText) {
    const sectionItems = document.querySelectorAll('.section-dropdown-item');
    const searchLower = searchText.toLowerCase();
    
    sectionItems.forEach(item => {
        const title = item.querySelector('.section-title').textContent.toLowerCase();
        const description = item.querySelector('.section-description').textContent.toLowerCase();
        const chapters = item.querySelector('.section-chapters').textContent.toLowerCase();
        
        if (title.includes(searchLower) || 
            description.includes(searchLower) || 
            chapters.includes(searchLower)) {
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
window.showSectionDetails = showSectionDetails;
window.provideFeedback = provideFeedback;
window.applySuggestion = applySuggestion;
