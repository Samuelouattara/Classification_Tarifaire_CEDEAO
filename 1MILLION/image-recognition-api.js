// API de Reconnaissance d'Images pour Classification Tarifaire CEDEAO
// Intégration avec des services de vision par ordinateur

class ImageRecognitionAPI {
    constructor() {
        this.apiKey = null; // À configurer avec votre clé API
        this.services = {
            google: new GoogleVisionAPI(),
            azure: new AzureComputerVisionAPI(),
            aws: new AWSRekognitionAPI(),
            custom: new CustomVisionAPI()
        };
        this.currentService = 'google'; // Service par défaut
        this.confidenceThreshold = 0.8;
        this.tariffMapper = new TariffImageMapper();
    }

    // Configuration de l'API
    configure(service, apiKey) {
        this.currentService = service;
        this.apiKey = apiKey;
        console.log(`🔧 API configurée: ${service}`);
    }

    // Classification d'image principale
    async classifyImageFromFile(file) {
        try {
            console.log('📸 Début de classification d\'image:', file.name);
            
            // 1. Validation du fichier
            if (!this.validateImageFile(file)) {
                throw new Error('Format d\'image non supporté');
            }

            // 2. Préparation de l'image
            const imageData = await this.prepareImage(file);
            
            // 3. Analyse par l'API de vision
            const visionResults = await this.analyzeImage(imageData);
            
            // 4. Mapping vers les codes tarifaires
            const tariffResults = await this.mapToTariffCodes(visionResults);
            
            // 5. Retour des résultats
            return this.formatResults(tariffResults);
            
        } catch (error) {
            console.error('❌ Erreur de classification d\'image:', error);
            throw error;
        }
    }

    // Classification d'image depuis une URL
    async classifyImageFromURL(imageURL) {
        try {
            console.log('📸 Classification d\'image depuis URL:', imageURL);
            
            // 1. Validation de l'URL
            if (!this.validateImageURL(imageURL)) {
                throw new Error('URL d\'image invalide');
            }

            // 2. Analyse par l'API de vision
            const visionResults = await this.analyzeImageURL(imageURL);
            
            // 3. Mapping vers les codes tarifaires
            const tariffResults = await this.mapToTariffCodes(visionResults);
            
            // 4. Retour des résultats
            return this.formatResults(tariffResults);
            
        } catch (error) {
            console.error('❌ Erreur de classification d\'image URL:', error);
            throw error;
        }
    }

    // Validation du fichier image
    validateImageFile(file) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        const maxSize = 10 * 1024 * 1024; // 10MB
        
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Format d\'image non supporté. Utilisez JPEG, PNG ou WebP.');
        }
        
        if (file.size > maxSize) {
            throw new Error('Fichier trop volumineux. Taille maximale: 10MB.');
        }
        
        return true;
    }

    // Validation de l'URL d'image
    validateImageURL(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    }

    // Préparation de l'image
    async prepareImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Analyse d'image par l'API de vision
    async analyzeImage(imageData) {
        const service = this.services[this.currentService];
        
        if (!service) {
            throw new Error(`Service ${this.currentService} non disponible`);
        }

        try {
            const results = await service.analyze(imageData, this.apiKey);
            console.log('🔍 Résultats de l\'analyse:', results);
            return results;
        } catch (error) {
            console.error('❌ Erreur d\'analyse d\'image:', error);
            throw error;
        }
    }

    // Analyse d'image depuis URL
    async analyzeImageURL(imageURL) {
        const service = this.services[this.currentService];
        
        if (!service) {
            throw new Error(`Service ${this.currentService} non disponible`);
        }

        try {
            const results = await service.analyzeURL(imageURL, this.apiKey);
            console.log('🔍 Résultats de l\'analyse URL:', results);
            return results;
        } catch (error) {
            console.error('❌ Erreur d\'analyse d\'image URL:', error);
            throw error;
        }
    }

    // Mapping vers les codes tarifaires
    async mapToTariffCodes(visionResults) {
        return await this.tariffMapper.mapVisionToTariff(visionResults);
    }

    // Formatage des résultats
    formatResults(tariffResults) {
        return {
            success: true,
            timestamp: new Date().toISOString(),
            results: tariffResults,
            method: 'image_recognition',
            service: this.currentService
        };
    }

    // Test de l'API
    async testAPI() {
        try {
            console.log('🧪 Test de l\'API de reconnaissance d\'images...');
            
            // Test avec une image d'exemple
            const testImageURL = 'https://example.com/test-image.jpg';
            const results = await this.classifyImageFromURL(testImageURL);
            
            console.log('✅ Test réussi:', results);
            return results;
            
        } catch (error) {
            console.error('❌ Test échoué:', error);
            throw error;
        }
    }
}

// API Google Vision
class GoogleVisionAPI {
    async analyze(imageData, apiKey) {
        // Simulation de l'API Google Vision
        // En production, utilisez l'API réelle
        
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    labels: [
                        { description: 'toy', confidence: 0.95 },
                        { description: 'doll', confidence: 0.88 },
                        { description: 'plastic', confidence: 0.82 },
                        { description: 'colorful', confidence: 0.78 }
                    ],
                    objects: [
                        { name: 'toy', confidence: 0.95 },
                        { name: 'doll', confidence: 0.88 }
                    ],
                    text: [],
                    faces: []
                });
            }, 1000);
        });
    }

    async analyzeURL(imageURL, apiKey) {
        return this.analyze(imageURL, apiKey);
    }
}

// API Azure Computer Vision
class AzureComputerVisionAPI {
    async analyze(imageData, apiKey) {
        // Simulation de l'API Azure
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    tags: [
                        { name: 'toy', confidence: 0.93 },
                        { name: 'doll', confidence: 0.87 },
                        { name: 'plastic', confidence: 0.81 }
                    ],
                    objects: [
                        { object: 'toy', confidence: 0.93 },
                        { object: 'doll', confidence: 0.87 }
                    ],
                    description: {
                        tags: ['toy', 'doll', 'plastic', 'colorful'],
                        captions: [{ text: 'A colorful toy doll', confidence: 0.85 }]
                    }
                });
            }, 1200);
        });
    }

    async analyzeURL(imageURL, apiKey) {
        return this.analyze(imageURL, apiKey);
    }
}

// API AWS Rekognition
class AWSRekognitionAPI {
    async analyze(imageData, apiKey) {
        // Simulation de l'API AWS
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    Labels: [
                        { Name: 'Toy', Confidence: 94.5 },
                        { Name: 'Doll', Confidence: 87.2 },
                        { Name: 'Plastic', Confidence: 81.8 }
                    ],
                    Objects: [
                        { Name: 'Toy', Confidence: 94.5 },
                        { Name: 'Doll', Confidence: 87.2 }
                    ]
                });
            }, 1100);
        });
    }

    async analyzeURL(imageURL, apiKey) {
        return this.analyze(imageURL, apiKey);
    }
}

// API Custom Vision (Microsoft)
class CustomVisionAPI {
    async analyze(imageData, apiKey) {
        // Simulation de l'API Custom Vision
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    predictions: [
                        { tagName: 'toy', probability: 0.96 },
                        { tagName: 'doll', probability: 0.89 },
                        { tagName: 'plastic', probability: 0.83 }
                    ]
                });
            }, 900);
        });
    }

    async analyzeURL(imageURL, apiKey) {
        return this.analyze(imageURL, apiKey);
    }
}

// Mappeur Vision → Codes Tarifaires
class TariffImageMapper {
    constructor() {
        this.visionToTariffMap = this.buildVisionToTariffMap();
    }

    // Mapping des résultats de vision vers les codes tarifaires
    async mapVisionToTariff(visionResults) {
        const mappedResults = [];
        
        // Extraire tous les labels/objets détectés
        const detectedObjects = this.extractDetectedObjects(visionResults);
        
        // Mapper chaque objet vers un code tarifaire
        for (const obj of detectedObjects) {
            const tariffCode = this.mapObjectToTariff(obj);
            if (tariffCode) {
                mappedResults.push({
                    ...tariffCode,
                    detectedObject: obj.name,
                    confidence: obj.confidence,
                    method: 'image_recognition'
                });
            }
        }
        
        // Trier par confiance décroissante
        mappedResults.sort((a, b) => b.confidence - a.confidence);
        
        return mappedResults.slice(0, 3); // Retourner les 3 meilleurs résultats
    }

    // Extraction des objets détectés
    extractDetectedObjects(visionResults) {
        const objects = [];
        
        // Google Vision
        if (visionResults.labels) {
            visionResults.labels.forEach(label => {
                objects.push({
                    name: label.description,
                    confidence: label.confidence
                });
            });
        }
        
        // Azure Vision
        if (visionResults.tags) {
            visionResults.tags.forEach(tag => {
                objects.push({
                    name: tag.name,
                    confidence: tag.confidence
                });
            });
        }
        
        // AWS Rekognition
        if (visionResults.Labels) {
            visionResults.Labels.forEach(label => {
                objects.push({
                    name: label.Name,
                    confidence: label.Confidence / 100
                });
            });
        }
        
        // Custom Vision
        if (visionResults.predictions) {
            visionResults.predictions.forEach(pred => {
                objects.push({
                    name: pred.tagName,
                    confidence: pred.probability
                });
            });
        }
        
        return objects;
    }

    // Mapping objet → code tarifaire
    mapObjectToTariff(object) {
        const objectName = object.name.toLowerCase();
        
        // Recherche dans le mapping
        for (const [pattern, tariffInfo] of Object.entries(this.visionToTariffMap)) {
            if (objectName.includes(pattern) || pattern.includes(objectName)) {
                return {
                    section: tariffInfo.section,
                    chapter: tariffInfo.chapter,
                    code: tariffInfo.code,
                    confidence: object.confidence * tariffInfo.confidenceMultiplier,
                    matchedKeywords: [objectName],
                    specificRule: true
                };
            }
        }
        
        return null;
    }

    // Construction du mapping Vision → Tariff
    buildVisionToTariffMap() {
        return {
            // Jouets et jeux
            "toy": { section: "XX", chapter: "95", code: "9503.00", confidenceMultiplier: 0.95 },
            "doll": { section: "XX", chapter: "95", code: "9503.00", confidenceMultiplier: 0.98 },
            "game": { section: "XX", chapter: "95", code: "9503.00", confidenceMultiplier: 0.95 },
            "puzzle": { section: "XX", chapter: "95", code: "9503.00", confidenceMultiplier: 0.97 },
            "ball": { section: "XX", chapter: "95", code: "9506.62", confidenceMultiplier: 0.96 },
            "balloon": { section: "XX", chapter: "95", code: "9506.62", confidenceMultiplier: 0.94 },
            
            // Poissons et produits aquatiques
            "fish": { section: "I", chapter: "03", code: "0302", confidenceMultiplier: 0.98 },
            "salmon": { section: "I", chapter: "03", code: "0302.11", confidenceMultiplier: 0.99 },
            "tuna": { section: "I", chapter: "03", code: "0302.31", confidenceMultiplier: 0.99 },
            "shrimp": { section: "I", chapter: "03", code: "0306.13", confidenceMultiplier: 0.99 },
            "oyster": { section: "I", chapter: "03", code: "0307.11", confidenceMultiplier: 0.99 },
            
            // Viandes
            "meat": { section: "I", chapter: "02", code: "0201", confidenceMultiplier: 0.95 },
            "beef": { section: "I", chapter: "02", code: "0201.10", confidenceMultiplier: 0.98 },
            "pork": { section: "I", chapter: "02", code: "0203", confidenceMultiplier: 0.98 },
            "chicken": { section: "I", chapter: "02", code: "0207", confidenceMultiplier: 0.98 },
            
            // Meubles
            "furniture": { section: "XX", chapter: "94", code: "9401", confidenceMultiplier: 0.96 },
            "chair": { section: "XX", chapter: "94", code: "9401.61", confidenceMultiplier: 0.97 },
            "table": { section: "XX", chapter: "94", code: "9403.60", confidenceMultiplier: 0.97 },
            "desk": { section: "XX", chapter: "94", code: "9403.30", confidenceMultiplier: 0.97 },
            
            // Électronique
            "phone": { section: "XVI", chapter: "85", code: "8517.12", confidenceMultiplier: 0.98 },
            "computer": { section: "XVI", chapter: "84", code: "8471.30", confidenceMultiplier: 0.98 },
            "laptop": { section: "XVI", chapter: "84", code: "8471.30", confidenceMultiplier: 0.98 },
            "smartphone": { section: "XVI", chapter: "85", code: "8517.12", confidenceMultiplier: 0.98 },
            
            // Véhicules
            "car": { section: "XVII", chapter: "87", code: "8703", confidenceMultiplier: 0.97 },
            "vehicle": { section: "XVII", chapter: "87", code: "8703", confidenceMultiplier: 0.96 },
            "automobile": { section: "XVII", chapter: "87", code: "8703", confidenceMultiplier: 0.97 },
            
            // Textiles
            "clothing": { section: "XI", chapter: "62", code: "6204", confidenceMultiplier: 0.95 },
            "fabric": { section: "XI", chapter: "52", code: "5208", confidenceMultiplier: 0.95 },
            "cotton": { section: "XI", chapter: "52", code: "5201", confidenceMultiplier: 0.98 },
            "wool": { section: "XI", chapter: "51", code: "5101", confidenceMultiplier: 0.98 }
        };
    }
}

// Export pour utilisation
window.ImageRecognitionAPI = ImageRecognitionAPI;
