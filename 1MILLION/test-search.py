#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test de recherche dans la base CEDEAO
"""

import mysql.connector

def test_search():
    """Teste la recherche dans la base"""
    print("Test de recherche dans la base CEDEAO")
    print("=" * 40)
    
    try:
        # Connexion
        config = {
            'host': 'localhost',
            'port': 4240,
            'user': 'root',
            'password': 'root',
            'database': 'douane'
        }
        
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor(dictionary=True)
        
        # Test recherche avion
        print("1. Recherche 'avion' dans les mots-clés:")
        cursor.execute("SELECT * FROM cedeo_mots_cles WHERE mot_cle LIKE %s", ('%avion%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} mots-cles")
        for result in results[:5]:
            print(f"   - {result['mot_cle']} -> {result['code_tarifaire']}")
        
        # Test recherche dans les descriptions
        print("\n2. Recherche 'avion' dans les descriptions:")
        cursor.execute("SELECT * FROM cedeo_codes_tarifaires WHERE description_produit LIKE %s", ('%avion%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} codes tarifaires")
        for result in results[:5]:
            print(f"   - {result['code_tarifaire']}: {result['description_produit'][:50]}...")
        
        # Test recherche 'voiture'
        print("\n3. Recherche 'voiture' dans les descriptions:")
        cursor.execute("SELECT * FROM cedeo_codes_tarifaires WHERE description_produit LIKE %s", ('%voiture%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} codes tarifaires")
        for result in results[:5]:
            print(f"   - {result['code_tarifaire']}: {result['description_produit'][:50]}...")
        
        # Test quelques mots-clés
        print("\n4. Exemples de mots-clés:")
        cursor.execute("SELECT mot_cle, COUNT(*) as count FROM cedeo_mots_cles GROUP BY mot_cle ORDER BY count DESC LIMIT 10")
        results = cursor.fetchall()
        for result in results:
            print(f"   - {result['mot_cle']}: {result['count']} occurrences")
        
        # Test quelques descriptions
        print("\n5. Exemples de descriptions:")
        cursor.execute("SELECT description_produit FROM cedeo_codes_tarifaires LIMIT 10")
        results = cursor.fetchall()
        for result in results:
            print(f"   - {result['description_produit']}")
        
        cursor.close()
        connection.close()
        
        print("\nTest termine!")
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    test_search()
