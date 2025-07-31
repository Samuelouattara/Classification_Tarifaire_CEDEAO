// Base de données des codes tarifaires spécifiques TEC CEDEAO SH 2022
// Extraits du document officiel pour améliorer la précision de classification

const codesSpecifiques = {
    // Section I - Animaux vivants et produits du règne animal
    "0101": {
        description: "Chevaux, ânes, mulets et bardots, vivants",
        sousCodes: {
            "0101.21.00.00": "Chevaux reproducteurs de race pure",
            "0101.29.00.00": "Autres chevaux",
            "0101.30.10.00": "Ânes reproducteurs de race pure",
            "0101.30.90.00": "Autres ânes"
        }
    },
    "0102": {
        description: "Animaux vivants de l'espèce bovine",
        sousCodes: {
            "0102.21.00.00": "Bovins domestiques reproducteurs de race pure",
            "0102.29.00.00": "Autres bovins domestiques",
            "0102.31.00.00": "Buffles reproducteurs de race pure",
            "0102.39.00.00": "Autres buffles"
        }
    },
    "0103": {
        description: "Animaux vivants de l'espèce porcine",
        sousCodes: {
            "0103.10.00.00": "Reproducteurs de race pure",
            "0103.91.00.00": "D'un poids inférieur à 50 kg",
            "0103.92.00.00": "D'un poids égal ou supérieur à 50 kg"
        }
    },
    "0104": {
        description: "Animaux vivants des espèces ovine ou caprine",
        sousCodes: {
            "0104.10.10.00": "Ovins reproducteurs de race pure",
            "0104.10.90.00": "Autres ovins",
            "0104.20.10.00": "Caprins reproducteurs de race pure",
            "0104.20.90.00": "Autres caprins"
        }
    },
    "0105": {
        description: "Coqs, poules, canards, oies, dindons, dindes et pintades, vivants, des espèces domestiques",
        sousCodes: {
            "0105.11.10.00": "Volailles de l'espèce Gallus domesticus reproducteurs (≤185g)",
            "0105.11.90.00": "Autres volailles de l'espèce Gallus domesticus (≤185g)",
            "0105.12.00.00": "Dindes et dindons (≤185g)",
            "0105.13.00.00": "Canards (≤185g)",
            "0105.14.00.00": "Oies (≤185g)",
            "0105.15.00.00": "Pintades (≤185g)"
        }
    },
    "0106": {
        description: "Autres animaux vivants",
        sousCodes: {
            "0106.11.00.00": "Primates",
            "0106.12.00.00": "Baleines, dauphins et marsouins; lamantins et dugongs; otaries et phoques, lions de mer et morses",
            "0106.13.00.00": "Chameaux et autres camélidés (Camelidae)",
            "0106.14.00.00": "Lapins et lièvres",
            "0106.41.00.00": "Abeilles",
            "0106.49.00.00": "Autres insectes"
        }
    },
    // Section II - Produits du règne végétal  
    "0701": {
        description: "Pommes de terre, à l'état frais ou réfrigéré",
        sousCodes: {
            "0701.10.00.00": "De semence",
            "0701.90.00.00": "Autres"
        }
    },
    "0702": {
        description: "Tomates, à l'état frais ou réfrigéré",
        sousCodes: {
            "0702.00.00.00": "Tomates, à l'état frais ou réfrigéré"
        }
    },
    "0707": {
        description: "Concombres et cornichons, à l'état frais ou réfrigéré",
        sousCodes: {
            "0707.00.00.00": "Concombres et cornichons, à l'état frais ou réfrigéré"
        }
    },
    // Céréales
    "1001": {
        description: "Froment (blé) et méteil",
        keywords: ["froment", "blé", "méteil", "dur", "tendre", "semence"]
    },
    "1002": {
        description: "Seigle",
        keywords: ["seigle", "céréale", "grain"]
    },
    "1003": {
        description: "Orge",
        keywords: ["orge", "brasserie", "malterie", "fourrage"]
    },
    "1004": {
        description: "Avoine",
        keywords: ["avoine", "flocons", "gruau"]
    },
    "1005": {
        description: "Maïs",
        keywords: ["maïs", "semence", "hybride", "pop-corn", "doux"]
    },
    "1006": {
        description: "Riz",
        keywords: ["riz", "paddy", "cargo", "décortiqué", "blanchi", "poli", "glacé", "étuvé", "long", "rond", "brisé"]
    }
};

// Mots-clés supplémentaires pour améliorer la classification
const motsClésSupplementaires = {
    "animaux": ["vivant", "reproducteur", "race", "pure", "domestique", "élevage", "bétail"],
    "viandes": ["fraîche", "réfrigérée", "congelée", "carcasse", "demi-carcasse", "désossée", "morceau"],
    "poissons": ["frais", "réfrigéré", "congelé", "salé", "fumé", "séché", "filet", "entier"],
    "légumes": ["frais", "réfrigéré", "congelé", "séché", "conservé", "écossé", "décortiqué"],
    "fruits": ["frais", "séché", "congelé", "conservé", "jus", "pulpe", "écorce"],
    "céréales": ["grain", "farine", "semoule", "flocons", "gruau", "malt", "amidon"],
    "textiles": ["fil", "tissu", "étoffe", "fibre", "naturel", "synthétique", "artificiel"],
    "métaux": ["brut", "allié", "ouvré", "laminé", "forgé", "coulé", "usiné"]
};

// Fonction pour rechercher les codes spécifiques
function rechercherCodesSpecifiques(description) {
    const resultats = [];
    const descriptionLower = description.toLowerCase();
    
    for (const [code, info] of Object.entries(codesSpecifiques)) {
        // Vérifier la description principale
        if (descriptionLower.includes(info.description.toLowerCase())) {
            resultats.push({
                code: code,
                description: info.description,
                type: "code_principal"
            });
        }
        
        // Vérifier les sous-codes
        if (info.sousCodes) {
            for (const [sousCode, sousDescription] of Object.entries(info.sousCodes)) {
                if (descriptionLower.includes(sousDescription.toLowerCase())) {
                    resultats.push({
                        code: sousCode,
                        description: sousDescription,
                        type: "sous_code",
                        codeParent: code
                    });
                }
            }
        }
        
        // Vérifier les mots-clés spéciaux
        if (info.keywords) {
            for (const keyword of info.keywords) {
                if (descriptionLower.includes(keyword.toLowerCase())) {
                    resultats.push({
                        code: code,
                        description: info.description,
                        type: "mot_cle",
                        motCle: keyword
                    });
                    break; // Éviter les doublons
                }
            }
        }
    }
    
    return resultats;
}

// Export des données pour utilisation dans le script principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        codesSpecifiques,
        motsClésSupplementaires,
        rechercherCodesSpecifiques
    };
}
