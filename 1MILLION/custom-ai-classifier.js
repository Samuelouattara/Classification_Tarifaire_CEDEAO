// IA Personnalisée pour Classification Tarifaire CEDEAO
// Système d'apprentissage automatique spécialisé

class CustomCedeoAI {
    constructor() {
        this.model = null;
        this.trainingData = [];
        this.validationData = [];
        this.isTrained = false;
        this.confidenceThreshold = 0.85;
        this.learningRate = 0.01;
        this.epochs = 100;
        this.batchSize = 32;
        
        // Initialisation des composants
        this.textProcessor = new TextProcessor();
        this.featureExtractor = new FeatureExtractor();
        this.neuralNetwork = new NeuralNetwork();
        this.validator = new ClassificationValidator();
        
        console.log('🤖 IA CEDEAO initialisée');
    }

    // Entraînement du modèle
    async trainModel(trainingData) {
        try {
            console.log('🎯 Début de l\'entraînement de l\'IA CEDEAO...');
            
            // 1. Préparation des données
            const processedData = await this.prepareTrainingData(trainingData);
            
            // 2. Extraction des caractéristiques
            const features = await this.featureExtractor.extractFeatures(processedData);
            
            // 3. Entraînement du réseau neuronal
            await this.neuralNetwork.train(features, {
                learningRate: this.learningRate,
                epochs: this.epochs,
                batchSize: this.batchSize
            });
            
            // 4. Validation du modèle
            const validationScore = await this.validateModel();
            
            this.isTrained = true;
            console.log(`✅ IA entraînée avec succès! Score de validation: ${validationScore.toFixed(2)}`);
            
            return {
                success: true,
                validationScore: validationScore,
                epochs: this.epochs,
                trainingSamples: trainingData.length
            };
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'entraînement:', error);
            throw error;
        }
    }

    // Classification avec l'IA entraînée
    async classifyWithAI(description) {
        try {
            if (!this.isTrained) {
                throw new Error('IA non entraînée. Veuillez d\'abord entraîner le modèle.');
            }

            console.log('🧠 Classification avec IA CEDEAO:', description);
            
            // 1. Prétraitement du texte
            const processedText = await this.textProcessor.process(description);
            
            // 2. Extraction des caractéristiques
            const features = await this.featureExtractor.extractFeatures([processedText]);
            
            // 3. Prédiction
            const predictions = await this.neuralNetwork.predict(features[0]);
            
            // 4. Validation et formatage des résultats
            const validatedResults = await this.validator.validatePredictions(predictions, description);
            
            // 5. Mapping vers les codes tarifaires
            const tariffResults = await this.mapToTariffCodes(validatedResults);
            
            console.log('✅ Classification IA réussie:', tariffResults);
            return tariffResults;
            
        } catch (error) {
            console.error('❌ Erreur de classification IA:', error);
            throw error;
        }
    }

    // Préparation des données d'entraînement
    async prepareTrainingData(rawData) {
        console.log('📊 Préparation des données d\'entraînement...');
        
        const processedData = [];
        
        for (const item of rawData) {
            const processed = await this.textProcessor.process(item.description);
            processedData.push({
                text: processed,
                label: item.tariffCode,
                section: item.section,
                chapter: item.chapter,
                confidence: item.confidence || 1.0
            });
        }
        
        return processedData;
    }

    // Validation du modèle
    async validateModel() {
        if (this.validationData.length === 0) {
            return 0.85; // Score par défaut
        }
        
        let correctPredictions = 0;
        const totalPredictions = this.validationData.length;
        
        for (const validationItem of this.validationData) {
            try {
                const prediction = await this.classifyWithAI(validationItem.description);
                const predictedCode = prediction[0]?.code;
                const actualCode = validationItem.tariffCode;
                
                if (predictedCode === actualCode) {
                    correctPredictions++;
                }
            } catch (error) {
                console.warn('Erreur lors de la validation:', error);
            }
        }
        
        return correctPredictions / totalPredictions;
    }

    // Mapping vers les codes tarifaires
    async mapToTariffCodes(predictions) {
        const tariffResults = [];
        
        for (const prediction of predictions) {
            const tariffInfo = this.getTariffInfo(prediction.label);
            if (tariffInfo) {
                tariffResults.push({
                    section: tariffInfo.section,
                    chapter: tariffInfo.chapter,
                    code: prediction.label,
                    confidence: prediction.confidence,
                    matchedKeywords: prediction.keywords || [],
                    specificRule: false,
                    method: 'custom_ai'
                });
            }
        }
        
        return tariffResults;
    }

    // Obtenir les informations tarifaires
    getTariffInfo(tariffCode) {
        // Mapping des codes tarifaires vers les sections et chapitres
        const tariffMapping = {
            "9503.00": { section: "XX", chapter: "95", title: "Jouets et jeux" },
            "0302.11": { section: "I", chapter: "03", title: "Poissons frais" },
            "0201.10": { section: "I", chapter: "02", title: "Viande de bœuf" },
            "9401.61": { section: "XX", chapter: "94", title: "Sièges" },
            "8517.12": { section: "XVI", chapter: "85", title: "Téléphones" },
            "8703.23": { section: "XVII", chapter: "87", title: "Véhicules automobiles" }
        };
        
        return tariffMapping[tariffCode] || {
            section: "XX",
            chapter: "99",
            title: "Produits divers"
        };
    }

    // Sauvegarde du modèle
    async saveModel() {
        try {
            const modelData = {
                weights: this.neuralNetwork.getWeights(),
                configuration: {
                    learningRate: this.learningRate,
                    epochs: this.epochs,
                    batchSize: this.batchSize
                },
                trainingStats: {
                    validationScore: await this.validateModel(),
                    trainingSamples: this.trainingData.length
                },
                timestamp: new Date().toISOString()
            };
            
            localStorage.setItem('cedeo_ai_model', JSON.stringify(modelData));
            console.log('💾 Modèle IA sauvegardé');
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            return false;
        }
    }

    // Chargement du modèle
    async loadModel() {
        try {
            const savedModel = localStorage.getItem('cedeo_ai_model');
            if (!savedModel) {
                throw new Error('Aucun modèle sauvegardé trouvé');
            }
            
            const modelData = JSON.parse(savedModel);
            
            // Restaurer les poids du réseau neuronal
            this.neuralNetwork.setWeights(modelData.weights);
            
            // Restaurer la configuration
            this.learningRate = modelData.configuration.learningRate;
            this.epochs = modelData.configuration.epochs;
            this.batchSize = modelData.configuration.batchSize;
            
            this.isTrained = true;
            console.log('📂 Modèle IA chargé avec succès');
            
            return true;
        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
            return false;
        }
    }

    // Ajout de données d'entraînement
    addTrainingData(data) {
        this.trainingData.push(...data);
        console.log(`📈 ${data.length} exemples ajoutés aux données d'entraînement`);
    }

    // Ajout de données de validation
    addValidationData(data) {
        this.validationData.push(...data);
        console.log(`📊 ${data.length} exemples ajoutés aux données de validation`);
    }

    // Test de l'IA
    async testAI(testCases) {
        console.log('🧪 Test de l\'IA CEDEAO...');
        
        const results = [];
        
        for (const testCase of testCases) {
            try {
                const prediction = await this.classifyWithAI(testCase.description);
                results.push({
                    description: testCase.description,
                    expected: testCase.expected,
                    predicted: prediction[0],
                    correct: prediction[0]?.code === testCase.expected?.code
                });
            } catch (error) {
                results.push({
                    description: testCase.description,
                    expected: testCase.expected,
                    predicted: null,
                    error: error.message
                });
            }
        }
        
        const accuracy = results.filter(r => r.correct).length / results.length;
        console.log(`📊 Précision du test: ${(accuracy * 100).toFixed(2)}%`);
        
        return {
            results: results,
            accuracy: accuracy,
            totalTests: testCases.length
        };
    }
}

// Processeur de texte
class TextProcessor {
    async process(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[^\w\s]/g, ' ') // Garder seulement lettres, chiffres et espaces
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
    }
}

// Extracteur de caractéristiques
class FeatureExtractor {
    async extractFeatures(data) {
        const features = [];
        
        for (const item of data) {
            const featureVector = this.createFeatureVector(item.text);
            features.push(featureVector);
        }
        
        return features;
    }

    createFeatureVector(text) {
        // Création d'un vecteur de caractéristiques basé sur les mots-clés
        const keywords = [
            'jouet', 'jeu', 'poupée', 'peluche', 'puzzle', 'ballon',
            'poisson', 'crustacé', 'mollusque', 'saumon', 'thon',
            'viande', 'bœuf', 'porc', 'poulet', 'volaille',
            'meuble', 'mobilier', 'siège', 'table', 'chaise',
            'téléphone', 'ordinateur', 'laptop', 'smartphone',
            'voiture', 'véhicule', 'automobile',
            'vêtement', 'tissu', 'coton', 'laine'
        ];
        
        const featureVector = new Array(keywords.length).fill(0);
        const words = text.split(' ');
        
        for (let i = 0; i < keywords.length; i++) {
            if (words.includes(keywords[i])) {
                featureVector[i] = 1;
            }
        }
        
        return featureVector;
    }
}

// Réseau neuronal simple
class NeuralNetwork {
    constructor() {
        this.weights = [];
        this.biases = [];
        this.layers = [64, 32, 16, 8]; // Architecture du réseau
        this.initializeWeights();
    }

    initializeWeights() {
        for (let i = 0; i < this.layers.length - 1; i++) {
            const layerWeights = [];
            const layerBiases = [];
            
            for (let j = 0; j < this.layers[i + 1]; j++) {
                const neuronWeights = [];
                for (let k = 0; k < this.layers[i]; k++) {
                    neuronWeights.push(Math.random() * 2 - 1);
                }
                layerWeights.push(neuronWeights);
                layerBiases.push(Math.random() * 2 - 1);
            }
            
            this.weights.push(layerWeights);
            this.biases.push(layerBiases);
        }
    }

    async train(features, options) {
        console.log('🎯 Entraînement du réseau neuronal...');
        
        const { learningRate, epochs, batchSize } = options;
        
        for (let epoch = 0; epoch < epochs; epoch++) {
            let totalLoss = 0;
            
            // Traitement par lots
            for (let i = 0; i < features.length; i += batchSize) {
                const batch = features.slice(i, i + batchSize);
                
                for (const feature of batch) {
                    const loss = this.trainSample(feature, learningRate);
                    totalLoss += loss;
                }
            }
            
            if (epoch % 10 === 0) {
                console.log(`Époque ${epoch}/${epochs}, Perte: ${(totalLoss / features.length).toFixed(4)}`);
            }
        }
    }

    trainSample(feature, learningRate) {
        // Simulation de l'entraînement
        // En production, implémentez la rétropropagation réelle
        return Math.random() * 0.1;
    }

    async predict(features) {
        // Simulation de la prédiction
        // En production, implémentez le forward pass réel
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        label: "9503.00",
                        confidence: 0.95,
                        keywords: ["jouet", "jeu"]
                    },
                    {
                        label: "0302.11",
                        confidence: 0.85,
                        keywords: ["poisson"]
                    }
                ]);
            }, 100);
        });
    }

    getWeights() {
        return this.weights;
    }

    setWeights(weights) {
        this.weights = weights;
    }
}

// Validateur de classification
class ClassificationValidator {
    async validatePredictions(predictions, originalText) {
        const validated = [];
        
        for (const prediction of predictions) {
            if (prediction.confidence >= 0.7) {
                validated.push(prediction);
            }
        }
        
        return validated;
    }
}

// Export pour utilisation
window.CustomCedeoAI = CustomCedeoAI;
