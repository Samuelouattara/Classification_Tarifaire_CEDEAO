#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bot de Classification CEDEAO - Version Simplifiée
=================================================

Version simplifiée et robuste du bot de classification CEDEAO
"""

import json
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# Création de l'application Flask
app = Flask(__name__)
CORS(app)

# Règles de classification CEDEAO
CEDEO_RULES = {
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
}

def normalize_text(text):
    """Normalise le texte pour la comparaison"""
    if not text:
        return ""
    return text.lower().strip()

def classify_product(product_name):
    """Classifie un produit selon les règles CEDEAO"""
    normalized_name = normalize_text(product_name)
    
    # Vérifier les règles absolues
    for keyword, rule in CEDEO_RULES['absolute'].items():
        if keyword in normalized_name:
            return {
                'product_name': product_name,
                'tariff_code': f"{rule['chapter']}0100",
                'section': rule['section'],
                'chapter': rule['chapter'],
                'tax_rate': rule['tax_rate'],
                'confidence': 0.95,
                'classification_method': 'absolute_rule',
                'timestamp': datetime.datetime.now().isoformat(),
                'matched_keyword': keyword
            }
    
    # Vérifier les règles par mots-clés
    for category, rule in CEDEO_RULES['keywords'].items():
        # Vérifier les exclusions
        excluded = any(exclusion in normalized_name for exclusion in rule['exclusions'])
        if excluded:
            continue
            
        # Vérifier les mots-clés
        matched = any(keyword in normalized_name for keyword in rule['keywords'])
        if matched:
            return {
                'product_name': product_name,
                'tariff_code': f"{rule['chapter']}0100",
                'section': rule['section'],
                'chapter': rule['chapter'],
                'tax_rate': rule['tax_rate'],
                'confidence': 0.85,
                'classification_method': 'keyword_rule',
                'timestamp': datetime.datetime.now().isoformat(),
                'matched_category': category
            }
    
    # Classification par défaut
    return {
        'product_name': product_name,
        'tariff_code': '999999',
        'section': 'XX',
        'chapter': '99',
        'tax_rate': 20.0,
        'confidence': 0.1,
        'classification_method': 'default',
        'timestamp': datetime.datetime.now().isoformat()
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de l'état du bot"""
    return jsonify({
        'status': 'healthy',
        'service': 'CEDEAO Classification Bot',
        'version': '1.0.0',
        'timestamp': datetime.datetime.now().isoformat()
    })

@app.route('/classify', methods=['POST'])
def classify():
    """Endpoint principal de classification"""
    try:
        data = request.get_json()
        product_name = data.get('product_name', '')
        
        if not product_name:
            return jsonify({
                'error': 'Nom du produit requis'
            }), 400
        
        result = classify_product(product_name)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/rules', methods=['GET'])
def get_rules():
    """Récupérer les règles de classification"""
    return jsonify(CEDEO_RULES)

@app.route('/test', methods=['GET'])
def test():
    """Test simple"""
    return jsonify({
        'message': 'Bot CEDEAO opérationnel',
        'timestamp': datetime.datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Démarrage du Bot CEDEAO...")
    print("📍 Endpoints disponibles:")
    print("   - GET  /health    - Vérification de l'état")
    print("   - POST /classify  - Classification de produits")
    print("   - GET  /rules     - Règles de classification")
    print("   - GET  /test      - Test simple")
    print("🌐 Serveur démarré sur http://localhost:5001")
    
    app.run(host='0.0.0.0', port=5001, debug=True)
