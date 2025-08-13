#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bot de Classification CEDEAO - Version Complète
===============================================

Bot de classification tarifaire CEDEAO utilisant toutes les règles
du fichier TEC CEDEAO officiel via une base de données SQLite.
"""

import json
import sqlite3
import datetime
import re
from typing import Dict, List, Optional, Tuple
from flask import Flask, request, jsonify
from flask_cors import CORS

# Création de l'application Flask
app = Flask(__name__)
CORS(app)

class CEDEOClassifier:
    def __init__(self, db_path: str = "cedeo_rules.db"):
        self.db_path = db_path
        self.conn = None
        self.cursor = None
        self.cache = {}
        
    def connect_db(self):
        """Connexion à la base de données"""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
            self.cursor = self.conn.cursor()
            return True
        except Exception as e:
            print(f"❌ Erreur connexion base de données: {e}")
            return False
            
    def close_db(self):
        """Fermeture de la connexion à la base de données"""
        if self.conn:
            self.conn.close()
            
    def normalize_text(self, text: str) -> str:
        """Normalise le texte pour la comparaison"""
        if not text:
            return ""
        # Convertir en minuscules et supprimer les accents
        text = text.lower().strip()
        # Supprimer les caractères spéciaux
        text = re.sub(r'[^\w\s]', ' ', text)
        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text)
        return text
        
    def search_by_keywords(self, product_name: str) -> List[Dict]:
        """Recherche par mots-clés dans la base de données"""
        normalized_name = self.normalize_text(product_name)
        words = normalized_name.split()
        
        if not words:
            return []
            
        # Construire la requête SQL pour rechercher les mots-clés
        placeholders = ','.join(['?' for _ in words])
        query = f'''
            SELECT DISTINCT 
                tc.tariff_code,
                tc.chapter,
                tc.heading,
                tc.description,
                tc.tax_rate,
                tc.unit,
                tc.section,
                COUNT(k.keyword) as keyword_matches
            FROM tariff_codes tc
            JOIN keywords k ON tc.tariff_code = k.tariff_code
            WHERE k.keyword IN ({placeholders})
            GROUP BY tc.tariff_code
            ORDER BY keyword_matches DESC, tc.tax_rate ASC
            LIMIT 10
        '''
        
        try:
            self.cursor.execute(query, words)
            results = []
            for row in self.cursor.fetchall():
                results.append({
                    'tariff_code': row['tariff_code'],
                    'chapter': row['chapter'],
                    'heading': row['heading'],
                    'description': row['description'],
                    'tax_rate': row['tax_rate'],
                    'unit': row['unit'],
                    'section': row['section'],
                    'keyword_matches': row['keyword_matches'],
                    'confidence': min(0.95, 0.5 + (row['keyword_matches'] * 0.1))
                })
            return results
        except Exception as e:
            print(f"❌ Erreur recherche mots-clés: {e}")
            return []
            
    def search_by_description(self, product_name: str) -> List[Dict]:
        """Recherche par similarité de description"""
        normalized_name = self.normalize_text(product_name)
        
        # Recherche par LIKE dans les descriptions
        query = '''
            SELECT 
                tariff_code,
                chapter,
                heading,
                description,
                tax_rate,
                unit,
                section
            FROM tariff_codes
            WHERE description LIKE ?
            ORDER BY tax_rate ASC
            LIMIT 5
        '''
        
        try:
            search_term = f"%{normalized_name}%"
            self.cursor.execute(query, (search_term,))
            results = []
            for row in self.cursor.fetchall():
                results.append({
                    'tariff_code': row['tariff_code'],
                    'chapter': row['chapter'],
                    'heading': row['heading'],
                    'description': row['description'],
                    'tax_rate': row['tax_rate'],
                    'unit': row['unit'],
                    'section': row['section'],
                    'confidence': 0.7
                })
            return results
        except Exception as e:
            print(f"❌ Erreur recherche description: {e}")
            return []
            
    def get_section_info(self, section_code: str) -> Optional[Dict]:
        """Récupère les informations d'une section"""
        query = '''
            SELECT section_code, section_name
            FROM sections
            WHERE section_code = ?
        '''
        
        try:
            self.cursor.execute(query, (section_code,))
            row = self.cursor.fetchone()
            if row:
                return {
                    'section_code': row['section_code'],
                    'section_name': row['section_name']
                }
            return None
        except Exception as e:
            print(f"❌ Erreur récupération section: {e}")
            return None
            
    def classify_product(self, product_name: str) -> Dict:
        """Classifie un produit selon les règles CEDEAO complètes"""
        if not self.connect_db():
            return self._default_classification(product_name)
            
        try:
            # Vérifier le cache
            cache_key = self.normalize_text(product_name)
            if cache_key in self.cache:
                return self.cache[cache_key]
                
            # Recherche par mots-clés (plus précise)
            keyword_results = self.search_by_keywords(product_name)
            
            # Recherche par description (plus large)
            description_results = self.search_by_description(product_name)
            
            # Combiner et trier les résultats
            all_results = keyword_results + description_results
            
            if all_results:
                # Prendre le meilleur résultat
                best_result = max(all_results, key=lambda x: x.get('confidence', 0))
                
                # Récupérer les infos de la section
                section_info = self.get_section_info(best_result['section'])
                
                classification = {
                    'product_name': product_name,
                    'tariff_code': best_result['tariff_code'],
                    'section': best_result['section'],
                    'section_name': section_info['section_name'] if section_info else 'Section inconnue',
                    'chapter': best_result['chapter'],
                    'heading': best_result['heading'],
                    'tax_rate': best_result['tax_rate'],
                    'unit': best_result['unit'],
                    'description': best_result['description'],
                    'confidence': best_result['confidence'],
                    'classification_method': 'database_search',
                    'timestamp': datetime.datetime.now().isoformat(),
                    'search_results_count': len(all_results)
                }
                
                # Mettre en cache
                self.cache[cache_key] = classification
                
                return classification
            else:
                # Aucun résultat trouvé, utiliser la classification par défaut
                return self._default_classification(product_name)
                
        except Exception as e:
            print(f"❌ Erreur classification: {e}")
            return self._default_classification(product_name)
        finally:
            self.close_db()
            
    def _default_classification(self, product_name: str) -> Dict:
        """Classification par défaut quand aucune règle n'est trouvée"""
        return {
            'product_name': product_name,
            'tariff_code': '999999',
            'section': 'XX',
            'section_name': 'Section inconnue',
            'chapter': '99',
            'heading': '9999',
            'tax_rate': 20.0,
            'unit': 'u',
            'description': 'Produit non classifié',
            'confidence': 0.1,
            'classification_method': 'default',
            'timestamp': datetime.datetime.now().isoformat(),
            'search_results_count': 0
        }
        
    def get_statistics(self) -> Dict:
        """Retourne les statistiques de la base de données"""
        if not self.connect_db():
            return {'error': 'Base de données non accessible'}
            
        try:
            stats = {}
            
            # Nombre total de codes tarifaires
            self.cursor.execute('SELECT COUNT(*) FROM tariff_codes')
            stats['total_codes'] = self.cursor.fetchone()[0]
            
            # Nombre de sections
            self.cursor.execute('SELECT COUNT(*) FROM sections')
            stats['total_sections'] = self.cursor.fetchone()[0]
            
            # Nombre de mots-clés
            self.cursor.execute('SELECT COUNT(*) FROM keywords')
            stats['total_keywords'] = self.cursor.fetchone()[0]
            
            # Taux de taxe min/max
            self.cursor.execute('SELECT MIN(tax_rate), MAX(tax_rate) FROM tariff_codes')
            min_rate, max_rate = self.cursor.fetchone()
            stats['tax_rate_range'] = {'min': min_rate, 'max': max_rate}
            
            # Taille du cache
            stats['cache_size'] = len(self.cache)
            
            return stats
        except Exception as e:
            return {'error': str(e)}
        finally:
            self.close_db()
            
    def search_rules(self, query: str, limit: int = 10) -> List[Dict]:
        """Recherche dans les règles"""
        if not self.connect_db():
            return []
            
        try:
            search_query = f"%{query}%"
            
            sql = '''
                SELECT 
                    tc.tariff_code,
                    tc.chapter,
                    tc.heading,
                    tc.description,
                    tc.tax_rate,
                    tc.unit,
                    tc.section,
                    s.section_name
                FROM tariff_codes tc
                LEFT JOIN sections s ON tc.section = s.section_code
                WHERE tc.description LIKE ? OR tc.tariff_code LIKE ?
                ORDER BY tc.tariff_code
                LIMIT ?
            '''
            
            self.cursor.execute(sql, (search_query, search_query, limit))
            results = []
            for row in self.cursor.fetchall():
                results.append({
                    'tariff_code': row['tariff_code'],
                    'chapter': row['chapter'],
                    'heading': row['heading'],
                    'description': row['description'],
                    'tax_rate': row['tax_rate'],
                    'unit': row['unit'],
                    'section': row['section'],
                    'section_name': row['section_name']
                })
            return results
        except Exception as e:
            print(f"❌ Erreur recherche règles: {e}")
            return []
        finally:
            self.close_db()

# Instance globale du classifieur
classifier = CEDEOClassifier()

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de l'état du bot"""
    stats = classifier.get_statistics()
    return jsonify({
        'status': 'healthy',
        'service': 'CEDEAO Classification Bot - Version Complète',
        'version': '2.0.0',
        'timestamp': datetime.datetime.now().isoformat(),
        'database_stats': stats
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

        result = classifier.classify_product(product_name)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/search', methods=['GET'])
def search_rules():
    """Recherche dans les règles"""
    try:
        query = request.args.get('q', '')
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({
                'error': 'Paramètre de recherche requis'
            }), 400
            
        results = classifier.search_rules(query, limit)
        return jsonify({
            'query': query,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/stats', methods=['GET'])
def get_stats():
    """Récupérer les statistiques"""
    try:
        stats = classifier.get_statistics()
        return jsonify(stats)
    except Exception as e:
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test():
    """Test simple"""
    return jsonify({
        'message': 'Bot CEDEAO Version Complète opérationnel',
        'timestamp': datetime.datetime.now().isoformat(),
        'database_available': classifier.connect_db()
    })

if __name__ == '__main__':
    print("🚀 Démarrage du Bot CEDEAO Version Complète...")
    print("📍 Endpoints disponibles:")
    print("   - GET  /health    - Vérification de l'état")
    print("   - POST /classify  - Classification de produits")
    print("   - GET  /search    - Recherche dans les règles")
    print("   - GET  /stats     - Statistiques de la base")
    print("   - GET  /test      - Test simple")
    print("🌐 Serveur démarré sur http://localhost:5001")
    
    # Test de connexion à la base de données
    if classifier.connect_db():
        print("✅ Base de données CEDEAO accessible")
        stats = classifier.get_statistics()
        if 'error' not in stats:
            print(f"📊 Base de données: {stats['total_codes']} codes tarifaires")
        classifier.close_db()
    else:
        print("⚠️ Base de données CEDEAO non accessible")
        print("💡 Assurez-vous d'avoir exécuté tec-parser.py d'abord")

    app.run(host='0.0.0.0', port=5001, debug=True)
