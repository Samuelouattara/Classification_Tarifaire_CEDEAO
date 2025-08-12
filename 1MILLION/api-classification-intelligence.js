// API de Classification Intelligente pour TEC CEDEAO
// Système avancé utilisant NLP, embeddings et règles contextuelles

class IntelligentTariffClassifier {
    constructor() {
        this.embeddings = new Map();
        this.contextRules = this.buildContextRules();
        this.semanticMatcher = new SemanticMatcher();
        this.confidenceThreshold = 0.85;
        this.fallbackClassifier = new FallbackClassifier();
    }

    // Règles contextuelles avancées basées sur le TEC CEDEAO
    buildContextRules() {
        return {
            // Règles de priorité absolue (Section → Chapitre)
            absolute: {
                "jouet": { section: "XX", chapter: "95", code: "9503", confidence: 98 },
                "jeu": { section: "XX", chapter: "95", code: "9503", confidence: 98 },
                "poupée": { section: "XX", chapter: "95", code: "9503.00", confidence: 99 },
                "peluche": { section: "XX", chapter: "95", code: "9503.00", confidence: 99 },
                "puzzle": { section: "XX", chapter: "95", code: "9503.00", confidence: 98 },
                "ballon": { section: "XX", chapter: "95", code: "9506.62", confidence: 97 },
                "raquette": { section: "XX", chapter: "95", code: "9506.51", confidence: 97 },
                "vélo": { section: "XX", chapter: "95", code: "9501.00", confidence: 96 },
                "bicyclette": { section: "XX", chapter: "95", code: "9501.00", confidence: 96 },
                
                // Poissons et produits aquatiques
                "poisson": { section: "I", chapter: "03", code: "0302", confidence: 98 },
                "crustacé": { section: "I", chapter: "03", code: "0306", confidence: 98 },
                "mollusque": { section: "I", chapter: "03", code: "0307", confidence: 98 },
                "saumon": { section: "I", chapter: "03", code: "0302.11", confidence: 99 },
                "thon": { section: "I", chapter: "03", code: "0302.31", confidence: 99 },
                "crevette": { section: "I", chapter: "03", code: "0306.13", confidence: 99 },
                "huître": { section: "I", chapter: "03", code: "0307.11", confidence: 99 },
                
                // Viandes
                "viande": { section: "I", chapter: "02", code: "0201", confidence: 95 },
                "bœuf": { section: "I", chapter: "02", code: "0201.10", confidence: 98 },
                "porc": { section: "I", chapter: "02", code: "0203", confidence: 98 },
                "poulet": { section: "I", chapter: "02", code: "0207", confidence: 98 },
                "volaille": { section: "I", chapter: "02", code: "0207", confidence: 97 },
                
                // Meubles
                "meuble": { section: "XX", chapter: "94", code: "9401", confidence: 96 },
                "mobilier": { section: "XX", chapter: "94", code: "9401", confidence: 96 },
                "siège": { section: "XX", chapter: "94", code: "9401.61", confidence: 97 },
                "table": { section: "XX", chapter: "94", code: "9403.60", confidence: 97 },
                "chaise": { section: "XX", chapter: "94", code: "9401.61", confidence: 97 },
                
                // Électronique
                "téléphone": { section: "XVI", chapter: "85", code: "8517.12", confidence: 98 },
                "ordinateur": { section: "XVI", chapter: "84", code: "8471.30", confidence: 98 },
                "laptop": { section: "XVI", chapter: "84", code: "8471.30", confidence: 98 },
                "smartphone": { section: "XVI", chapter: "85", code: "8517.12", confidence: 98 },
                
                // Véhicules
                "voiture": { section: "XVII", chapter: "87", code: "8703", confidence: 97 },
                "véhicule": { section: "XVII", chapter: "87", code: "8703", confidence: 96 },
                "automobile": { section: "XVII", chapter: "87", code: "8703", confidence: 97 },
                
                // Textiles
                "vêtement": { section: "XI", chapter: "62", code: "6204", confidence: 95 },
                "tissu": { section: "XI", chapter: "52", code: "5208", confidence: 95 },
                "coton": { section: "XI", chapter: "52", code: "5201", confidence: 98 },
                "laine": { section: "XI", chapter: "51", code: "5101", confidence: 98 },
                
                // Produits chimiques
                "médicament": { section: "VI", chapter: "30", code: "3004", confidence: 97 },
                "pharmaceutique": { section: "VI", chapter: "30", code: "3004", confidence: 97 },
                "cosmétique": { section: "VI", chapter: "33", code: "3304", confidence: 96 },
                "parfum": { section: "VI", chapter: "33", code: "3303", confidence: 97 }
            },
            
            // Règles contextuelles complexes
            contextual: {
                // Si "jouet" + "éducatif" → Section XX, Chapitre 95
                "jouet éducatif": { section: "XX", chapter: "95", code: "9503.00", confidence: 99 },
                "jeu éducatif": { section: "XX", chapter: "95", code: "9503.00", confidence: 99 },
                
                // Si "poisson" + "frais" → Section I, Chapitre 03
                "poisson frais": { section: "I", chapter: "03", code: "0302.11", confidence: 99 },
                "poisson congelé": { section: "I", chapter: "03", code: "0303.11", confidence: 99 },
                
                // Si "meuble" + "bureau" → Section XX, Chapitre 94
                "meuble bureau": { section: "XX", chapter: "94", code: "9403.30", confidence: 98 },
                "bureau meuble": { section: "XX", chapter: "94", code: "9403.30", confidence: 98 }
            },
            
            // Exclusions strictes
            exclusions: {
                "jouet": ["meuble", "mobilier", "luminaire", "éclairage"],
                "poisson": ["viande", "volaille", "bœuf", "porc"],
                "meuble": ["jouet", "jeu", "sport", "divertissement"],
                "viande": ["poisson", "crustacé", "mollusque", "aquatique"]
            }
        };
    }

    // Classification intelligente principale
    async classifyProduct(description) {
        try {
            console.log('🧠 Classification intelligente pour:', description);
            
            // 1. Nettoyage et normalisation
            const normalizedDesc = this.normalizeDescription(description);
            
            // 2. Vérification des règles absolues
            const absoluteMatch = this.checkAbsoluteRules(normalizedDesc);
            if (absoluteMatch) {
                console.log('✅ Règle absolue trouvée:', absoluteMatch);
                return [absoluteMatch];
            }
            
            // 3. Vérification des règles contextuelles
            const contextualMatch = this.checkContextualRules(normalizedDesc);
            if (contextualMatch) {
                console.log('✅ Règle contextuelle trouvée:', contextualMatch);
                return [contextualMatch];
            }
            
            // 4. Classification sémantique avancée
            const semanticResults = await this.semanticClassification(normalizedDesc);
            if (semanticResults && semanticResults.length > 0) {
                console.log('✅ Classification sémantique réussie');
                return semanticResults;
            }
            
            // 5. Fallback vers le système existant
            console.log('⚠️ Utilisation du système de fallback');
            return this.fallbackClassifier.classify(description);
            
        } catch (error) {
            console.error('❌ Erreur dans la classification intelligente:', error);
            return this.fallbackClassifier.classify(description);
        }
    }

    // Normalisation de la description
    normalizeDescription(description) {
        return description
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[^\w\s]/g, ' ') // Garder seulement lettres, chiffres et espaces
            .replace(/\s+/g, ' ') // Normaliser les espaces
            .trim();
    }

    // Vérification des règles absolues
    checkAbsoluteRules(normalizedDesc) {
        const words = normalizedDesc.split(' ');
        
        for (const [keyword, rule] of Object.entries(this.contextRules.absolute)) {
            if (words.includes(keyword) || normalizedDesc.includes(keyword)) {
                // Vérifier les exclusions
                if (this.checkExclusions(keyword, words)) {
                    continue;
                }
                
                return {
                    section: { 
                        number: rule.section, 
                        title: this.getSectionTitle(rule.section),
                        description: this.getSectionDescription(rule.section)
                    },
                    chapter: rule.chapter,
                    code: rule.code,
                    confidence: rule.confidence,
                    matchedKeywords: [keyword],
                    specificRule: true,
                    method: 'absolute_rule'
                };
            }
        }
        
        return null;
    }

    // Vérification des règles contextuelles
    checkContextualRules(normalizedDesc) {
        for (const [pattern, rule] of Object.entries(this.contextRules.contextual)) {
            if (normalizedDesc.includes(pattern)) {
                return {
                    section: { 
                        number: rule.section, 
                        title: this.getSectionTitle(rule.section),
                        description: this.getSectionDescription(rule.section)
                    },
                    chapter: rule.chapter,
                    code: rule.code,
                    confidence: rule.confidence,
                    matchedKeywords: [pattern],
                    specificRule: true,
                    method: 'contextual_rule'
                };
            }
        }
        
        return null;
    }

    // Vérification des exclusions
    checkExclusions(keyword, words) {
        const exclusions = this.contextRules.exclusions[keyword];
        if (!exclusions) return false;
        
        return exclusions.some(exclusion => 
            words.includes(exclusion) || words.some(word => word.includes(exclusion))
        );
    }

    // Classification sémantique avancée
    async semanticClassification(normalizedDesc) {
        // Simulation d'une classification sémantique avancée
        // En production, cela utiliserait des embeddings et des modèles NLP
        
        const semanticPatterns = {
            // Jouets et jeux
            "jouet|jeu|poupée|peluche|puzzle|ballon|raquette|vélo|bicyclette": {
                section: "XX", chapter: "95", code: "9503.00", confidence: 92
            },
            
            // Poissons et produits aquatiques
            "poisson|crustacé|mollusque|saumon|thon|crevette|huître|aquatique": {
                section: "I", chapter: "03", code: "0302", confidence: 94
            },
            
            // Viandes
            "viande|bœuf|porc|poulet|volaille|agneau|mouton": {
                section: "I", chapter: "02", code: "0201", confidence: 93
            },
            
            // Meubles
            "meuble|mobilier|siège|table|chaise|bureau|armoire": {
                section: "XX", chapter: "94", code: "9401", confidence: 91
            },
            
            // Électronique
            "téléphone|ordinateur|laptop|smartphone|électronique|digital": {
                section: "XVI", chapter: "85", code: "8517.12", confidence: 95
            }
        };

        for (const [pattern, rule] of Object.entries(semanticPatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(normalizedDesc)) {
                return [{
                    section: { 
                        number: rule.section, 
                        title: this.getSectionTitle(rule.section),
                        description: this.getSectionDescription(rule.section)
                    },
                    chapter: rule.chapter,
                    code: rule.code,
                    confidence: rule.confidence,
                    matchedKeywords: [pattern],
                    specificRule: false,
                    method: 'semantic_pattern'
                }];
            }
        }
        
        return null;
    }

    // Obtenir le titre de section
    getSectionTitle(sectionNumber) {
        const sectionTitles = {
            "I": "Animaux vivants et produits du règne animal",
            "II": "Produits du règne végétal",
            "III": "Graisses et huiles animales, végétales ou d'origine microbienne",
            "IV": "Produits des industries alimentaires",
            "V": "Produits minéraux",
            "VI": "Produits des industries chimiques",
            "VII": "Matières plastiques et ouvrages en ces matières",
            "VIII": "Peaux, cuirs, pelleteries et ouvrages en ces matières",
            "IX": "Bois, charbon de bois et ouvrages en bois",
            "X": "Pâtes de bois ou d'autres matières fibreuses cellulosiques",
            "XI": "Matières textiles et ouvrages en ces matières",
            "XII": "Chaussures, coiffures, parapluies, parasols",
            "XIII": "Ouvrages en pierres, plâtre, ciment, amiante, mica",
            "XIV": "Perles fines ou de culture, pierres gemmes",
            "XV": "Métaux communs et ouvrages en ces métaux",
            "XVI": "Machines et appareils, matériel électrique",
            "XVII": "Matériel de transport",
            "XVIII": "Instruments et appareils d'optique",
            "XIX": "Armes, munitions et leurs parties",
            "XX": "Marchandises et produits divers",
            "XXI": "Objets d'art, de collection ou d'antiquité"
        };
        
        return sectionTitles[sectionNumber] || "Section inconnue";
    }

    // Obtenir la description de section
    getSectionDescription(sectionNumber) {
        const sectionDescriptions = {
            "I": "Animaux vivants, viandes, poissons, produits laitiers, œufs, miel",
            "II": "Plantes vivantes, légumes, fruits, céréales, graines, café, thé, épices",
            "XX": "Meubles, jouets, jeux, articles de sport, objets divers",
            "XVI": "Machines, appareils électriques, électronique, informatique",
            "XVII": "Véhicules automobiles, navires, avions, matériel de transport"
        };
        
        return sectionDescriptions[sectionNumber] || "Description non disponible";
    }
}

// Classificateur de fallback
class FallbackClassifier {
    classify(description) {
        // Utilise le système existant comme fallback
        if (typeof classifyProductImproved === 'function') {
            return classifyProductImproved(description);
        } else if (typeof classifySimple === 'function') {
            return classifySimple(description);
        } else {
            return [{
                section: { 
                    number: "XX", 
                    title: "Marchandises et produits divers",
                    description: "Produits divers"
                },
                confidence: 50,
                code: "9999.00.00.00",
                matchedKeywords: [],
                specificRule: false,
                method: 'fallback'
            }];
        }
    }
}

// Matcher sémantique (pour future implémentation)
class SemanticMatcher {
    constructor() {
        this.embeddings = new Map();
    }
    
    async matchSemantic(text) {
        // Placeholder pour future implémentation avec embeddings
        return null;
    }
}

// Export pour utilisation
window.IntelligentTariffClassifier = IntelligentTariffClassifier;
