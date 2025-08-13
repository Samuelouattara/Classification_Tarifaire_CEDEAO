// 🌉 BRIDGE RASA ↔ SYSTÈME CEDEAO EXISTANT
// Interface JavaScript pour communication avec le bot RASA spécialisé douane

class RasaCedeoBridge {
    constructor() {
        this.rasaEndpoint = 'http://localhost:5005/webhooks/rest/webhook';
        this.actionEndpoint = 'http://localhost:5055/webhook';
        this.cedeoApiEndpoint = 'http://localhost:8000/api/cedeo';
        this.sessionId = this.generateSessionId();
    }

    /**
     * Génération d'un ID de session unique
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Communication avec RASA pour classification
     */
    async classifyWithRasa(description) {
        try {
            const payload = {
                sender: this.sessionId,
                message: `Classifie ce produit: ${description}`
            };

            console.log('🔍 Envoi à RASA:', payload);

            const response = await fetch(this.rasaEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Erreur RASA: ${response.status}`);
            }

            const rasaResponse = await response.json();
            console.log('✅ Réponse RASA:', rasaResponse);

            return this.processRasaResponse(rasaResponse);
        } catch (error) {
            console.error('❌ Erreur communication RASA:', error);
            return {
                success: false,
                error: error.message,
                fallback: true
            };
        }
    }

    /**
     * Traitement de la réponse RASA
     */
    processRasaResponse(rasaResponse) {
        if (!rasaResponse || rasaResponse.length === 0) {
            return {
                success: false,
                error: 'Aucune réponse de RASA',
                fallback: true
            };
        }

        const lastMessage = rasaResponse[rasaResponse.length - 1];
        
        // Extraction des informations de classification
        const classificationInfo = this.extractClassificationInfo(lastMessage.text);
        
        return {
            success: true,
            message: lastMessage.text,
            classification: classificationInfo,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };
    }

    /**
     * Extraction des informations de classification depuis la réponse RASA
     */
    extractClassificationInfo(message) {
        const classification = {
            section: null,
            chapter: null,
            tariff_code: null,
            tax_rate: null,
            confidence: null,
            validation_status: null,
            audit_id: null
        };

        // Extraction par regex
        const sectionMatch = message.match(/Section\s*:\s*([A-Z]+)/i);
        if (sectionMatch) classification.section = sectionMatch[1];

        const chapterMatch = message.match(/Chapitre\s*:\s*(\d+)/i);
        if (chapterMatch) classification.chapter = chapterMatch[1];

        const codeMatch = message.match(/Code tarifaire\s*:\s*([\d\.]+)/i);
        if (codeMatch) classification.tariff_code = codeMatch[1];

        const rateMatch = message.match(/Taux d'imposition\s*:\s*([\d\.]+)%/i);
        if (rateMatch) classification.tax_rate = parseFloat(rateMatch[1]);

        const confidenceMatch = message.match(/Confiance\s*:\s*([\d\.]+)%/i);
        if (confidenceMatch) classification.confidence = parseFloat(confidenceMatch[1]);

        const statusMatch = message.match(/Statut\s*:\s*([a-zA-Z_]+)/i);
        if (statusMatch) classification.validation_status = statusMatch[1];

        const auditMatch = message.match(/Audit ID\s*:\s*([a-zA-Z0-9\-]+)/i);
        if (auditMatch) classification.audit_id = auditMatch[1];

        return classification;
    }

    /**
     * Demande de taux d'imposition via RASA
     */
    async getTaxRateWithRasa(tariffCode) {
        try {
            const payload = {
                sender: this.sessionId,
                message: `Quel est le taux pour ${tariffCode}`
            };

            const response = await fetch(this.rasaEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const rasaResponse = await response.json();
            return this.processRasaResponse(rasaResponse);
        } catch (error) {
            console.error('❌ Erreur demande taux RASA:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calcul des droits de douane via RASA
     */
    async calculateDutiesWithRasa(value, productDescription) {
        try {
            const payload = {
                sender: this.sessionId,
                message: `Calcule les droits pour ${value}€ de ${productDescription}`
            };

            const response = await fetch(this.rasaEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const rasaResponse = await response.json();
            return this.processRasaResponse(rasaResponse);
        } catch (error) {
            console.error('❌ Erreur calcul droits RASA:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validation des règles CEDEAO via RASA
     */
    async validateCedeoRulesWithRasa(tariffCode) {
        try {
            const payload = {
                sender: this.sessionId,
                message: `Valide règles CEDEAO ${tariffCode}`
            };

            const response = await fetch(this.rasaEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const rasaResponse = await response.json();
            return this.processRasaResponse(rasaResponse);
        } catch (error) {
            console.error('❌ Erreur validation CEDEAO RASA:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Intégration avec votre système existant
     */
    async integrateWithExistingSystem(classificationResult) {
        try {
            // Envoi des résultats à votre API existante
            const response = await fetch(this.cedeoApiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    classification: classificationResult,
                    source: 'RASA_BOT',
                    timestamp: new Date().toISOString(),
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error(`Erreur API CEDEAO: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ Intégration système existant:', result);
            return result;
        } catch (error) {
            console.error('❌ Erreur intégration système:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fallback vers votre système existant si RASA échoue
     */
    async fallbackToExistingSystem(description) {
        console.log('🔄 Fallback vers système existant pour:', description);
        
        // Utilisation de votre système de classification existant
        // Remplacez par l'appel à votre fonction de classification actuelle
        return {
            success: true,
            source: 'EXISTING_SYSTEM',
            message: 'Classification via système existant (fallback)',
            classification: {
                section: 'XX',
                chapter: '99',
                tariff_code: '9999.00.00.00',
                tax_rate: 20,
                confidence: 50,
                validation_status: 'requires_human_review',
                audit_id: 'fallback_' + Date.now()
            }
        };
    }

    /**
     * Interface principale pour classification
     */
    async classifyProduct(description) {
        console.log('🚀 Début classification RASA pour:', description);

        // Tentative avec RASA
        const rasaResult = await this.classifyWithRasa(description);

        if (rasaResult.success) {
            // Intégration avec le système existant
            await this.integrateWithExistingSystem(rasaResult.classification);
            return rasaResult;
        } else {
            // Fallback vers le système existant
            console.log('⚠️ RASA échec, fallback activé');
            return await this.fallbackToExistingSystem(description);
        }
    }

    /**
     * Test de connectivité RASA
     */
    async testRasaConnection() {
        try {
            const testPayload = {
                sender: 'test_session',
                message: 'Test de connexion'
            };

            const response = await fetch(this.rasaEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });

            return {
                success: response.ok,
                status: response.status,
                message: response.ok ? 'Connexion RASA OK' : 'Connexion RASA échouée'
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                message: 'Connexion RASA impossible'
            };
        }
    }
}

// Export pour utilisation dans votre système
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RasaCedeoBridge;
}

// Interface globale pour utilisation dans le navigateur
if (typeof window !== 'undefined') {
    window.RasaCedeoBridge = RasaCedeoBridge;
}
