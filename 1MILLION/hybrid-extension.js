// ========================================
// HYBRID-EXTENSION.JS - VERSION LÉGÈRE
// Extension qui s'ajoute à votre système existant SANS le remplacer
// ========================================

console.log("🔄 Chargement de l'extension hybride...");

// 💾 BASE DE DONNÉES ÉTENDUE MONDIALE (version compacte)
const WorldDatabase = {
    vehicles: {
        brands: [
            // Marques principales mondiales
            'toyota', 'honda', 'ford', 'volkswagen', 'bmw', 'mercedes', 'audi', 'peugeot', 'renault', 'citroën',
            'nissan', 'hyundai', 'kia', 'mazda', 'subaru', 'mitsubishi', 'lexus', 'infiniti', 'acura', 'jaguar',
            'land rover', 'range rover', 'bentley', 'rolls royce', 'ferrari', 'lamborghini', 'porsche', 'maserati',
            'alfa romeo', 'fiat', 'skoda', 'seat', 'volvo', 'saab', 'opel', 'chevrolet', 'cadillac', 'buick',
            'chrysler', 'dodge', 'jeep', 'tesla', 'lucid', 'rivian', 'byd', 'geely', 'chery', 'gac',
            'lotus', 'mclaren', 'koenigsegg', 'bugatti', 'pagani', 'aston martin', 'morgan', 'tvr', 'caterham',
            'yamaha', 'kawasaki', 'suzuki', 'ducati', 'harley davidson', 'ktm', 'triumph',
            'boeing', 'airbus', 'bombardier', 'embraer', 'cessna', 'piper', 'beechcraft', 'gulfstream',
            'beneteau', 'jeanneau', 'sea ray', 'sunseeker', 'azimut'
        ],
        types: [
            'voiture', 'automobile', 'auto', 'car', 'véhicule', 'camion', 'truck', 'moto', 'motocyclette', 'scooter',
            'avion', 'aéronef', 'jet', 'hélicoptère', 'bateau', 'navire', 'yacht', 'voilier', '4x4', 'suv',
            'berline', 'break', 'coupé', 'cabriolet', 'utilitaire', 'fourgon', 'bus', 'autobus'
        ]
    },
    animals: {
        mammals: [
            'lion', 'tigre', 'éléphant', 'girafe', 'zèbre', 'hippopotame', 'rhinocéros', 'léopard', 'guépard',
            'gorille', 'chimpanzé', 'orang-outan', 'panda', 'kangourou', 'koala', 'ours', 'loup', 'renard',
            'cerf', 'sanglier', 'antilope', 'gazelle', 'buffle', 'yak', 'bison', 'wapiti', 'orignal'
        ],
        domestic: [
            'chien', 'chat', 'cheval', 'vache', 'porc', 'mouton', 'chèvre', 'poule', 'canard', 'oie', 'lapin'
        ],
        fish: [
            'saumon', 'thon', 'sardine', 'maquereau', 'truite', 'carpe', 'brochet', 'bar', 'sole', 'turbot',
            'daurade', 'cabillaud', 'morue', 'colin', 'merlan', 'lieu', 'lotte', 'requin', 'raie'
        ],
        seafood: [
            'crevette', 'homard', 'crabe', 'langoustine', 'huître', 'moule', 'coquille saint-jacques', 'calamar', 'seiche', 'poulpe'
        ]
    },
    plants: {
        fruits: [
            'orange', 'citron', 'pamplemousse', 'mandarine', 'pomme', 'poire', 'banane', 'ananas', 'mangue',
            'papaye', 'avocat', 'kiwi', 'fraise', 'framboise', 'cerise', 'pêche', 'abricot', 'prune',
            'melon', 'pastèque', 'raisin', 'figue', 'datte', 'noix', 'amande', 'pistache'
        ],
        vegetables: [
            'tomate', 'carotte', 'pomme de terre', 'oignon', 'ail', 'poivron', 'aubergine', 'courgette',
            'concombre', 'salade', 'épinard', 'haricot', 'petit pois', 'chou', 'brocoli', 'chou-fleur'
        ],
        cereals: [
            'riz', 'blé', 'maïs', 'orge', 'avoine', 'seigle', 'millet', 'quinoa', 'sarrasin'
        ],
        others: [
            'café', 'thé', 'cacao', 'vanille', 'cannelle', 'poivre', 'basilic', 'thym', 'romarin'
        ]
    },
    electronics: {
        brands: [
            'apple', 'samsung', 'huawei', 'xiaomi', 'sony', 'lg', 'panasonic', 'dell', 'hp', 'lenovo', 'asus'
        ],
        devices: [
            'iphone', 'smartphone', 'téléphone', 'ordinateur', 'laptop', 'tablette', 'ipad',
            'télévision', 'tv', 'console', 'playstation', 'xbox', 'nintendo'
        ]
    }
};

// 🔍 FONCTION PRINCIPALE D'AMÉLIORATION
function enhanceClassification(description) {
    if (!description || description.trim().length === 0) {
        return null;
    }
    
    const descLower = description.toLowerCase().trim();
    
    // 1. Vérifier les véhicules
    for (const brand of WorldDatabase.vehicles.brands) {
        if (descLower.includes(brand)) {
            return {
                section: "Section XVII",
                title: "Matériel de transport",
                confidence: 90,
                matchedTerm: brand,
                reason: `Marque de véhicule détectée: ${brand}`,
                source: 'hybrid'
            };
        }
    }
    
    for (const type of WorldDatabase.vehicles.types) {
        if (descLower.includes(type)) {
            return {
                section: "Section XVII",
                title: "Matériel de transport",
                confidence: 85,
                matchedTerm: type,
                reason: `Type de véhicule détecté: ${type}`,
                source: 'hybrid'
            };
        }
    }
    
    // 2. Vérifier les animaux
    const animalCategories = Object.values(WorldDatabase.animals).flat();
    for (const animal of animalCategories) {
        if (descLower.includes(animal)) {
            return {
                section: "Section I",
                title: "Animaux vivants et produits du règne animal",
                confidence: 88,
                matchedTerm: animal,
                reason: `Animal détecté: ${animal}`,
                source: 'hybrid'
            };
        }
    }
    
    // 3. Vérifier les plantes
    const plantCategories = Object.values(WorldDatabase.plants).flat();
    for (const plant of plantCategories) {
        if (descLower.includes(plant)) {
            return {
                section: "Section II",
                title: "Produits du règne végétal",
                confidence: 85,
                matchedTerm: plant,
                reason: `Végétal détecté: ${plant}`,
                source: 'hybrid'
            };
        }
    }
    
    // 4. Vérifier l'électronique
    const electronicItems = [...WorldDatabase.electronics.brands, ...WorldDatabase.electronics.devices];
    for (const item of electronicItems) {
        if (descLower.includes(item)) {
            return {
                section: "Section XVI",
                title: "Machines et appareils électriques",
                confidence: 80,
                matchedTerm: item,
                reason: `Produit électronique détecté: ${item}`,
                source: 'hybrid'
            };
        }
    }
    
    return null;
}

// 🔄 AMÉLIORATION DE LA FONCTION EXISTANTE
// Sauvegarde de la fonction originale
const originalClassifyProduct = window.classifyProduct;

// Nouvelle fonction améliorée
function enhancedClassifyProduct(description) {
    console.log(`🔍 Classification hybride pour: "${description}"`);
    
    // 1. D'abord, essayer notre amélioration
    const hybridResult = enhanceClassification(description);
    
    if (hybridResult) {
        console.log(`✅ Trouvé par l'extension hybride: ${hybridResult.section}`);
        
        // Formatter le résultat pour correspondre à votre système
        return [{
            section: {
                number: hybridResult.section.replace('Section ', ''),
                title: hybridResult.title
            },
            confidence: hybridResult.confidence,
            matchedKeywords: [hybridResult.matchedTerm],
            score: hybridResult.confidence
        }];
    }
    
    // 2. Si pas trouvé, utiliser votre système original
    if (originalClassifyProduct && typeof originalClassifyProduct === 'function') {
        console.log("🔄 Utilisation du système original...");
        return originalClassifyProduct(description);
    }
    
    // 3. Fallback basique si rien ne marche
    return [];
}

// 🎯 AMÉLIORATION DE LA FONCTION D'AFFICHAGE
const originalDisplayResults = window.displayResults;

function enhancedDisplayResults(results) {
    // Ajouter des informations sur la source
    if (results && results.length > 0) {
        results.forEach(result => {
            if (!result.source) {
                result.source = 'original';
            }
        });
    }
    
    // Utiliser votre fonction d'affichage originale
    if (originalDisplayResults && typeof originalDisplayResults === 'function') {
        return originalDisplayResults(results);
    }
}

// 🚀 FONCTION DE TEST RAPIDE
function testHybridSystem() {
    console.log("=== TESTS DU SYSTÈME HYBRIDE ===");
    
    const testCases = [
        "lion",
        "toyota",
        "range rover", 
        "orange",
        "lamborghini",
        "saumon",
        "iphone",
        "4x4"
    ];
    
    testCases.forEach(testCase => {
        const result = enhanceClassification(testCase);
        if (result) {
            console.log(`✅ "${testCase}" → ${result.section}: ${result.title} (${result.confidence}%)`);
        } else {
            console.log(`❌ "${testCase}" → Non trouvé par l'extension`);
        }
    });
}

// 🔗 INTÉGRATION DOUCE AVEC VOTRE SYSTÈME EXISTANT
// Attendre que votre système soit chargé
setTimeout(() => {
    if (typeof window !== 'undefined') {
        // Sauvegarder les originales SEULEMENT si elles existent
        if (window.classifyProduct) {
            window._originalClassifyProduct = window.classifyProduct;
            console.log("✅ Fonction classifyProduct sauvegardée");
        }
        
        if (window.displayResults) {
            window._originalDisplayResults = window.displayResults;
            console.log("✅ Fonction displayResults sauvegardée");
        }
        
        // Installer les nouvelles versions SEULEMENT si les originales existent
        if (window.classifyProduct) {
            window.classifyProduct = enhancedClassifyProduct;
            console.log("✅ Fonction classifyProduct améliorée");
        }
        
        if (window.displayResults) {
            window.displayResults = enhancedDisplayResults;
            console.log("✅ Fonction displayResults améliorée");
        }
        
        // Fonction de test disponible globalement
        window.testHybridSystem = testHybridSystem;
        
        console.log("✅ Extension hybride installée avec succès !");
        console.log("🧪 Tapez 'testHybridSystem()' dans la console pour tester");
    }
}, 2000); // Attendre 2 secondes que votre système se charge

// 🎉 NOTIFICATION DE CHARGEMENT
setTimeout(() => {
    if (window.location.search.includes('debug=1')) {
        testHybridSystem();
    }
}, 3000);

console.log("📦 Extension hybride chargée - Prête à améliorer vos classifications !");