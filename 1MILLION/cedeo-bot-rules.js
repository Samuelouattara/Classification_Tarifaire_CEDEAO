/**
 * Règles de Classification CEDEAO - JavaScript
 */

// Règles de classification CEDEAO
const CEDEO_RULES = {
    'absolute': {
        'avion': {'section': 'XVII', 'chapter': '88', 'tax_rate': 5.0},
        'voiture': {'section': 'XVII', 'chapter': '87', 'tax_rate': 10.0},
        'ordinateur': {'section': 'XVI', 'chapter': '84', 'tax_rate': 5.0},
        'telephone': {'section': 'XVI', 'chapter': '85', 'tax_rate': 5.0},
        'vetement': {'section': 'XI', 'chapter': '62', 'tax_rate': 20.0},
        'jouet': {'section': 'XX', 'chapter': '95', 'tax_rate': 20.0}
    },
    'keywords': {
        'materiel_transport': {
            'section': 'XVII',
            'chapter': '88',
            'keywords': ['avion', 'aeronef', 'helicoptere', 'voiture', 'automobile', 'camion', 'bateau', 'navire'],
            'exclusions': ['jouet', 'maquette', 'miniature'],
            'tax_rate': 5.0
        },
        'machines_electriques': {
            'section': 'XVI',
            'chapter': '85',
            'keywords': ['ordinateur', 'telephone', 'television', 'radio', 'machine', 'appareil'],
            'exclusions': ['jouet', 'maquette'],
            'tax_rate': 10.0
        },
        'textiles': {
            'section': 'XI',
            'chapter': '62',
            'keywords': ['vetement', 'habit', 'robe', 'pantalon', 'chemise', 'tissu'],
            'exclusions': [],
            'tax_rate': 20.0
        }
    }
};

function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase().trim();
}

function classifyProductWithCEDEO(productName) {
    const normalizedName = normalizeText(productName);
    
    // Vérifier les règles absolues
    for (const [keyword, rule] of Object.entries(CEDEO_RULES.absolute)) {
        if (normalizedName.includes(keyword)) {
            return {
                product_name: productName,
                tariff_code: `${rule.chapter}0100`,
                section: rule.section,
                chapter: rule.chapter,
                tax_rate: rule.tax_rate,
                confidence: 0.95,
                classification_method: 'absolute_rule',
                timestamp: new Date().toISOString(),
                matched_keyword: keyword
            };
        }
    }
    
    // Vérifier les règles par mots-clés
    for (const [category, rule] of Object.entries(CEDEO_RULES.keywords)) {
        const excluded = rule.exclusions.some(exclusion => normalizedName.includes(exclusion));
        if (excluded) continue;
        
        const matched = rule.keywords.some(keyword => normalizedName.includes(keyword));
        if (matched) {
            return {
                product_name: productName,
                tariff_code: `${rule.chapter}0100`,
                section: rule.section,
                chapter: rule.chapter,
                tax_rate: rule.tax_rate,
                confidence: 0.85,
                classification_method: 'keyword_rule',
                timestamp: new Date().toISOString(),
                matched_category: category
            };
        }
    }
    
    // Classification par défaut
    return {
        product_name: productName,
        tariff_code: '999999',
        section: 'XX',
        chapter: '99',
        tax_rate: 20.0,
        confidence: 0.1,
        classification_method: 'default',
        timestamp: new Date().toISOString()
    };
}

// Exposer les fonctions globalement
window.classifyProductWithCEDEO = classifyProductWithCEDEO;
window.CEDEO_RULES = CEDEO_RULES;

console.log('✅ Règles CEDEAO chargées avec succès');
