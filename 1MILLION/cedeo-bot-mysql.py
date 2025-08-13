#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Bot CEDEAO avec MySQL
Classification tarifaire basée sur la base MySQL
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import difflib

app = Flask(__name__)
CORS(app)

class CEDEOClassifierMySQL:
    def __init__(self, host='localhost', port=4240, user='root', password='root', database='douane'):
        """Initialise la connexion MySQL"""
        self.config = {
            'host': host,
            'port': port,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4',
            'collation': 'utf8mb4_unicode_ci'
        }
        self.connection = None
        self.cursor = None
        
    def connect_db(self):
        """Établit la connexion MySQL"""
        try:
            self.connection = mysql.connector.connect(**self.config)
            self.cursor = self.connection.cursor(dictionary=True)
            return True
        except mysql.connector.Error as e:
            print(f"Erreur connexion MySQL: {e}")
            return False
    
    def close_db(self):
        """Ferme la connexion MySQL"""
        if self.cursor:
            self.cursor.close()
        if self.connection:
            self.connection.close()
    
    def normalize_text(self, text: str) -> str:
        """Normalise le texte pour la recherche"""
        if not text:
            return ""
        
        # Convertir en minuscules
        text = text.lower()
        
        # Supprimer les accents
        text = text.replace('é', 'e').replace('è', 'e').replace('ê', 'e')
        text = text.replace('à', 'a').replace('â', 'a').replace('ä', 'a')
        text = text.replace('î', 'i').replace('ï', 'i')
        text = text.replace('ô', 'o').replace('ö', 'o')
        text = text.replace('û', 'u').replace('ü', 'u').replace('ù', 'u')
        text = text.replace('ç', 'c')
        
        # Nettoyer les caractères spéciaux
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text
    
    def search_by_keywords(self, product_name: str) -> List[Dict]:
        """Recherche par mots-clés"""
        try:
            normalized_product = self.normalize_text(product_name)
            words = normalized_product.split()
            
            if not words:
                return []
            
            # Recherche par mots-clés
            placeholders = ', '.join(['%s'] * len(words))
            query = f"""
                SELECT DISTINCT
                    ct.code_tarifaire,
                    ct.description_produit,
                    ct.taux_imposition,
                    ct.unite_mesure,
                    c.code_chapitre,
                    c.titre_chapitre,
                    s.code_section,
                    s.titre_section,
                    SUM(mc.poids_recherche) as score_recherche
                FROM cedeo_codes_tarifaires ct
                JOIN cedeo_chapitres c ON ct.code_chapitre = c.code_chapitre
                JOIN cedeo_sections s ON ct.code_section = s.code_section
                JOIN cedeo_mots_cles mc ON ct.code_tarifaire = mc.code_tarifaire
                WHERE mc.mot_cle IN ({placeholders})
                GROUP BY ct.code_tarifaire, ct.description_produit, ct.taux_imposition,
                         ct.unite_mesure, c.code_chapitre, c.titre_chapitre, s.code_section, s.titre_section
                ORDER BY score_recherche DESC
                LIMIT 10
            """
            
            self.cursor.execute(query, words)
            results = self.cursor.fetchall()
            
            return results
            
        except Exception as e:
            print(f"Erreur recherche mots-clés: {e}")
            return []
    
    def search_by_description(self, product_name: str) -> List[Dict]:
        """Recherche par similarité de description"""
        try:
            normalized_product = self.normalize_text(product_name)
            
            # Recherche par similarité
            query = """
                SELECT 
                    ct.code_tarifaire,
                    ct.description_produit,
                    ct.taux_imposition,
                    ct.unite_mesure,
                    c.code_chapitre,
                    c.titre_chapitre,
                    s.code_section,
                    s.titre_section
                FROM cedeo_codes_tarifaires ct
                JOIN cedeo_chapitres c ON ct.code_chapitre = c.code_chapitre
                JOIN cedeo_sections s ON ct.code_section = s.code_section
                WHERE ct.description_produit LIKE %s
                ORDER BY LENGTH(ct.description_produit)
                LIMIT 10
            """
            
            search_term = f"%{normalized_product}%"
            self.cursor.execute(query, (search_term,))
            results = self.cursor.fetchall()
            
            return results
            
        except Exception as e:
            print(f"Erreur recherche description: {e}")
            return []
    
    def get_section_info(self, section_code: str) -> Optional[Dict]:
        """Récupère les informations d'une section"""
        try:
            query = """
                SELECT code_section, titre_section, description_section, taux_moyen
                FROM cedeo_sections
                WHERE code_section = %s
            """
            
            self.cursor.execute(query, (section_code,))
            result = self.cursor.fetchone()
            
            return result
            
        except Exception as e:
            print(f"Erreur récupération section: {e}")
            return None
    
    def classify_product(self, product_name: str) -> Dict:
        """Classifie un produit"""
        if not self.connect_db():
            return self._default_classification(product_name)
        
        try:
            normalized_product = self.normalize_text(product_name)
            
            # Vérifier le cache
            cached_result = self._check_cache(normalized_product)
            if cached_result:
                self._update_cache_usage(normalized_product)
                return cached_result
            
            # Recherche par mots-clés
            keyword_results = self.search_by_keywords(normalized_product)
            
            # Recherche par description
            description_results = self.search_by_description(normalized_product)
            
            # Combiner et trier les résultats
            all_results = keyword_results + description_results
            
            if all_results:
                # Prendre le meilleur résultat
                best_result = all_results[0]
                
                # Calculer le score de confiance
                confidence_score = self._calculate_confidence(normalized_product, best_result)
                
                # Préparer la réponse
                result = {
                    'success': True,
                    'product': product_name,
                    'code_tarifaire': best_result['code_tarifaire'],
                    'description': best_result['description_produit'],
                    'taux_imposition': float(best_result['taux_imposition']),
                    'unite_mesure': best_result['unite_mesure'],
                    'section': {
                        'code': best_result['code_section'],
                        'title': best_result['titre_section']
                    },
                    'chapitre': {
                        'code': best_result['code_chapitre'],
                        'title': best_result['titre_chapitre']
                    },
                    'confidence_score': confidence_score,
                    'methode_recherche': 'keyword' if keyword_results else 'description',
                    'source': 'CEDEAO_BOT_MYSQL'
                }
                
                # Sauvegarder dans le cache
                self._save_to_cache(normalized_product, result)
                
                return result
            else:
                # Aucun résultat trouvé, utiliser la classification par défaut
                return self._default_classification(product_name)
                
        except Exception as e:
            print(f"Erreur classification: {e}")
            return self._default_classification(product_name)
        finally:
            self.close_db()
    
    def _check_cache(self, normalized_product: str) -> Optional[Dict]:
        """Vérifie le cache"""
        try:
            query = """
                SELECT code_tarifaire_trouve, description_trouvee, taux_imposition, 
                       score_confiance, methode_recherche
                FROM cedeo_cache_classifications
                WHERE produit_normalise = %s
            """
            
            self.cursor.execute(query, (normalized_product,))
            cached = self.cursor.fetchone()
            
            if cached:
                # Récupérer les détails complets
                query_details = """
                    SELECT 
                        ct.code_tarifaire,
                        ct.description_produit,
                        ct.taux_imposition,
                        ct.unite_mesure,
                        c.code_chapitre,
                        c.titre_chapitre,
                        s.code_section,
                        s.titre_section
                    FROM cedeo_codes_tarifaires ct
                    JOIN cedeo_chapitres c ON ct.code_chapitre = c.code_chapitre
                    JOIN cedeo_sections s ON ct.code_section = s.code_section
                    WHERE ct.code_tarifaire = %s
                """
                
                self.cursor.execute(query_details, (cached['code_tarifaire_trouve'],))
                details = self.cursor.fetchone()
                
                if details:
                    return {
                        'success': True,
                        'code_tarifaire': details['code_tarifaire'],
                        'description': details['description_produit'],
                        'taux_imposition': float(details['taux_imposition']),
                        'unite_mesure': details['unite_mesure'],
                        'section': {
                            'code': details['code_section'],
                            'title': details['titre_section']
                        },
                        'chapitre': {
                            'code': details['code_chapitre'],
                            'title': details['titre_chapitre']
                        },
                        'confidence_score': float(cached['score_confiance']) if cached['score_confiance'] else 85.0,
                        'methode_recherche': cached['methode_recherche'],
                        'source': 'CEDEAO_BOT_MYSQL_CACHE'
                    }
            
            return None
            
        except Exception as e:
            print(f"Erreur vérification cache: {e}")
            return None
    
    def _save_to_cache(self, normalized_product: str, result: Dict):
        """Sauvegarde dans le cache"""
        try:
            query = """
                INSERT INTO cedeo_cache_classifications 
                (produit_recherche, produit_normalise, code_tarifaire_trouve, 
                 description_trouvee, taux_imposition, score_confiance, methode_recherche)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                nombre_utilisations = nombre_utilisations + 1,
                date_derniere_utilisation = CURRENT_TIMESTAMP
            """
            
            self.cursor.execute(query, (
                result.get('product', ''),
                normalized_product,
                result['code_tarifaire'],
                result['description'],
                result['taux_imposition'],
                result['confidence_score'],
                result['methode_recherche']
            ))
            
            self.connection.commit()
            
        except Exception as e:
            print(f"Erreur sauvegarde cache: {e}")
    
    def _update_cache_usage(self, normalized_product: str):
        """Met à jour l'utilisation du cache"""
        try:
            query = """
                UPDATE cedeo_cache_classifications
                SET nombre_utilisations = nombre_utilisations + 1,
                    date_derniere_utilisation = CURRENT_TIMESTAMP
                WHERE produit_normalise = %s
            """
            
            self.cursor.execute(query, (normalized_product,))
            self.connection.commit()
            
        except Exception as e:
            print(f"Erreur mise à jour cache: {e}")
    
    def _calculate_confidence(self, normalized_product: str, result: Dict) -> float:
        """Calcule le score de confiance"""
        try:
            # Similarité avec la description
            description = self.normalize_text(result['description_produit'])
            similarity = difflib.SequenceMatcher(None, normalized_product, description).ratio()
            
            # Score de base
            base_score = similarity * 100
            
            # Bonus pour les correspondances exactes
            if normalized_product in description or description in normalized_product:
                base_score += 20
            
            # Limiter à 100%
            return min(base_score, 100.0)
            
        except Exception as e:
            print(f"Erreur calcul confiance: {e}")
            return 85.0
    
    def _default_classification(self, product_name: str) -> Dict:
        """Classification par défaut si aucune correspondance trouvée"""
        return {
            'success': False,
            'product': product_name,
            'code_tarifaire': '9999.99.99.99',
            'description': f'Produit non classifié: {product_name}',
            'taux_imposition': 15.00,
            'unite_mesure': 'unité',
            'section': {
                'code': 'XX',
                'title': 'Marchandises et produits divers'
            },
            'chapitre': {
                'code': '99',
                'title': 'Produits non classifiés'
            },
            'confidence_score': 0.0,
            'methode_recherche': 'default',
            'source': 'CEDEAO_BOT_MYSQL_DEFAULT'
        }
    
    def get_statistics(self) -> Dict:
        """Retourne les statistiques de la base"""
        if not self.connect_db():
            return {}
        
        try:
            stats = {}
            
            # Compter les sections
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_sections")
            stats['sections'] = self.cursor.fetchone()['count']
            
            # Compter les chapitres
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_chapitres")
            stats['chapitres'] = self.cursor.fetchone()['count']
            
            # Compter les codes tarifaires
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_codes_tarifaires")
            stats['codes_tarifaires'] = self.cursor.fetchone()['count']
            
            # Compter les mots-clés
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_mots_cles")
            stats['mots_cles'] = self.cursor.fetchone()['count']
            
            # Compter les entrées en cache
            self.cursor.execute("SELECT COUNT(*) as count FROM cedeo_cache_classifications")
            stats['cache_entries'] = self.cursor.fetchone()['count']
            
            return stats
            
        except Exception as e:
            print(f"Erreur statistiques: {e}")
            return {}
        finally:
            self.close_db()
    
    def search_rules(self, query: str, limit: int = 10) -> List[Dict]:
        """Recherche dans les règles"""
        if not self.connect_db():
            return []
        
        try:
            search_term = f"%{query}%"
            
            sql_query = """
                SELECT 
                    ct.code_tarifaire,
                    ct.description_produit,
                    ct.taux_imposition,
                    ct.unite_mesure,
                    c.code_chapitre,
                    c.titre_chapitre,
                    s.code_section,
                    s.titre_section
                FROM cedeo_codes_tarifaires ct
                JOIN cedeo_chapitres c ON ct.code_chapitre = c.code_chapitre
                JOIN cedeo_sections s ON ct.code_section = s.code_section
                WHERE ct.description_produit LIKE %s
                   OR ct.code_tarifaire LIKE %s
                   OR c.titre_chapitre LIKE %s
                   OR s.titre_section LIKE %s
                ORDER BY ct.code_tarifaire
                LIMIT %s
            """
            
            self.cursor.execute(sql_query, (search_term, search_term, search_term, search_term, limit))
            results = self.cursor.fetchall()
            
            return results
            
        except Exception as e:
            print(f"Erreur recherche règles: {e}")
            return []
        finally:
            self.close_db()

# Initialiser le classifieur
classifier = CEDEOClassifierMySQL()

@app.route('/health', methods=['GET'])
def health_check():
    """Vérification de l'état du service"""
    stats = classifier.get_statistics()
    
    return jsonify({
        'status': 'healthy',
        'service': 'CEDEAO Bot - Version MySQL',
        'version': '2.1.0',
        'database_stats': stats,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/classify', methods=['POST'])
def classify_product():
    """Classification d'un produit"""
    try:
        data = request.get_json()
        product_name = data.get('product', '').strip()
        
        if not product_name:
            return jsonify({
                'success': False,
                'error': 'Nom du produit requis'
            }), 400
        
        result = classifier.classify_product(product_name)
        return jsonify(result)
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/search', methods=['GET'])
def search_rules():
    """Recherche dans les règles"""
    try:
        query = request.args.get('q', '').strip()
        limit = int(request.args.get('limit', 10))
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Terme de recherche requis'
            }), 400
        
        results = classifier.search_rules(query, limit)
        
        return jsonify({
            'success': True,
            'query': query,
            'results': results,
            'count': len(results)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/stats', methods=['GET'])
def get_statistics():
    """Récupération des statistiques"""
    try:
        stats = classifier.get_statistics()
        
        return jsonify({
            'success': True,
            'statistics': stats
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/test', methods=['GET'])
def test_endpoint():
    """Endpoint de test"""
    test_products = ['avion', 'voiture', 'ordinateur', 'telephone', 'riz']
    results = []
    
    for product in test_products:
        result = classifier.classify_product(product)
        results.append({
            'product': product,
            'result': result
        })
    
    return jsonify({
        'success': True,
        'test_results': results,
        'timestamp': datetime.now().isoformat()
    })

if __name__ == '__main__':
    print("🚀 Bot CEDEAO MySQL démarré sur http://localhost:5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
