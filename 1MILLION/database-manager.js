// Gestionnaire de base de données pour le système de classification
// database-manager.js

class DatabaseManager {
    constructor() {
        // URLs cohérentes avec votre structure
        this.possibleUrls = [
            './api.php',                                                             // Chemin relatif
            'api.php',                                                               // Alternative
            'http://localhost/Classification_Tarifaire_CEDEAO/1MILLION/api.php'     // Chemin absolu MAMP
        ];
        
        // ✅ LIGNE MANQUANTE AJOUTÉE :
        this.apiUrl = null;
        
        this.currentUser = null;
        this.loadCurrentUser();
    }

    // ✅ MÉTHODE AJOUTÉE :
    async findWorkingUrl() {
        for (const url of this.possibleUrls) {
            try {
                const response = await fetch(url + '?action=test_connection');
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        this.apiUrl = url;
                        console.log(`✅ URL fonctionnelle trouvée: ${url}`);
                        return true;
                    }
                }
            } catch (error) {
                console.log(`❌ ${url}: ${error.message}`);
            }
        }
        console.error('❌ Aucune URL API fonctionnelle trouvée');
        return false;
    }

    // ✅ MÉTHODE CORRIGÉE :
    async makeRequest(method, action, data = null) {
        // S'assurer qu'on a une URL qui fonctionne
        if (!this.apiUrl) {
            const found = await this.findWorkingUrl();
            if (!found) {
                throw new Error('Aucune API accessible');
            }
        }

        try {
            const config = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (data) {
                config.body = JSON.stringify({
                    action: action,
                    ...data
                });
            }

            const url = method === 'GET' && action ? 
                `${this.apiUrl}?action=${action}${data ? '&' + new URLSearchParams(data).toString() : ''}` : 
                this.apiUrl;

            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();
            return result;
            
        } catch (error) {
            console.error('Erreur API:', error);
            throw error;
        }
    }

    // Authentification utilisateur
    async authenticateUser(email, password) {
        try {
            const result = await this.makeRequest('POST', 'login', {
                email: email,
                password: password
            });

            if (result.success) {
                this.currentUser = result.user;
                this.saveCurrentUser(result.user);
            }

            return result;
        } catch (error) {
            console.error('Erreur authentification:', error);
            return { success: false, message: error.message };
        }
    }

    // Enregistrer un nouvel utilisateur
    async registerUser(userData) {
        try {
            return await this.makeRequest('POST', 'register_user', userData);
        } catch (error) {
            console.error('Erreur enregistrement:', error);
            return { success: false, message: error.message };
        }
    }

    // Sauvegarder un produit classifié (NOUVELLE MÉTHODE)
    async saveClassifiedProduct(productData) {
        try {
            console.log('Envoi des données produit:', productData);
            
            const result = await this.makeRequest('POST', 'save_classified_product', {
                product: productData
            });
            
            console.log('Réponse API:', result);
            return result;
            
        } catch (error) {
            console.error('Erreur sauvegarde produit classifié:', error);
            return { success: false, message: error.message };
        }
    }

    // Sauvegarder un produit générique (NOUVELLE MÉTHODE)
    async saveProduct(productData) {
        try {
            console.log('Sauvegarde produit générique:', productData);
            
            const result = await this.makeRequest('POST', 'save_product', {
                product: productData
            });
            
            console.log('Réponse sauvegarde:', result);
            return result;
            
        } catch (error) {
            console.error('Erreur sauvegarde produit:', error);
            return { success: false, message: error.message };
        }
    }

    // Sauvegarder une classification temporaire
    async saveTemporaryClassification(productData, classificationResult) {
        try {
            // Mapper les données pour correspondre à la structure de la base
            const mappedData = {
                origine_produit: productData.origine_produit || productData.origin || 'Non spécifié',
                description_produit: productData.description_produit || productData.description,
                numero_serie: productData.numero_serie,
                is_groupe: productData.is_groupe || false,
                nombre_produits: productData.nombre_produits || 1,
                taux_imposition: this.getTaxRateForSection(classificationResult.section?.number || 'I', classificationResult.code),
                section_produit: classificationResult.section?.number || 'I',
                sous_section_produit: productData.sous_section_produit,
                code_tarifaire: classificationResult.code || null,
                valeur_declaree: productData.valeur_declaree || productData.value || 0,
                poids_kg: productData.poids_kg || 0,
                unite_mesure: productData.unite_mesure || 'unité',
                statut_validation: (classificationResult.confidence || 0) > 80 ? 'valide' : 'en_attente',
                commentaires: productData.commentaires || `Classification IA - Confiance: ${classificationResult.confidence || 0}%`
            };

            const result = await this.makeRequest('POST', 'save_classified_product', {
                product: mappedData
            });

            if (result.success) {
                // Ajouter les données complètes pour l'interface
                result.classification = {
                    ...mappedData,
                    id_produit: result.product_id,
                    date_classification: new Date().toISOString()
                };
            }

            return result;
            
        } catch (error) {
            console.error('Erreur sauvegarde temporaire:', error);
            return { success: false, message: error.message };
        }
    }

    // NOUVEAU: Sauvegarder un paquet de produits
    async savePackage(packageData) {
        try {
            const result = await this.makeRequest('POST', 'save_package', {
                package: packageData
            });
            return result;
        } catch (error) {
            console.error('Erreur sauvegarde paquet:', error);
            return { success: false, message: error.message };
        }
    }

    // Valider et enregistrer un produit
    async validateAndRegisterProduct(productId, isValid) {
        try {
            if (!this.currentUser) {
                throw new Error('Utilisateur non connecté');
            }

            const result = await this.makeRequest('POST', 'validate_product', {
                product_id: productId,
                validator_id: this.currentUser.user_id
            });

            return result;
            
        } catch (error) {
            console.error('Erreur validation:', error);
            return { success: false, message: error.message };
        }
    }

    // Récupérer les taux tarifaires
    async getTariffRates() {
        try {
            return await this.makeRequest('GET', 'get_tariff_rates');
        } catch (error) {
            console.error('Erreur récupération taux:', error);
            return { success: false, message: error.message };
        }
    }

    // Récupérer les classifications
    async getClassifications(userId = null, status = null) {
        try {
            const params = {};
            if (userId) params.user_id = userId;
            if (status) params.status = status;

            return await this.makeRequest('GET', 'get_classifications', params);
        } catch (error) {
            console.error('Erreur récupération classifications:', error);
            return { success: false, message: error.message };
        }
    }

    // Récupérer les statistiques utilisateur
    async getUserStats(userId) {
        try {
            return await this.makeRequest('GET', 'get_user_stats', { user_id: userId });
        } catch (error) {
            console.error('Erreur statistiques utilisateur:', error);
            return { success: false, message: error.message };
        }
    }

    // Mettre à jour un produit
    async updateProduct(productId, updates) {
        try {
            return await this.makeRequest('PUT', 'update_product', {
                product_id: productId,
                updates: updates
            });
        } catch (error) {
            console.error('Erreur mise à jour produit:', error);
            return { success: false, message: error.message };
        }
    }

    // Supprimer un produit
    async deleteProduct(productId) {
        try {
            return await this.makeRequest('DELETE', 'delete_product', {
                product_id: productId
            });
        } catch (error) {
            console.error('Erreur suppression produit:', error);
            return { success: false, message: error.message };
        }
    }

    // Test de connexion
    async testConnection() {
        try {
            return await this.makeRequest('GET', 'test_connection');
        } catch (error) {
            console.error('Erreur test connexion:', error);
            return { success: false, message: error.message };
        }
    }

    // Méthodes utilitaires pour la gestion des utilisateurs
    saveCurrentUser(user) {
        localStorage.setItem('current_user', JSON.stringify(user));
        this.currentUser = user;
    }

    loadCurrentUser() {
        const stored = localStorage.getItem('current_user');
        if (stored) {
            this.currentUser = JSON.parse(stored);
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    logout() {
        localStorage.removeItem('current_user');
        this.currentUser = null;
        return Promise.resolve({ success: true });
    }

    // Méthode utilitaire pour obtenir le taux d'imposition d'une section (CORRIGÉE selon codes tarifaires spécifiques)
    getTaxRateForSection(section, tariffCode = null) {
        // Si on a un code tarifaire spécifique, l'utiliser en priorité
        if (tariffCode) {
            const specificRate = this.getSpecificTariffRate(tariffCode);
            if (specificRate !== null) {
                return specificRate;
            }
        }
        
        // Sinon, utiliser les taux par section (moyenne des codes de la section)
        const sectionAverageRates = {
            'I': 19,   // Moyenne des codes 0201-0210, 0301-0307, etc.
            'II': 17,  // Moyenne des codes 0601-0614, 0701-0714, etc.
            'III': 20, // Code 1501-1522
            'IV': 23,  // Moyenne des codes 1601-1624, 1701-1724, etc.
            'V': 8,    // Moyenne des codes 2501-2529, 2601-2621, 2701-2716
            'VI': 11,  // Moyenne des codes 2801-2853, 2901-2942, etc.
            'VII': 15, // Codes 3901-3926, 4001-4017
            'VIII': 20, 'IX': 15, 'X': 15, 'XI': 20, 'XII': 25, 'XIII': 15,
            'XIV': 10, 'XV': 15, 'XVI': 15, 'XVII': 20, 'XVIII': 15, 'XIX': 10,
            'XX': 20, 'XXI': 5
        };
        
        return sectionAverageRates[section] || 15;
    }

    // Fonction pour obtenir le taux spécifique d'un code tarifaire
    getSpecificTariffRate(tariffCode) {
        // Taux spécifiques extraits du fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt
        const specificRates = {
            // Section I - Chapitre 02 (Viandes)
            '0201.10.00.00': 35, '0201.20.00.00': 35, '0201.30.00.00': 35,
            '0202.10.00.00': 35, '0202.20.00.00': 35, '0202.30.00.00': 35,
            '0203.11.00.00': 35, '0203.12.00.00': 35, '0203.19.00.00': 35,
            '0203.21.00.00': 35, '0203.22.00.00': 35, '0203.29.00.00': 35,
            '0204.10.00.00': 35, '0204.21.00.00': 35, '0204.22.00.00': 35,
            '0204.23.00.00': 35, '0204.30.00.00': 35, '0204.41.00.00': 35,
            '0204.42.00.00': 35, '0204.43.00.00': 35, '0204.50.00.00': 35,
            '0205.00.00.00': 20, // Viandes chevalines - taux différent !
            '0206.10.00.00': 35, '0206.21.00.00': 35, '0206.22.00.00': 35,
            '0206.29.00.00': 35, '0206.30.00.00': 35, '0206.41.00.00': 35,
            '0206.49.00.00': 35, '0206.80.00.00': 35, '0206.90.00.00': 35,
            '0207.11.00.00': 35, '0207.12.00.00': 35, '0207.13.00.00': 35,
            '0207.14.00.00': 35, '0207.24.00.00': 35, '0207.25.00.00': 35,
            '0207.26.00.00': 35, '0207.27.00.00': 35, '0207.41.00.00': 35,
            '0207.42.00.00': 35, '0207.43.00.00': 35, '0207.44.00.00': 35,
            '0207.45.00.00': 35, '0207.51.00.00': 35, '0207.52.00.00': 35,
            '0207.53.00.00': 35, '0207.54.00.00': 35, '0207.55.00.00': 35,
            '0207.60.00.00': 35, '0208.10.00.00': 20, '0208.30.00.00': 20,
            '0208.40.00.00': 20, '0208.50.00.00': 20, '0208.60.00.00': 20,
            '0208.90.00.00': 20, '0209.10.00.00': 20, '0209.90.00.00': 20,
            '0210.11.00.00': 20, '0210.12.00.00': 20, '0210.19.00.00': 20,
            '0210.20.00.00': 35, '0210.91.00.00': 20, '0210.92.00.00': 20,
            '0210.93.00.00': 20, '0210.99.00.00': 20,
            
            // Section I - Chapitre 03 (Poissons)
            '0301.11.00.00': 10, '0301.19.00.00': 10, '0301.91.10.00': 5,
            '0301.91.90.00': 10, '0301.92.10.00': 5, '0301.92.90.00': 10,
            '0301.93.10.00': 5, '0301.93.90.00': 10, '0301.94.10.00': 5,
            '0301.94.90.00': 10, '0301.95.10.00': 5, '0301.95.90.00': 10,
            '0301.99.10.00': 5, '0301.99.90.00': 10,
            '0302.11.00.00': 10, '0302.13.00.00': 10, '0302.14.00.00': 10,
            '0302.19.00.00': 10, '0302.21.00.00': 10, '0302.22.00.00': 10,
            '0302.23.00.00': 10, '0302.24.00.00': 10, '0302.29.00.00': 10,
            '0302.31.00.00': 10, '0302.32.00.00': 10, '0302.33.00.00': 10,
            '0302.34.00.00': 10, '0302.35.00.00': 10, '0302.36.00.00': 10,
            '0302.39.00.00': 10, '0302.41.00.00': 10, '0302.42.00.00': 10,
            
            // Section VI - Chapitre 28 (Produits chimiques)
            '2843.10.00.00': 5, '2843.21.00.00': 5, '2843.29.00.00': 5,
            '2843.30.00.00': 5, '2843.90.00.00': 5, '2844.10.00.00': 5,
            '2844.20.00.00': 5, '2844.30.00.00': 5, '2844.41.00.00': 5,
            '2844.42.00.00': 5, '2844.43.00.00': 5, '2844.44.00.00': 5,
            '2844.50.00.00': 5, '2845.10.00.00': 5, '2845.20.00.00': 5,
            '2845.30.00.00': 5, '2845.40.00.00': 5, '2845.90.00.00': 5,
            '2846.10.00.00': 5, '2846.90.00.00': 5, '2847.00.00.00': 5,
            '2849.10.00.00': 5, '2849.20.00.00': 5, '2849.90.00.00': 5,
            '2850.00.00.00': 5
        };
        
        return specificRates[tariffCode] || null;
    }

    // Méthode pour générer un code tarifaire générique
    generateTariffCode(sectionNumber) {
        const sectionCodes = {
            'I': '0101', 'II': '0601', 'III': '1501', 'IV': '1601', 'V': '2501',
            'VI': '2801', 'VII': '3901', 'VIII': '4101', 'IX': '4401', 'X': '4701',
            'XI': '5001', 'XII': '6401', 'XIII': '6801', 'XIV': '7101', 'XV': '7201',
            'XVI': '8401', 'XVII': '8601', 'XVIII': '9001', 'XIX': '9301', 'XX': '9401',
            'XXI': '9701'
        };
        
        return (sectionCodes[sectionNumber] || '9999') + ".00.00.00";
    }

    // Méthode pour formater les données pour l'historique local
    formatForHistory(description, classificationResult) {
        return {
            timestamp: new Date().toISOString(),
            description: description,
            section: classificationResult.section?.number || 'Inconnu',
            title: classificationResult.section?.title || 'Section inconnue',
            confidence: classificationResult.confidence || 0,
            code: classificationResult.code || this.generateTariffCode(classificationResult.section?.number),
            user_id: this.currentUser?.user_id || null
        };
    }

    // Méthode pour sauvegarder dans l'historique local (fallback)
    saveToLocalHistory(description, classificationResult) {
        try {
            let history = JSON.parse(localStorage.getItem('classification_history') || '[]');
            
            const entry = this.formatForHistory(description, classificationResult);
            
            // Ajouter au début de l'historique
            history.unshift(entry);
            
            // Limiter à 100 entrées
            if (history.length > 100) {
                history = history.slice(0, 100);
            }
            
            localStorage.setItem('classification_history', JSON.stringify(history));
            
            return entry;
            
        } catch (error) {
            console.error('Erreur sauvegarde historique local:', error);
            return null;
        }
    }

    // Méthode pour récupérer l'historique local
    getLocalHistory() {
        try {
            return JSON.parse(localStorage.getItem('classification_history') || '[]');
        } catch (error) {
            console.error('Erreur récupération historique local:', error);
            return [];
        }
    }

    // Méthode pour nettoyer l'historique local
    clearLocalHistory() {
        localStorage.removeItem('classification_history');
    }

    // Méthode pour synchroniser l'historique local avec la base de données
    async syncLocalHistoryToDatabase() {
        if (!this.currentUser) {
            console.warn('Utilisateur non connecté - synchronisation impossible');
            return { success: false, message: 'Utilisateur non connecté' };
        }

        try {
            const localHistory = this.getLocalHistory();
            const syncResults = [];

            for (const entry of localHistory) {
                if (!entry.synced) {
                    const productData = {
                        origine_produit: 'Synchronisation locale',
                        description_produit: entry.description,
                        section_produit: entry.section,
                        code_tarifaire: entry.code,
                        taux_imposition: this.getTaxRateForSection(entry.section, entry.code),
                        valeur_declaree: 0,
                        statut_validation: 'valide',
                        commentaires: `Synchronisation depuis historique local - ${entry.timestamp}`
                    };

                    const result = await this.saveClassifiedProduct(productData);
                    syncResults.push({ entry, result });

                    if (result.success) {
                        entry.synced = true;
                        entry.database_id = result.product_id;
                    }
                }
            }

            // Sauvegarder l'historique mis à jour
            localStorage.setItem('classification_history', JSON.stringify(localHistory));

            return {
                success: true,
                message: `Synchronisation terminée: ${syncResults.filter(r => r.result.success).length}/${syncResults.length} entrées synchronisées`,
                results: syncResults
            };

        } catch (error) {
            console.error('Erreur synchronisation:', error);
            return { success: false, message: error.message };
        }
    }

    // Méthode pour obtenir des statistiques rapides
    getQuickStats() {
        const history = this.getLocalHistory();
        const stats = {
            total: history.length,
            today: 0,
            sections: {},
            averageConfidence: 0
        };

        const today = new Date().toDateString();
        let totalConfidence = 0;

        history.forEach(entry => {
            // Compter les classifications d'aujourd'hui
            if (new Date(entry.timestamp).toDateString() === today) {
                stats.today++;
            }

            // Compter par section
            stats.sections[entry.section] = (stats.sections[entry.section] || 0) + 1;

            // Confiance moyenne
            totalConfidence += entry.confidence || 0;
        });

        stats.averageConfidence = history.length > 0 ? Math.round(totalConfidence / history.length) : 0;

        // Top 3 des sections les plus utilisées
        stats.topSections = Object.entries(stats.sections)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([section, count]) => ({ section, count }));

        return stats;
    }

    // Méthode pour exporter les données
    async exportData(format = 'json', includeLocal = true) {
        try {
            let data = {
                database: [],
                local: [],
                exported_at: new Date().toISOString(),
                user: this.currentUser
            };

            // Récupérer les données de la base si connecté
            if (this.currentUser) {
                const dbResult = await this.getClassifications(this.currentUser.user_id);
                if (dbResult.success) {
                    data.database = dbResult.classifications;
                }
            }

            // Ajouter l'historique local si demandé
            if (includeLocal) {
                data.local = this.getLocalHistory();
            }

            if (format === 'csv') {
                return this.convertToCSV(data);
            }

            return JSON.stringify(data, null, 2);

        } catch (error) {
            console.error('Erreur export:', error);
            throw error;
        }
    }

    // Méthode utilitaire pour convertir en CSV
    convertToCSV(data) {
        const headers = [
            'Source', 'ID', 'Description', 'Section', 'Code', 'Taux', 'Confiance', 
            'Statut', 'Date', 'Origine', 'Valeur'
        ];

        const rows = [];

        // Ajouter les données de la base
        data.database.forEach(item => {
            rows.push([
                'Database',
                item.id_produit,
                item.description_produit,
                item.section_produit,
                item.code_tarifaire || '',
                item.taux_imposition + '%',
                '',
                item.statut_validation,
                item.date_classification,
                item.origine_produit,
                item.valeur_declaree || 0
            ]);
        });

        // Ajouter les données locales
        data.local.forEach(item => {
            rows.push([
                'Local',
                item.database_id || '',
                item.description,
                item.section,
                item.code,
                this.getTaxRateForSection(item.section, item.code) + '%',
                item.confidence + '%',
                item.synced ? 'Synchronisé' : 'Local',
                item.timestamp,
                'Local',
                ''
            ]);
        });

        return [headers, ...rows]
            .map(row => row.map(cell => `"${cell}"`).join(';'))
            .join('\n');
    }
} // ✅ FERMETURE CORRECTE DE LA CLASSE

// Export pour utilisation globale
if (typeof window !== 'undefined') {
    window.DatabaseManager = DatabaseManager;
}

// Export pour Node.js (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DatabaseManager;
}