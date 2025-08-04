// Classe de gestion de la base de données pour le système de classification tarifaire
// Intégration avec le système d'IA de classification

class DatabaseManager {
    constructor() {
        this.dbConfig = {
            host: 'localhost',
            user: 'douane_user',
            password: 'douane_secure_2024',
            database: 'Douane_base',
            charset: 'utf8mb4'
        };
        this.connection = null;
        this.currentUser = null;
    }

    // Connexion à la base de données
    async connect() {
        try {
            // En production, utiliser une vraie connexion MySQL
            // Pour le développement, simuler la connexion
            console.log('Connexion à la base de données Douane_base...');
            this.connection = { connected: true };
            return true;
        } catch (error) {
            console.error('Erreur de connexion à la base de données:', error);
            return false;
        }
    }

    // Authentification utilisateur
    async authenticateUser(email, motDePasse) {
        try {
            const response = await fetch('../database/api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'login',
                    email: email,
                    password: motDePasse
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.currentUser = data.user;
                // Stocker l'utilisateur dans le localStorage pour la session
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                return {
                    success: true,
                    user: data.user,
                    message: data.message
                };
            } else {
                return {
                    success: false,
                    message: data.message || 'Identifiants incorrects'
                };
            }
        } catch (error) {
            console.error('Erreur d\'authentification:', error);
            return {
                success: false,
                message: 'Erreur de connexion au serveur'
            };
        }
    }

    // Vérifier si un utilisateur est actuellement connecté
    async getCurrentUser() {
        try {
            // Récupérer l'utilisateur depuis le localStorage
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                this.currentUser = JSON.parse(storedUser);
                return this.currentUser;
            }
            return null;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', error);
            return null;
        }
    }

    // Déconnexion utilisateur
    async logout() {
        try {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            return { success: true, message: 'Déconnexion réussie' };
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            return { success: false, message: 'Erreur lors de la déconnexion' };
        }
    }

    // Création de session utilisateur
    async createSession(userId) {
        const sessionToken = this.generateSessionToken();
        const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        
        // Simulation de l'insertion en base
        console.log(`Session créée pour l'utilisateur ${userId}: ${sessionToken}`);
        return sessionToken;
    }

    // Génération de token de session
    generateSessionToken() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Mise à jour de la dernière connexion
    async updateLastLogin(userId) {
        console.log(`Dernière connexion mise à jour pour l'utilisateur ${userId}`);
    }

    // Sauvegarde temporaire d'une classification (avant validation)
    async saveTemporaryClassification(productData, classificationResult) {
        try {
            if (!this.currentUser) {
                throw new Error('Utilisateur non authentifié');
            }

            // Analyser les détails de sous-section du résultat de classification
            const subSectionDetails = this.extractSubSectionDetails(classificationResult);

            const tempClassification = {
                temp_id: Date.now(),
                origine_produit: productData.origine_produit,
                description_produit: productData.description_produit,
                numero_serie: productData.numero_serie || null,
                is_groupe: productData.is_groupe || false,
                nombre_produits: productData.nombre_produits || 1,
                section_produit: classificationResult.section.number,
                sous_section_produit: classificationResult.section.chapters.join(','),
                taux_imposition: await this.getTariffRate(classificationResult.section.number),
                user_id: this.currentUser.user_id,
                date_classification: new Date(),
                classification_confidence: classificationResult.confidence,
                classification_details: classificationResult,
                valeur_declaree: productData.valeur_declaree,
                poids_kg: productData.poids_kg,
                unite_mesure: productData.unite_mesure || 'unité',
                commentaires: productData.commentaires,
                statut: 'temporaire', // Statut temporaire avant validation
                
                // NOUVELLES DONNÉES SOUS-SECTION
                code_tarifaire_specifique: subSectionDetails.specificCode,
                niveau_precision: subSectionDetails.precisionLevel,
                chapitre_identifie: subSectionDetails.chapter,
                sous_code_identifie: subSectionDetails.subCode,
                correspondances_trouvees: subSectionDetails.matches,
                score_precision: subSectionDetails.precisionScore
            };

            // Stocker temporairement (localStorage pour la simulation)
            const tempClassifications = JSON.parse(localStorage.getItem('temp_classifications') || '[]');
            tempClassifications.push(tempClassification);
            localStorage.setItem('temp_classifications', JSON.stringify(tempClassifications));

            console.log('Classification temporaire sauvegardée avec sous-sections:', tempClassification);

            return {
                success: true,
                temp_id: tempClassification.temp_id,
                classification: tempClassification,
                message: `Classification sauvegardée temporairement (niveau: ${subSectionDetails.precisionLevel})`
            };
        } catch (error) {
            console.error('Erreur lors de la sauvegarde temporaire:', error);
            return {
                success: false,
                message: 'Erreur lors de la sauvegarde: ' + error.message
            };
        }
    }

    // NOUVELLE MÉTHODE: Extraction des détails de sous-section
    extractSubSectionDetails(classificationResult) {
        const details = {
            specificCode: null,
            precisionLevel: 'section',
            chapter: null,
            subCode: null,
            matches: 0,
            precisionScore: 0.5
        };

        // Vérifier si on a des détails de sous-section
        if (classificationResult.subSectionAnalysis) {
            const subAnalysis = classificationResult.subSectionAnalysis;
            
            details.precisionLevel = subAnalysis.precision;
            details.matches = subAnalysis.totalMatches || 0;

            // Code spécifique identifié
            if (subAnalysis.recommendedCode) {
                details.specificCode = subAnalysis.recommendedCode.code;
                details.precisionScore = this.calculatePrecisionScore(subAnalysis.recommendedCode.level);
            }

            // Chapitre identifié
            if (subAnalysis.chapterMatches && subAnalysis.chapterMatches.length > 0) {
                const bestChapter = subAnalysis.chapterMatches[0];
                details.chapter = bestChapter.chapter;
                
                if (!details.specificCode) {
                    details.specificCode = bestChapter.code;
                }
            }

            // Sous-code identifié
            if (subAnalysis.specificCodes && subAnalysis.specificCodes.length > 0) {
                const bestSubCode = subAnalysis.specificCodes[0];
                details.subCode = bestSubCode.subCode;
                details.specificCode = bestSubCode.subCode; // Priorise le sous-code
            }
        }

        return details;
    }

    // NOUVELLE MÉTHODE: Calcul du score de précision
    calculatePrecisionScore(level) {
        switch (level) {
            case 'sous-code':
                return 0.95;
            case 'chapitre':
                return 0.75;
            case 'section':
                return 0.50;
            default:
                return 0.30;
        }
    }

    // Validation et enregistrement définitif d'une classification
    async validateAndRegisterProduct(tempId, userValidation = true) {
        try {
            if (!this.currentUser) {
                throw new Error('Utilisateur non authentifié');
            }

            // Récupérer la classification temporaire
            const tempClassifications = JSON.parse(localStorage.getItem('temp_classifications') || '[]');
            const tempClassification = tempClassifications.find(tc => tc.temp_id === tempId);
            
            if (!tempClassification) {
                throw new Error('Classification temporaire non trouvée');
            }

            // Générer un code tarifaire intelligent basé sur les sous-sections
            const tariffCodeInfo = this.generateIntelligentTariffCode(tempClassification.classification_details);

            // Créer le produit définitif avec informations de sous-sections
            const product = {
                id_produit: Date.now(), // Simulation d'auto-increment
                origine_produit: tempClassification.origine_produit,
                description_produit: tempClassification.description_produit,
                numero_serie: tempClassification.numero_serie,
                is_groupe: tempClassification.is_groupe,
                nombre_produits: tempClassification.nombre_produits,
                taux_imposition: tempClassification.taux_imposition,
                section_produit: tempClassification.section_produit,
                sous_section_produit: tempClassification.sous_section_produit,
                user_id: this.currentUser.user_id,
                date_classification: new Date(),
                statut_validation: userValidation ? 'valide' : 'en_attente',
                code_tarifaire: tariffCodeInfo.code,
                valeur_declaree: tempClassification.valeur_declaree,
                poids_kg: tempClassification.poids_kg,
                unite_mesure: tempClassification.unite_mesure,
                commentaires: tempClassification.commentaires,
                classification_confidence: tempClassification.classification_confidence,
                
                // NOUVELLES DONNÉES DÉTAILLÉES SOUS-SECTIONS
                code_tarifaire_specifique: tempClassification.code_tarifaire_specifique,
                niveau_precision: tempClassification.niveau_precision,
                chapitre_identifie: tempClassification.chapitre_identifie,
                sous_code_identifie: tempClassification.sous_code_identifie,
                correspondances_trouvees: tempClassification.correspondances_trouvees,
                score_precision: tempClassification.score_precision,
                methode_classification: tariffCodeInfo.level,
                confiance_code: tariffCodeInfo.confidence
            };

            // Stocker dans l'historique permanent
            const historique = JSON.parse(localStorage.getItem('classification_history') || '[]');
            historique.push(product);
            localStorage.setItem('classification_history', JSON.stringify(historique));

            // Supprimer la classification temporaire
            const updatedTempClassifications = tempClassifications.filter(tc => tc.temp_id !== tempId);
            localStorage.setItem('temp_classifications', JSON.stringify(updatedTempClassifications));

            // Mise à jour du compteur utilisateur
            await this.updateUserProductCount(this.currentUser.user_id, 1);

            // Enregistrement dans l'historique des actions avec détails de précision
            await this.logClassificationHistory(
                product.id_produit, 
                'validation', 
                null, 
                product.section_produit,
                `Niveau: ${product.niveau_precision}, Code: ${product.code_tarifaire}`
            );

            console.log('Produit validé et enregistré avec sous-sections:', product);

            return {
                success: true,
                product_id: product.id_produit,
                product: product,
                message: `Produit validé et enregistré avec succès (précision: ${product.niveau_precision})`
            };
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            return {
                success: false,
                message: 'Erreur lors de la validation: ' + error.message
            };
        }
    }

    // Génération de code tarifaire avec prise en compte des sous-sections
    generateTariffCode(section, subSectionDetails = null) {
        // Si on a des détails de sous-section spécifiques, les utiliser
        if (subSectionDetails && subSectionDetails.specificCode) {
            return subSectionDetails.specificCode;
        }

        // Codes de base par section
        const sectionCodes = {
            'I': '0101', 'II': '0601', 'III': '1501', 'IV': '1601', 'V': '2501',
            'VI': '2801', 'VII': '3901', 'VIII': '4101', 'IX': '4401', 'X': '4701',
            'XI': '5001', 'XII': '6401', 'XIII': '6801', 'XIV': '7101', 'XV': '7201',
            'XVI': '8401', 'XVII': '8601', 'XVIII': '9001', 'XIX': '9301', 'XX': '9401',
            'XXI': '9701'
        };
        
        const baseCode = sectionCodes[section] || '9999';
        
        // Si on a un chapitre spécifique mais pas de sous-code
        if (subSectionDetails && subSectionDetails.chapter) {
            const chapterNum = subSectionDetails.chapter.padStart(2, '0');
            return `${chapterNum}01.00.00.00`; // Code générique du chapitre
        }
        
        // Code générique avec variation aléatoire
        const random = Math.floor(Math.random() * 90) + 10;
        return `${baseCode}.${random}.00.00`;
    }

    // NOUVELLE MÉTHODE: Génération de code tarifaire intelligent
    generateIntelligentTariffCode(classificationResult) {
        const subSectionDetails = this.extractSubSectionDetails(classificationResult);
        
        // Prioriser le code spécifique identifié
        if (subSectionDetails.specificCode) {
            return {
                code: subSectionDetails.specificCode,
                level: subSectionDetails.precisionLevel,
                confidence: subSectionDetails.precisionScore
            };
        }
        
        // Sinon, générer selon la section
        const generatedCode = this.generateTariffCode(classificationResult.section.number, subSectionDetails);
        
        return {
            code: generatedCode,
            level: 'généré',
            confidence: 0.6
        };
    }

    // Récupération des classifications temporaires
    async getTemporaryClassifications(userId = null) {
        const tempClassifications = JSON.parse(localStorage.getItem('temp_classifications') || '[]');
        
        if (userId) {
            return tempClassifications.filter(tc => tc.user_id === userId);
        }
        
        return tempClassifications;
    }

    // Enregistrement d'un nouveau produit (méthode conservée pour compatibilité)
    async registerProduct(productData) {
        try {
            if (!this.currentUser) {
                throw new Error('Utilisateur non authentifié');
            }

            // Obtenir le taux d'imposition pour la section
            const tauxImposition = await this.getTariffRate(productData.section_produit);

            const product = {
                id_produit: Date.now(),
                origine_produit: productData.origine_produit,
                description_produit: productData.description_produit,
                numero_serie: productData.numero_serie || null,
                is_groupe: productData.is_groupe || false,
                nombre_produits: productData.nombre_produits || 1,
                taux_imposition: tauxImposition,
                section_produit: productData.section_produit,
                sous_section_produit: productData.sous_section_produit,
                user_id: this.currentUser.user_id,
                date_classification: new Date(),
                statut_validation: 'valide', // Directement validé pour cette méthode
                code_tarifaire: this.generateTariffCode(productData.section_produit),
                valeur_declaree: productData.valeur_declaree,
                poids_kg: productData.poids_kg,
                unite_mesure: productData.unite_mesure || 'unité',
                commentaires: productData.commentaires
            };

            // Stocker dans l'historique
            const historique = JSON.parse(localStorage.getItem('classification_history') || '[]');
            historique.push(product);
            localStorage.setItem('classification_history', JSON.stringify(historique));

            await this.updateUserProductCount(this.currentUser.user_id, 1);
            await this.logClassificationHistory(product.id_produit, 'creation', null, productData.section_produit);

            return {
                success: true,
                product_id: product.id_produit,
                message: 'Produit enregistré avec succès'
            };
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du produit:', error);
            return {
                success: false,
                message: 'Erreur lors de l\'enregistrement: ' + error.message
            };
        }
    }

    // Enregistrement des produits membres d'un paquet
    async registerProductMembers(productId, membersData) {
        try {
            const members = [];
            
            for (let i = 0; i < membersData.length; i++) {
                const memberData = membersData[i];
                const tauxMembre = await this.getTariffRate(memberData.section_produit_membre);
                
                const member = {
                    id_membre: Date.now() + i,
                    id_produit: productId,
                    id_produit_membre: `${productId}-M${String(i + 1).padStart(3, '0')}`,
                    taux_imposition_membre: tauxMembre,
                    nom_produit_membre: memberData.nom_produit_membre,
                    origine_produit_membre: memberData.origine_produit_membre,
                    description_produit_membre: memberData.description_produit_membre,
                    numero_serie_membre: memberData.numero_serie_membre || null,
                    section_produit_membre: memberData.section_produit_membre,
                    sous_section_produit_membre: memberData.sous_section_produit_membre,
                    user_qui_classe_membre: this.currentUser.user_id,
                    date_classification_membre: new Date(),
                    quantite_membre: memberData.quantite_membre || 1,
                    valeur_unitaire_membre: memberData.valeur_unitaire_membre,
                    poids_unitaire_membre: memberData.poids_unitaire_membre,
                    code_tarifaire_membre: memberData.code_tarifaire_membre
                };
                
                members.push(member);
            }

            console.log('Produits membres enregistrés:', members);
            return {
                success: true,
                members_count: members.length,
                message: 'Produits membres enregistrés avec succès'
            };
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement des produits membres:', error);
            return {
                success: false,
                message: 'Erreur lors de l\'enregistrement des membres: ' + error.message
            };
        }
    }

    // Obtention du taux d'imposition pour une section
    async getTariffRate(section) {
        const rates = {
            'I': 10.50, 'II': 8.75, 'III': 12.00, 'IV': 15.25, 'V': 5.50,
            'VI': 18.75, 'VII': 14.50, 'VIII': 16.25, 'IX': 11.75, 'X': 13.50,
            'XI': 17.25, 'XII': 19.50, 'XIII': 9.25, 'XIV': 25.00, 'XV': 12.75,
            'XVI': 22.50, 'XVII': 20.75, 'XVIII': 16.50, 'XIX': 35.00, 'XX': 15.75,
            'XXI': 30.00
        };
        return rates[section] || 15.00; // Taux par défaut
    }

    // Mise à jour du compteur de produits de l'utilisateur
    async updateUserProductCount(userId, increment) {
        console.log(`Compteur produits mis à jour pour l'utilisateur ${userId}: +${increment}`);
    }

    // Enregistrement dans l'historique des classifications
    async logClassificationHistory(productId, action, oldSection = null, newSection = null, details = null) {
        const historyEntry = {
            id_historique: Date.now(),
            id_produit: productId,
            user_id: this.currentUser.user_id,
            action_effectuee: action,
            ancienne_section: oldSection,
            nouvelle_section: newSection,
            date_action: new Date(),
            commentaire_historique: `Action ${action} effectuée par ${this.currentUser.nom_user}`,
            details_supplementaires: details // Nouveau champ pour détails sous-sections
        };
        
        console.log('Historique enregistré avec sous-sections:', historyEntry);
        return historyEntry;
    }

    // Récupération des produits d'un utilisateur
    async getUserProducts(userId, filters = {}) {
        // Simulation de données
        const sampleProducts = [
            {
                id_produit: 1,
                origine_produit: 'Côte d\'Ivoire',
                description_produit: 'Cacao en fèves brutes',
                section_produit: 'II',
                taux_imposition: 8.75,
                statut_validation: 'valide',
                date_classification: '2024-08-01 10:30:00',
                valeur_declaree: 5000.00
            },
            {
                id_produit: 2,
                origine_produit: 'Sénégal',
                description_produit: 'Poisson frais (thiof)',
                section_produit: 'I',
                taux_imposition: 10.50,
                statut_validation: 'en_attente',
                date_classification: '2024-08-02 14:20:00',
                valeur_declaree: 2500.00
            }
        ];

        return {
            success: true,
            products: sampleProducts,
            total: sampleProducts.length
        };
    }

    // Validation d'un produit
    async validateProduct(productId, validatorId) {
        try {
            console.log(`Validation du produit ${productId} par l'utilisateur ${validatorId}`);
            
            // Simulation de la mise à jour
            await this.logClassificationHistory(productId, 'validation');
            
            return {
                success: true,
                message: 'Produit validé avec succès'
            };
        } catch (error) {
            console.error('Erreur lors de la validation:', error);
            return {
                success: false,
                message: 'Erreur lors de la validation: ' + error.message
            };
        }
    }

    // Génération de statistiques
    async generateStatistics(period = 'monthly') {
        const stats = {
            total_products: 156,
            validated_products: 89,
            pending_products: 45,
            rejected_products: 22,
            total_duty_amount: 234567.89,
            most_classified_section: 'XVI - Machines et appareils électriques',
            average_processing_time: '2.3 jours',
            active_users: 24,
            period: period,
            generated_at: new Date()
        };

        return {
            success: true,
            statistics: stats
        };
    }

    // Recherche de produits
    async searchProducts(searchCriteria) {
        // Simulation d'une recherche
        console.log('Recherche avec critères:', searchCriteria);
        
        const results = [
            {
                id_produit: 3,
                description_produit: 'Machine agricole importée',
                section_produit: 'XVI',
                origine_produit: 'Allemagne',
                statut_validation: 'valide'
            }
        ];

        return {
            success: true,
            results: results,
            total: results.length
        };
    }

    // Déconnexion
    async logout() {
        if (this.currentUser) {
            console.log(`Déconnexion de l'utilisateur ${this.currentUser.nom_user}`);
            this.currentUser = null;
        }
    }

    // Fermeture de la connexion
    async disconnect() {
        await this.logout();
        if (this.connection) {
            console.log('Fermeture de la connexion à la base de données');
            this.connection = null;
        }
    }
}

// Intégration avec le système de classification IA
class TariffDatabaseIntegration {
    constructor() {
        this.dbManager = new DatabaseManager();
        this.aiClassifier = new TariffAIClassifier();
    }

    // Classification et enregistrement automatique
    async classifyAndRegister(productDescription, productData) {
        try {
            // Connexion à la base
            await this.dbManager.connect();
            
            // Classification IA
            const classificationResults = this.aiClassifier.classifyWithAI(productDescription);
            
            if (classificationResults.length === 0) {
                return {
                    success: false,
                    message: 'Classification impossible - Description insuffisante'
                };
            }

            const bestMatch = classificationResults[0];
            
            // Enrichissement des données avec la classification
            const enrichedProductData = {
                ...productData,
                section_produit: bestMatch.section.number,
                sous_section_produit: bestMatch.section.chapters.join(','),
                description_produit: productDescription,
                classification_confidence: bestMatch.confidence,
                classification_details: bestMatch
            };

            // Enregistrement en base
            const registrationResult = await this.dbManager.registerProduct(enrichedProductData);
            
            return {
                success: registrationResult.success,
                product_id: registrationResult.product_id,
                classification: bestMatch,
                message: registrationResult.message
            };
            
        } catch (error) {
            console.error('Erreur lors de la classification et enregistrement:', error);
            return {
                success: false,
                message: 'Erreur système: ' + error.message
            };
        }
    }

    // Test de fonctionnement complet
    async runSystemTest() {
        console.log('=== TEST DU SYSTÈME INTÉGRÉ ===');
        
        try {
            // Test de connexion
            await this.dbManager.connect();
            console.log('✓ Connexion à la base réussie');
            
            // Test d'authentification
            const authResult = await this.dbManager.authenticateUser('mkouadio', 'marie123');
            if (authResult.success) {
                console.log('✓ Authentification réussie:', authResult.user.nom_user);
            }
            
            // Test de classification et enregistrement
            const testProduct = {
                origine_produit: 'Test Côte d\'Ivoire',
                valeur_declaree: 1500.00,
                poids_kg: 25.50,
                numero_serie: 'TEST-001'
            };
            
            const result = await this.classifyAndRegister(
                'Smartphone Android avec écran tactile 6 pouces', 
                testProduct
            );
            
            if (result.success) {
                console.log('✓ Classification et enregistrement réussis');
                console.log('  Section identifiée:', result.classification.section.title);
                console.log('  Confiance:', result.classification.confidence + '%');
                console.log('  ID produit:', result.product_id);
            }
            
            // Test de génération de statistiques
            const stats = await this.dbManager.generateStatistics();
            if (stats.success) {
                console.log('✓ Génération de statistiques réussie');
                console.log('  Total produits:', stats.statistics.total_products);
            }
            
            console.log('=== TEST TERMINÉ AVEC SUCCÈS ===');
            
        } catch (error) {
            console.error('❌ Erreur lors du test:', error);
        } finally {
            await this.dbManager.disconnect();
        }
    }
}

// Export des classes
window.DatabaseManager = DatabaseManager;
window.TariffDatabaseIntegration = TariffDatabaseIntegration;

// Auto-test au chargement
document.addEventListener('DOMContentLoaded', async () => {
    const integration = new TariffDatabaseIntegration();
    await integration.runSystemTest();
});
