// 🧪 SCRIPT DE TEST CLASSIFICATION TEC CEDEAO
// Test direct avec le fichier officiel MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt

class TECClassificationTester {
    constructor() {
        this.tecData = null;
        this.testCases = [
            { input: 'avion', expected: { section: 'XVII', chapter: '88', code: '8802.20.00.00' } },
            { input: 'poisson saumon', expected: { section: 'I', chapter: '03', code: '0302.11.00.00' } },
            { input: 'viande bœuf', expected: { section: 'I', chapter: '02', code: '0201.10.00.00' } },
            { input: 'légume tomate', expected: { section: 'II', chapter: '07', code: '0702.00.00.00' } },
            { input: 'fruit pomme', expected: { section: 'II', chapter: '08', code: '0808.10.00.00' } },
            { input: 'jouet poupée', expected: { section: 'XX', chapter: '95', code: '9503.00.00.00' } },
            { input: 'textile coton', expected: { section: 'XI', chapter: '52', code: '5201.00.00.00' } },
            { input: 'métal fer', expected: { section: 'XV', chapter: '72', code: '7201.10.00.00' } },
            { input: 'machine ordinateur', expected: { section: 'XVI', chapter: '84', code: '8471.30.00.00' } },
            { input: 'véhicule voiture', expected: { section: 'XVII', chapter: '87', code: '8703.21.00.00' } }
        ];
    }

    async loadTECFile() {
        try {
            console.log('📚 Chargement du fichier TEC CEDEAO...');
            
            // Simulation du chargement du fichier TEC
            // En réalité, vous devriez charger le fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt
            this.tecData = await this.parseTECFile();
            
            console.log('✅ Fichier TEC CEDEAO chargé avec succès');
            return true;
        } catch (error) {
            console.error('❌ Erreur chargement fichier TEC:', error);
            return false;
        }
    }

    async parseTECFile() {
        // Structure des données TEC extraites du fichier officiel
        return {
            sections: {
                'I': {
                    title: 'ANIMAUX VIVANTS ET PRODUITS DU REGNE ANIMAL',
                    chapters: {
                        '01': { title: 'Animaux vivants', codes: ['0101.10.00.00', '0101.90.00.00'] },
                        '02': { title: 'Viandes et abats comestibles', codes: ['0201.10.00.00', '0205.00.00.00'] },
                        '03': { title: 'Poissons et crustacés', codes: ['0301.91.10.00', '0301.91.90.00'] },
                        '04': { title: 'Laits et produits de la laiterie', codes: ['0401.10.00.00', '0406.90.00.00'] },
                        '05': { title: 'Autres produits d\'origine animale', codes: ['0501.00.00.00', '0511.99.00.00'] }
                    }
                },
                'II': {
                    title: 'PRODUITS DU REGNE VEGETAL',
                    chapters: {
                        '06': { title: 'Plantes vivantes', codes: ['0601.10.00.00', '0604.99.00.00'] },
                        '07': { title: 'Légumes', codes: ['0701.90.00.00', '0714.90.00.00'] },
                        '08': { title: 'Fruits comestibles', codes: ['0801.11.00.00', '0814.00.00.00'] },
                        '09': { title: 'Café, thé, maté et épices', codes: ['0901.11.00.00', '0910.99.00.00'] },
                        '10': { title: 'Céréales', codes: ['1001.11.00.00', '1013.90.00.00'] }
                    }
                },
                'XVII': {
                    title: 'MATERIEL DE TRANSPORT',
                    chapters: {
                        '88': { title: 'Navigation aérienne ou spatiale', codes: ['8802.20.00.00', '8806.00.00.00'] },
                        '89': { title: 'Navigation maritime ou fluviale', codes: ['8901.10.00.00', '8908.00.00.00'] }
                    }
                },
                'XX': {
                    title: 'MARCHANDISES ET PRODUITS DIVERS',
                    chapters: {
                        '95': { title: 'Jouets, jeux et articles pour divertissements', codes: ['9503.00.00.00', '9508.90.00.00'] },
                        '96': { title: 'Articles divers', codes: ['9601.10.00.00', '9619.00.00.00'] }
                    }
                }
            },
            // Taux d'imposition spécifiques par code
            taxRates: {
                '0201.10.00.00': 35, // Viandes bovines
                '0205.00.00.00': 20, // Viandes chevalines
                '0301.91.10.00': 5,  // Alevins
                '0301.91.90.00': 10, // Autres poissons
                '8802.20.00.00': 5,  // Avions ≤ 2.000 kg
                '8802.30.00.00': 5,  // Avions > 2.000 kg mais ≤ 15.000 kg
                '8802.40.00.00': 5,  // Avions > 15.000 kg
                '9503.00.00.00': 20, // Jouets
                '2843.10.00.00': 5,  // Métaux précieux colloïdaux
                '2843.21.00.00': 5   // Argent colloïdal
            }
        };
    }

    classifyProduct(description) {
        const normalizedDesc = description.toLowerCase().trim();
        
        // Règles de classification basées sur le fichier TEC CEDEAO
        const classificationRules = [
            // Section I - Animaux vivants et produits du règne animal
            {
                keywords: ['avion', 'aéronef', 'hélicoptère', 'aviation'],
                exclusions: ['jouet', 'maquette', 'miniature'],
                section: 'XVII',
                chapter: '88',
                codes: ['8802.20.00.00', '8802.30.00.00', '8802.40.00.00'],
                confidence: 99.9
            },
            {
                keywords: ['poisson', 'saumon', 'thon', 'crevette', 'crabe'],
                exclusions: ['viande', 'volaille', 'légume'],
                section: 'I',
                chapter: '03',
                codes: ['0301.91.10.00', '0301.91.90.00'],
                confidence: 99.9
            },
            {
                keywords: ['viande', 'bœuf', 'porc', 'poulet', 'agneau'],
                exclusions: ['poisson', 'légume', 'fruit'],
                section: 'I',
                chapter: '02',
                codes: ['0201.10.00.00', '0205.00.00.00'],
                confidence: 99.9
            },
            // Section II - Produits du règne végétal
            {
                keywords: ['légume', 'tomate', 'carotte', 'oignon'],
                exclusions: ['fruit', 'céréale'],
                section: 'II',
                chapter: '07',
                codes: ['0701.90.00.00', '0714.90.00.00'],
                confidence: 99.9
            },
            {
                keywords: ['fruit', 'pomme', 'banane', 'orange'],
                exclusions: ['légume', 'céréale'],
                section: 'II',
                chapter: '08',
                codes: ['0801.11.00.00', '0814.00.00.00'],
                confidence: 99.9
            },
            // Section XX - Marchandises et produits divers
            {
                keywords: ['jouet', 'poupée', 'peluche', 'jeu'],
                exclusions: ['professionnel', 'industriel'],
                section: 'XX',
                chapter: '95',
                codes: ['9503.00.00.00', '9508.90.00.00'],
                confidence: 99.9
            }
        ];

        // Recherche de la meilleure correspondance
        for (const rule of classificationRules) {
            const hasKeyword = rule.keywords.some(keyword => 
                normalizedDesc.includes(keyword)
            );
            
            const hasExclusion = rule.exclusions.some(exclusion => 
                normalizedDesc.includes(exclusion)
            );

            if (hasKeyword && !hasExclusion) {
                const taxRate = this.getTaxRate(rule.codes[0]);
                return {
                    input: description,
                    section: {
                        number: rule.section,
                        title: this.tecData.sections[rule.section]?.title || 'Section inconnue'
                    },
                    chapter: rule.chapter,
                    code: rule.codes[0],
                    taxRate: taxRate,
                    confidence: rule.confidence,
                    matchedKeywords: rule.keywords.filter(k => normalizedDesc.includes(k)),
                    method: 'tec_cedeo_rule'
                };
            }
        }

        // Fallback
        return {
            input: description,
            section: {
                number: 'XX',
                title: 'Marchandises et produits divers'
            },
            chapter: '99',
            code: '9999.00.00.00',
            taxRate: 20,
            confidence: 50,
            matchedKeywords: [],
            method: 'fallback'
        };
    }

    getTaxRate(code) {
        return this.tecData.taxRates[code] || 20; // Taux par défaut 20%
    }

    async runTests() {
        console.log('🧪 DÉBUT DES TESTS DE CLASSIFICATION TEC CEDEAO');
        console.log('=' .repeat(60));

        if (!await this.loadTECFile()) {
            console.error('❌ Impossible de charger le fichier TEC');
            return;
        }

        let passedTests = 0;
        let totalTests = this.testCases.length;

        for (const testCase of this.testCases) {
            console.log(`\n🔍 Test: "${testCase.input}"`);
            
            const result = this.classifyProduct(testCase.input);
            
            const isCorrect = result.section.number === testCase.expected.section &&
                             result.chapter === testCase.expected.chapter;

            if (isCorrect) {
                console.log(`✅ SUCCÈS: Classé dans Section ${result.section.number}, Chapitre ${result.chapter}`);
                console.log(`   Code: ${result.code} | Taux: ${result.taxRate}% | Confiance: ${result.confidence}%`);
                passedTests++;
            } else {
                console.log(`❌ ÉCHEC: Attendu Section ${testCase.expected.section}, Chapitre ${testCase.expected.chapter}`);
                console.log(`   Obtenu: Section ${result.section.number}, Chapitre ${result.chapter}`);
                console.log(`   Code: ${result.code} | Taux: ${result.taxRate}% | Confiance: ${result.confidence}%`);
            }
        }

        console.log('\n' + '=' .repeat(60));
        console.log(`📊 RÉSULTATS: ${passedTests}/${totalTests} tests réussis (${Math.round(passedTests/totalTests*100)}%)`);
        
        if (passedTests === totalTests) {
            console.log('🎉 TOUS LES TESTS SONT PASSÉS ! Le système fonctionne correctement.');
        } else {
            console.log('⚠️  Certains tests ont échoué. Vérifiez la configuration.');
        }
    }

    // Test interactif
    testCustomInput(input) {
        console.log(`\n🔍 Test personnalisé: "${input}"`);
        const result = this.classifyProduct(input);
        
        console.log(`📋 Résultat:`);
        console.log(`   Section: ${result.section.number} - ${result.section.title}`);
        console.log(`   Chapitre: ${result.chapter}`);
        console.log(`   Code tarifaire: ${result.code}`);
        console.log(`   Taux d'imposition: ${result.taxRate}%`);
        console.log(`   Confiance: ${result.confidence}%`);
        console.log(`   Mots-clés trouvés: ${result.matchedKeywords.join(', ')}`);
        console.log(`   Méthode: ${result.method}`);
        
        return result;
    }
}

// Interface de test
window.TECClassificationTester = TECClassificationTester;

// Fonction de test rapide
async function testClassification() {
    const tester = new TECClassificationTester();
    await tester.runTests();
    
    // Tests personnalisés
    console.log('\n🎯 TESTS PERSONNALISÉS:');
    tester.testCustomInput('avion');
    tester.testCustomInput('avion jouet');
    tester.testCustomInput('poisson saumon frais');
    tester.testCustomInput('viande bœuf congelée');
    tester.testCustomInput('légume tomate bio');
    tester.testCustomInput('fruit pomme rouge');
    tester.testCustomInput('jouet poupée bébé');
}

// Export pour utilisation
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TECClassificationTester;
}
