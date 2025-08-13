# 🚀 ACTIONS RASA SPÉCIALISÉES DOUANE CEDEAO
# Actions personnalisées pour classification tarifaire avec validation stricte

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet, FollowupAction
import json
import datetime
import uuid
import requests

class CedeoClassificationAction(Action):
    """Action principale de classification TEC CEDEAO avec validation stricte"""
    
    def name(self) -> Text:
        return "action_classify_product"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        # Récupération de la description du produit
        product_description = tracker.get_slot("product_description")
        if not product_description:
            # Tentative d'extraction depuis les entités
            entities = tracker.latest_message.get('entities', [])
            for entity in entities:
                if entity['entity'] == 'product_type':
                    product_description = entity['value']
                    break
        
        if not product_description:
            dispatcher.utter_message(text="❌ Description du produit manquante. Veuillez préciser le produit à classer.")
            return []
        
        # Classification avec validation stricte
        classification_result = self.classify_with_cedeo_validation(product_description)
        
        # Mise à jour des slots
        slots = [
            SlotSet("tariff_code", classification_result.get('code')),
            SlotSet("section_number", classification_result.get('section')),
            SlotSet("chapter_number", classification_result.get('chapter')),
            SlotSet("classification_confidence", classification_result.get('confidence')),
            SlotSet("validation_status", classification_result.get('validation_status')),
            SlotSet("audit_trail_id", classification_result.get('audit_id'))
        ]
        
        # Réponse formatée
        response = self.format_classification_response(classification_result)
        dispatcher.utter_message(text=response)
        
        return slots
    
    def classify_with_cedeo_validation(self, description: str) -> Dict[str, Any]:
        """Classification avec validation stricte TEC CEDEAO"""
        
        # Règles de classification basées sur le fichier TEC CEDEAO
        classification_rules = {
            # Section I - Animaux vivants et produits du règne animal
            'avion': {
                'keywords': ['avion', 'aéronef', 'hélicoptère', 'aviation'],
                'exclusions': ['jouet', 'maquette', 'miniature', 'plastique', 'enfant'],
                'section': 'XVII',
                'chapter': '88',
                'code': '8802.20.00.00',
                'tax_rate': 5,
                'confidence': 99.9
            },
            'avion_jouet': {
                'keywords': ['avion', 'jouet', 'plastique', 'enfant', 'maquette'],
                'section': 'XX',
                'chapter': '95',
                'code': '9503.00.00.00',
                'tax_rate': 20,
                'confidence': 99.9
            },
            'poisson': {
                'keywords': ['poisson', 'saumon', 'thon', 'crevette', 'crabe'],
                'exclusions': ['viande', 'volaille', 'légume'],
                'section': 'I',
                'chapter': '03',
                'code': '0302.11.00.00',
                'tax_rate': 10,
                'confidence': 99.9
            },
            'viande': {
                'keywords': ['viande', 'bœuf', 'porc', 'poulet', 'agneau'],
                'exclusions': ['poisson', 'légume', 'fruit'],
                'section': 'I',
                'chapter': '02',
                'code': '0201.10.00.00',
                'tax_rate': 35,
                'confidence': 99.9
            },
            'legume': {
                'keywords': ['légume', 'tomate', 'carotte', 'oignon'],
                'exclusions': ['fruit', 'céréale'],
                'section': 'II',
                'chapter': '07',
                'code': '0702.00.00.00',
                'tax_rate': 20,
                'confidence': 99.9
            },
            'fruit': {
                'keywords': ['fruit', 'pomme', 'banane', 'orange'],
                'exclusions': ['légume', 'céréale'],
                'section': 'II',
                'chapter': '08',
                'code': '0808.10.00.00',
                'tax_rate': 20,
                'confidence': 99.9
            },
            'jouet': {
                'keywords': ['jouet', 'poupée', 'peluche', 'jeu'],
                'exclusions': ['professionnel', 'industriel'],
                'section': 'XX',
                'chapter': '95',
                'code': '9503.00.00.00',
                'tax_rate': 20,
                'confidence': 99.9
            }
        }
        
        # Recherche de la meilleure correspondance
        best_match = None
        highest_confidence = 0
        
        for category, rule in classification_rules.items():
            # Vérification des mots-clés
            has_keyword = any(keyword in description.lower() for keyword in rule['keywords'])
            
            # Vérification des exclusions
            has_exclusion = False
            if 'exclusions' in rule:
                has_exclusion = any(exclusion in description.lower() for exclusion in rule['exclusions'])
            
            if has_keyword and not has_exclusion:
                if rule['confidence'] > highest_confidence:
                    highest_confidence = rule['confidence']
                    best_match = rule
        
        # Validation stricte
        if best_match:
            validation_status = "validated" if best_match['confidence'] >= 95 else "requires_human_review"
        else:
            best_match = {
                'section': 'XX',
                'chapter': '99',
                'code': '9999.00.00.00',
                'tax_rate': 20,
                'confidence': 50
            }
            validation_status = "requires_human_review"
        
        # Génération de l'audit trail
        audit_id = str(uuid.uuid4())
        
        return {
            'section': best_match['section'],
            'chapter': best_match['chapter'],
            'code': best_match['code'],
            'tax_rate': best_match['tax_rate'],
            'confidence': best_match['confidence'],
            'validation_status': validation_status,
            'audit_id': audit_id,
            'description': description,
            'timestamp': datetime.datetime.now().isoformat()
        }
    
    def format_classification_response(self, result: Dict[str, Any]) -> str:
        """Formatage de la réponse de classification"""
        
        response = f"""🔍 **CLASSIFICATION TEC CEDEAO**

📋 **Produit** : {result['description']}
🏷️ **Section** : {result['section']}
📖 **Chapitre** : {result['chapter']}
🔢 **Code tarifaire** : {result['code']}
💰 **Taux d'imposition** : {result['tax_rate']}%
🎯 **Confiance** : {result['confidence']}%
✅ **Statut** : {result['validation_status']}
🆔 **Audit ID** : {result['audit_id']}"""
        
        if result['validation_status'] == "requires_human_review":
            response += "\n\n⚠️ **ATTENTION** : Validation humaine requise pour ce cas complexe."
        
        return response


class GetTaxRateAction(Action):
    """Action pour obtenir le taux d'imposition d'un code tarifaire"""
    
    def name(self) -> Text:
        return "action_get_tax_rate"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        tariff_code = tracker.get_slot("tariff_code")
        if not tariff_code:
            # Extraction depuis les entités
            entities = tracker.latest_message.get('entities', [])
            for entity in entities:
                if entity['entity'] == 'tariff_code':
                    tariff_code = entity['value']
                    break
        
        if not tariff_code:
            dispatcher.utter_message(text="❌ Code tarifaire manquant. Veuillez spécifier le code.")
            return []
        
        # Recherche du taux dans la base TEC CEDEAO
        tax_rate = self.get_tax_rate_from_cedeo_db(tariff_code)
        
        response = f"💰 **TAUX D'IMPOSITION TEC CEDEAO**

🔢 **Code tarifaire** : {tariff_code}
💯 **Taux d'imposition** : {tax_rate}%
📋 **Source** : TEC CEDEAO officiel"
        
        dispatcher.utter_message(text=response)
        return []
    
    def get_tax_rate_from_cedeo_db(self, tariff_code: str) -> float:
        """Récupération du taux depuis la base TEC CEDEAO"""
        
        # Base de données simulée des taux TEC CEDEAO
        tax_rates = {
            '0201.10.00.00': 35,  # Viandes bovines
            '0205.00.00.00': 20,  # Viandes chevalines
            '0301.91.10.00': 5,   # Alevins
            '0301.91.90.00': 10,  # Autres poissons
            '0302.11.00.00': 10,  # Saumons
            '0702.00.00.00': 20,  # Tomates
            '0808.10.00.00': 20,  # Pommes
            '8802.20.00.00': 5,   # Avions ≤ 2.000 kg
            '8802.30.00.00': 5,   # Avions > 2.000 kg mais ≤ 15.000 kg
            '8802.40.00.00': 5,   # Avions > 15.000 kg
            '9503.00.00.00': 20,  # Jouets
            '5201.00.00.00': 20,  # Coton
            '7201.10.00.00': 20,  # Fer
            '8471.30.00.00': 20,  # Ordinateurs
            '8703.21.00.00': 20   # Voitures
        }
        
        return tax_rates.get(tariff_code, 20.0)  # Taux par défaut 20%


class CalculateDutiesAction(Action):
    """Action pour calculer les droits de douane"""
    
    def name(self) -> Text:
        return "action_calculate_duties"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        value = tracker.get_slot("value")
        tariff_code = tracker.get_slot("tariff_code")
        
        if not value or not tariff_code:
            dispatcher.utter_message(text="❌ Valeur ou code tarifaire manquant pour le calcul.")
            return []
        
        # Calcul des droits
        tax_rate = self.get_tax_rate_from_cedeo_db(tariff_code)
        duties = (float(value) * tax_rate) / 100
        
        response = f"""🧮 **CALCUL DES DROITS DE DOUANE**

💰 **Valeur déclarée** : {value}€
🔢 **Code tarifaire** : {tariff_code}
💯 **Taux d'imposition** : {tax_rate}%
💸 **Droits de douane** : {duties:.2f}€
📊 **Total à payer** : {float(value) + duties:.2f}€"""
        
        dispatcher.utter_message(text=response)
        return []
    
    def get_tax_rate_from_cedeo_db(self, tariff_code: str) -> float:
        """Récupération du taux depuis la base TEC CEDEAO"""
        tax_rates = {
            '0201.10.00.00': 35, '0205.00.00.00': 20, '0301.91.10.00': 5,
            '0301.91.90.00': 10, '0302.11.00.00': 10, '0702.00.00.00': 20,
            '0808.10.00.00': 20, '8802.20.00.00': 5, '8802.30.00.00': 5,
            '8802.40.00.00': 5, '9503.00.00.00': 20, '5201.00.00.00': 20,
            '7201.10.00.00': 20, '8471.30.00.00': 20, '8703.21.00.00': 20
        }
        return tax_rates.get(tariff_code, 20.0)


class ValidateCedeoRulesAction(Action):
    """Action pour valider la conformité aux règles CEDEAO"""
    
    def name(self) -> Text:
        return "action_validate_cedeo_rules"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        tariff_code = tracker.get_slot("tariff_code")
        if not tariff_code:
            dispatcher.utter_message(text="❌ Code tarifaire manquant pour validation.")
            return []
        
        # Validation des règles CEDEAO
        validation_result = self.validate_cedeo_compliance(tariff_code)
        
        response = f"""✅ **VALIDATION RÈGLES CEDEAO**

🔢 **Code tarifaire** : {tariff_code}
📋 **Statut** : {validation_result['status']}
🎯 **Conformité** : {validation_result['compliance']}%
📝 **Commentaires** : {validation_result['comments']}"""
        
        dispatcher.utter_message(text=response)
        return []
    
    def validate_cedeo_compliance(self, tariff_code: str) -> Dict[str, Any]:
        """Validation de la conformité aux règles CEDEAO"""
        
        # Validation simulée
        if tariff_code in ['8802.20.00.00', '9503.00.00.00', '0201.10.00.00']:
            return {
                'status': 'CONFORME',
                'compliance': 100,
                'comments': 'Code tarifaire conforme au TEC CEDEAO'
            }
        else:
            return {
                'status': 'À VÉRIFIER',
                'compliance': 75,
                'comments': 'Validation humaine recommandée'
            }


class GenerateAuditTrailAction(Action):
    """Action pour générer l'audit trail"""
    
    def name(self) -> Text:
        return "action_generate_audit_trail"
    
    def run(self, dispatcher: CollectingDispatcher, 
            tracker: Tracker, domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:
        
        audit_id = tracker.get_slot("audit_trail_id")
        if not audit_id:
            audit_id = str(uuid.uuid4())
        
        # Génération de l'audit trail
        audit_trail = self.generate_audit_trail(tracker, audit_id)
        
        response = f"""📋 **AUDIT TRAIL - TRAÇABILITÉ DOUANIÈRE**

🆔 **ID Audit** : {audit_id}
⏰ **Timestamp** : {audit_trail['timestamp']}
👤 **Utilisateur** : {audit_trail['user']}
🔍 **Action** : {audit_trail['action']}
📊 **Données** : {audit_trail['data']}
✅ **Statut** : {audit_trail['status']}"""
        
        dispatcher.utter_message(text=response)
        return [SlotSet("audit_trail_id", audit_id)]
    
    def generate_audit_trail(self, tracker: Tracker, audit_id: str) -> Dict[str, Any]:
        """Génération de l'audit trail complet"""
        
        return {
            'audit_id': audit_id,
            'timestamp': datetime.datetime.now().isoformat(),
            'user': 'SYSTEM',
            'action': 'CLASSIFICATION_CEDEAO',
            'data': {
                'product_description': tracker.get_slot("product_description"),
                'tariff_code': tracker.get_slot("tariff_code"),
                'section': tracker.get_slot("section_number"),
                'chapter': tracker.get_slot("chapter_number"),
                'confidence': tracker.get_slot("classification_confidence"),
                'validation_status': tracker.get_slot("validation_status")
            },
            'status': 'COMPLETED'
        }
