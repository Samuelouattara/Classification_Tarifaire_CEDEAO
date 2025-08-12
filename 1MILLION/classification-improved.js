// Système de Classification Tarifaire CEDEAO - Version Améliorée
// Basé sur les règles exactes du TEC CEDEAO SH 2022

// Règles spécifiques pour les classifications prioritaires
const specificRules = {
    // Jouets et jeux -> Section XX Chapitre 95
    "jouet": { section: "XX", chapter: "95", priority: 10 },
    "jeu": { section: "XX", chapter: "95", priority: 10 },
    "divertissement": { section: "XX", chapter: "95", priority: 10 },
    "sport": { section: "XX", chapter: "95", priority: 10 },
    "poupée": { section: "XX", chapter: "95", priority: 10 },
    "peluche": { section: "XX", chapter: "95", priority: 10 },
    "puzzle": { section: "XX", chapter: "95", priority: 10 },
    "ballon": { section: "XX", chapter: "95", priority: 10 },
    "raquette": { section: "XX", chapter: "95", priority: 10 },
    "ski": { section: "XX", chapter: "95", priority: 10 },
    "patin": { section: "XX", chapter: "95", priority: 10 },
    "vélo": { section: "XX", chapter: "95", priority: 10 },
    "bicyclette": { section: "XX", chapter: "95", priority: 10 },
    "tricycle": { section: "XX", chapter: "95", priority: 10 },
    "trottinette": { section: "XX", chapter: "95", priority: 10 },
    
    // Poissons -> Section I Chapitre 03
    "poisson": { section: "I", chapter: "03", priority: 10 },
    "crustacé": { section: "I", chapter: "03", priority: 10 },
    "mollusque": { section: "I", chapter: "03", priority: 10 },
    "aquatique": { section: "I", chapter: "03", priority: 10 },
    "saumon": { section: "I", chapter: "03", priority: 10 },
    "thon": { section: "I", chapter: "03", priority: 10 },
    "morue": { section: "I", chapter: "03", priority: 10 },
    "crevette": { section: "I", chapter: "03", priority: 10 },
    "huître": { section: "I", chapter: "03", priority: 10 },
    "moule": { section: "I", chapter: "03", priority: 10 },
    "langouste": { section: "I", chapter: "03", priority: 10 },
    "homard": { section: "I", chapter: "03", priority: 10 },
    "crabe": { section: "I", chapter: "03", priority: 10 },
    "calamar": { section: "I", chapter: "03", priority: 10 },
    "poulpe": { section: "I", chapter: "03", priority: 10 },
    
    // Meubles -> Section XX Chapitre 94
    "meuble": { section: "XX", chapter: "94", priority: 10 },
    "mobilier": { section: "XX", chapter: "94", priority: 10 },
    "siège": { section: "XX", chapter: "94", priority: 10 },
    "table": { section: "XX", chapter: "94", priority: 10 },
    "armoire": { section: "XX", chapter: "94", priority: 10 },
    "lit": { section: "XX", chapter: "94", priority: 10 },
    "matelas": { section: "XX", chapter: "94", priority: 10 },
    "oreiller": { section: "XX", chapter: "94", priority: 10 },
    "chaise": { section: "XX", chapter: "94", priority: 10 },
    "fauteuil": { section: "XX", chapter: "94", priority: 10 },
    "canapé": { section: "XX", chapter: "94", priority: 10 },
    "bureau": { section: "XX", chapter: "94", priority: 10 },
    "commode": { section: "XX", chapter: "94", priority: 10 },
    "buffet": { section: "XX", chapter: "94", priority: 10 },
    
    // Luminaires -> Section XX Chapitre 94
    "luminaire": { section: "XX", chapter: "94", priority: 10 },
    "éclairage": { section: "XX", chapter: "94", priority: 10 },
    "ampoule": { section: "XX", chapter: "94", priority: 10 },
    "lustre": { section: "XX", chapter: "94", priority: 10 },
    "applique": { section: "XX", chapter: "94", priority: 10 },
    "lampe": { section: "XX", chapter: "94", priority: 10 },
    "abat-jour": { section: "XX", chapter: "94", priority: 10 },
    "plafonnier": { section: "XX", chapter: "94", priority: 10 },
    "suspension": { section: "XX", chapter: "94", priority: 10 },
    
    // Viandes -> Section I Chapitre 02
    "viande": { section: "I", chapter: "02", priority: 10 },
    "bœuf": { section: "I", chapter: "02", priority: 10 },
    "porc": { section: "I", chapter: "02", priority: 10 },
    "mouton": { section: "I", chapter: "02", priority: 10 },
    "agneau": { section: "I", chapter: "02", priority: 10 },
    "veau": { section: "I", chapter: "02", priority: 10 },
    "poulet": { section: "I", chapter: "02", priority: 10 },
    "volaille": { section: "I", chapter: "02", priority: 10 },
    "canard": { section: "I", chapter: "02", priority: 10 },
    "dinde": { section: "I", chapter: "02", priority: 10 },
    "oie": { section: "I", chapter: "02", priority: 10 },
    "lapin": { section: "I", chapter: "02", priority: 10 },
    "cheval": { section: "I", chapter: "02", priority: 10 },
    
    // Vêtements -> Section XI
    "vêtement": { section: "XI", chapter: "61", priority: 10 },
    "chemise": { section: "XI", chapter: "61", priority: 10 },
    "pantalon": { section: "XI", chapter: "61", priority: 10 },
    "robe": { section: "XI", chapter: "61", priority: 10 },
    "jupe": { section: "XI", chapter: "61", priority: 10 },
    "veste": { section: "XI", chapter: "61", priority: 10 },
    "manteau": { section: "XI", chapter: "61", priority: 10 },
    "pull": { section: "XI", chapter: "61", priority: 10 },
    "t-shirt": { section: "XI", chapter: "61", priority: 10 },
    "sweat": { section: "XI", chapter: "61", priority: 10 },
    "blouson": { section: "XI", chapter: "61", priority: 10 },
    "costume": { section: "XI", chapter: "61", priority: 10 },
    "cravate": { section: "XI", chapter: "61", priority: 10 },
    "cravate": { section: "XI", chapter: "61", priority: 10 },
    
    // Chaussures -> Section XII Chapitre 64
    "chaussure": { section: "XII", chapter: "64", priority: 10 },
    "soulier": { section: "XII", chapter: "64", priority: 10 },
    "botte": { section: "XII", chapter: "64", priority: 10 },
    "sandale": { section: "XII", chapter: "64", priority: 10 },
    "espadrille": { section: "XII", chapter: "64", priority: 10 },
    "basket": { section: "XII", chapter: "64", priority: 10 },
    "tennis": { section: "XII", chapter: "64", priority: 10 },
    "mocassin": { section: "XII", chapter: "64", priority: 10 },
    "pantoufle": { section: "XII", chapter: "64", priority: 10 },
    
    // Électronique -> Section XVI
    "ordinateur": { section: "XVI", chapter: "84", priority: 10 },
    "téléphone": { section: "XVI", chapter: "85", priority: 10 },
    "smartphone": { section: "XVI", chapter: "85", priority: 10 },
    "tablette": { section: "XVI", chapter: "85", priority: 10 },
    "télévision": { section: "XVI", chapter: "85", priority: 10 },
    "écran": { section: "XVI", chapter: "85", priority: 10 },
    "imprimante": { section: "XVI", chapter: "84", priority: 10 },
    "scanner": { section: "XVI", chapter: "84", priority: 10 },
    
    // Véhicules -> Section XVII
    "voiture": { section: "XVII", chapter: "87", priority: 10 },
    "automobile": { section: "XVII", chapter: "87", priority: 10 },
    "camion": { section: "XVII", chapter: "87", priority: 10 },
    "moto": { section: "XVII", chapter: "87", priority: 10 },
    "véhicule": { section: "XVII", chapter: "87", priority: 10 },
    "bateau": { section: "XVII", chapter: "89", priority: 10 },
    "avion": { section: "XVII", chapter: "88", priority: 10 },
    
    // Instruments de musique -> Section XVIII
    "piano": { section: "XVIII", chapter: "92", priority: 10 },
    "guitare": { section: "XVIII", chapter: "92", priority: 10 },
    "violon": { section: "XVIII", chapter: "92", priority: 10 },
    "flûte": { section: "XVIII", chapter: "92", priority: 10 },
    "trompette": { section: "XVIII", chapter: "92", priority: 10 },
    "tambour": { section: "XVIII", chapter: "92", priority: 10 },
    "instrument": { section: "XVIII", chapter: "92", priority: 10 },
    
    // Horlogerie -> Section XVIII
    "montre": { section: "XVIII", chapter: "91", priority: 10 },
    "horloge": { section: "XVIII", chapter: "91", priority: 10 },
    "pendule": { section: "XVIII", chapter: "91", priority: 10 },
    "réveil": { section: "XVIII", chapter: "91", priority: 10 },
    
    // Armes -> Section XIX
    "arme": { section: "XIX", chapter: "93", priority: 10 },
    "fusil": { section: "XIX", chapter: "93", priority: 10 },
    "pistolet": { section: "XIX", chapter: "93", priority: 10 },
    "munition": { section: "XIX", chapter: "93", priority: 10 },
    "cartouche": { section: "XIX", chapter: "93", priority: 10 },
    
    // Bijoux -> Section XIV
    "bijou": { section: "XIV", chapter: "71", priority: 10 },
    "bague": { section: "XIV", chapter: "71", priority: 10 },
    "collier": { section: "XIV", chapter: "71", priority: 10 },
    "bracelet": { section: "XIV", chapter: "71", priority: 10 },
    "boucle": { section: "XIV", chapter: "71", priority: 10 },
    "diamant": { section: "XIV", chapter: "71", priority: 10 },
    "or": { section: "XIV", chapter: "71", priority: 10 },
    "argent": { section: "XIV", chapter: "71", priority: 10 }
};

// Fonction de classification améliorée
function classifyProductImproved(description) {
    const results = [];
    const descriptionLower = description.toLowerCase();
    
    // Vérifier si sectionsData est disponible
    if (typeof sectionsData === 'undefined' || !sectionsData) {
        console.warn('⚠️ sectionsData non disponible, utilisation du fallback');
        return classifySimple(description);
    }
    
    // Nettoyer et tokeniser la description
    const words = descriptionLower
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    // Vérifier d'abord les règles spécifiques
    let specificMatch = null;
    let highestPriority = 0;
    
    for (const [keyword, rule] of Object.entries(specificRules)) {
        if (descriptionLower.includes(keyword)) {
            if (rule.priority > highestPriority) {
                highestPriority = rule.priority;
                specificMatch = rule;
            }
        }
    }
    
    // Si on a une règle spécifique, l'appliquer en priorité
    if (specificMatch) {
        const section = Object.values(sectionsData).find(s => s.number === specificMatch.section);
        if (section) {
            results.push({
                section: section,
                score: 100,
                confidence: 95,
                matchedKeywords: [Object.keys(specificRules).find(k => specificRules[k] === specificMatch)],
                specificRule: true,
                chapter: specificMatch.chapter,
                code: generateTariffCode(specificMatch.section, specificMatch.chapter)
            });
        }
    }
    
    // Calculer les scores pour chaque section (sans les exclusions)
    Object.values(sectionsData).forEach(section => {
        // Vérifier les exclusions
        let hasExclusion = false;
        if (section.exclusions) {
            section.exclusions.forEach(exclusion => {
                if (descriptionLower.includes(exclusion)) {
                    hasExclusion = true;
                }
            });
        }
        
        if (hasExclusion) {
            return; // Ignorer cette section si elle contient des mots exclus
        }
        
        let score = 0;
        let matchedKeywords = [];
        
        section.keywords.forEach(keyword => {
            if (descriptionLower.includes(keyword)) {
                score += keyword.length; // Mots plus longs = score plus élevé
                matchedKeywords.push(keyword);
            }
        });
        
        // Bonus pour les mots exacts
        words.forEach(word => {
            if (section.keywords.includes(word)) {
                score += 5;
            }
        });
        
        // Ajuster le score selon la priorité de la section
        score = score / (section.priority || 1);
        
        if (score > 0) {
            results.push({
                section: section,
                score: score,
                confidence: Math.min(Math.round((score / words.length) * 20), 100),
                matchedKeywords: matchedKeywords,
                specificRule: false,
                chapter: section.chapters[0] || "01"
            });
        }
    });
    
    // Trier par score décroissant
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, 3); // Retourner les 3 meilleurs résultats
}

// Fonction pour générer un code tarifaire basique
function generateTariffCode(sectionNumber, chapterNumber) {
    // Format: SS.CC.00.00.00 (Section, Chapitre, sous-chapitre, position, sous-position)
    const section = sectionNumber.padStart(2, '0');
    const chapter = chapterNumber.padStart(2, '0');
    return `${section}.${chapter}.00.00.00`;
}

// Fonction pour tester la classification
function testClassification() {
    const testCases = [
        "jouet en plastique",
        "poisson frais",
        "meuble de salon",
        "viande de bœuf",
        "chaussure en cuir",
        "ordinateur portable",
        "montre en or",
        "guitare électrique"
    ];
    
    console.log("🧪 Test de classification améliorée:");
    testCases.forEach(test => {
        const results = classifyProductImproved(test);
        console.log(`\n📦 "${test}":`);
        if (results.length > 0) {
            const best = results[0];
            console.log(`   ✅ Section ${best.section.number} (${best.section.title})`);
            console.log(`   📊 Confiance: ${best.confidence}%`);
            if (best.specificRule) {
                console.log(`   🎯 Règle spécifique appliquée`);
                console.log(`   📋 Chapitre: ${best.chapter}`);
                console.log(`   🔢 Code: ${best.code}`);
            }
        } else {
            console.log(`   ❌ Aucune classification trouvée`);
        }
    });
}

// Fonction de fallback si sectionsData n'est pas disponible
function classifySimple(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('jouet') || desc.includes('jeu') || desc.includes('poupée') || desc.includes('peluche')) {
        return [{
            section: { number: 'XX', title: 'Marchandises et produits divers', description: 'Jouets, jeux et articles de sport' },
            confidence: 95,
            code: '9503.00.00.00',
            matchedKeywords: ['jouet'],
            specificRule: true,
            chapter: '95'
        }];
    } else if (desc.includes('poisson') || desc.includes('crustacé') || desc.includes('mollusque') || desc.includes('saumon') || desc.includes('thon')) {
        return [{
            section: { number: 'I', title: 'Animaux vivants et produits du règne animal', description: 'Poissons, crustacés, mollusques' },
            confidence: 95,
            code: '0302.00.00.00',
            matchedKeywords: ['poisson'],
            specificRule: true,
            chapter: '03'
        }];
    } else if (desc.includes('meuble') || desc.includes('mobilier') || desc.includes('siège') || desc.includes('table') || desc.includes('chaise')) {
        return [{
            section: { number: 'XX', title: 'Marchandises et produits divers', description: 'Meubles et mobilier' },
            confidence: 95,
            code: '9401.00.00.00',
            matchedKeywords: ['meuble'],
            specificRule: true,
            chapter: '94'
        }];
    } else if (desc.includes('viande') || desc.includes('bœuf') || desc.includes('porc') || desc.includes('poulet') || desc.includes('volaille')) {
        return [{
            section: { number: 'I', title: 'Animaux vivants et produits du règne animal', description: 'Viandes et abats' },
            confidence: 95,
            code: '0201.00.00.00',
            matchedKeywords: ['viande'],
            specificRule: true,
            chapter: '02'
        }];
    } else if (desc.includes('riz') || desc.includes('blé') || desc.includes('céréale')) {
        return [{
            section: { number: 'II', title: 'Produits du règne végétal', description: 'Céréales' },
            confidence: 85,
            code: '1006.30.00.00'
        }];
    } else if (desc.includes('téléphone') || desc.includes('ordinateur') || desc.includes('électronique')) {
        return [{
            section: { number: 'XVI', title: 'Machines et appareils électriques', description: 'Appareils électroniques' },
            confidence: 90,
            code: '8517.12.00.00'
        }];
    } else if (desc.includes('voiture') || desc.includes('véhicule')) {
        return [{
            section: { number: 'XVII', title: 'Matériel de transport', description: 'Véhicules automobiles' },
            confidence: 85,
            code: '8703.23.00.00'
        }];
    } else {
        return [{
            section: { number: 'XX', title: 'Marchandises et produits divers', description: 'Produits divers' },
            confidence: 60,
            code: '9999.00.00.00'
        }];
    }
}

// Rendre les fonctions disponibles globalement
window.classifyProductImproved = classifyProductImproved;
window.testClassification = testClassification;
window.specificRules = specificRules;
window.classifySimple = classifySimple;

console.log('✅ Système de classification amélioré chargé!');
console.log('🧪 Utilisez testClassification() pour tester');
console.log('🎯 Utilisez classifyProductImproved() pour classifier');
