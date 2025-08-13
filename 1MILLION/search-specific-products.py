#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Recherche spécifique pour ordinateur et jouet
"""

import mysql.connector

def search_specific_products():
    """Recherche ordinateur et jouet dans la base"""
    print("Recherche spécifique - Ordinateur et Jouet")
    print("=" * 50)
    
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
        
        print("Connexion MySQL reussie")
        
        # Recherche "ordinateur"
        print("\n1. Recherche 'ordinateur' dans les descriptions:")
        cursor.execute("SELECT * FROM cedeo_codes_tarifaires WHERE description_produit LIKE %s", ('%ordinateur%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} codes tarifaires")
        for result in results[:5]:
            print(f"   - {result['code_tarifaire']}: {result['description_produit'][:80]}...")
        
        # Recherche "ordinateur" dans les mots-clés
        print("\n2. Recherche 'ordinateur' dans les mots-clés:")
        cursor.execute("SELECT * FROM cedeo_mots_cles WHERE mot_cle LIKE %s", ('%ordinateur%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} mots-clés")
        for result in results[:5]:
            print(f"   - {result['mot_cle']} -> {result['code_tarifaire']}")
        
        # Recherche "jouet"
        print("\n3. Recherche 'jouet' dans les descriptions:")
        cursor.execute("SELECT * FROM cedeo_codes_tarifaires WHERE description_produit LIKE %s", ('%jouet%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} codes tarifaires")
        for result in results[:5]:
            print(f"   - {result['code_tarifaire']}: {result['description_produit'][:80]}...")
        
        # Recherche "jouet" dans les mots-clés
        print("\n4. Recherche 'jouet' dans les mots-clés:")
        cursor.execute("SELECT * FROM cedeo_mots_cles WHERE mot_cle LIKE %s", ('%jouet%',))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} mots-clés")
        for result in results[:5]:
            print(f"   - {result['mot_cle']} -> {result['code_tarifaire']}")
        
        # Recherche alternatives pour ordinateur
        print("\n5. Recherche alternatives pour ordinateur:")
        alternatives = ['calculateur', 'informatique', 'electronique', 'machines', 'appareils']
        for alt in alternatives:
            cursor.execute("SELECT COUNT(*) as count FROM cedeo_codes_tarifaires WHERE description_produit LIKE %s", (f'%{alt}%',))
            result = cursor.fetchone()
            print(f"   '{alt}': {result['count']} codes tarifaires")
        
        # Recherche alternatives pour jouet
        print("\n6. Recherche alternatives pour jouet:")
        alternatives = ['jeux', 'divertissement', 'recreation', 'amusement']
        for alt in alternatives:
            cursor.execute("SELECT COUNT(*) as count FROM cedeo_codes_tarifaires WHERE description_produit LIKE %s", (f'%{alt}%',))
            result = cursor.fetchone()
            print(f"   '{alt}': {result['count']} codes tarifaires")
        
        # Chercher dans les chapitres
        print("\n7. Recherche dans les titres de chapitres:")
        cursor.execute("SELECT * FROM cedeo_chapitres WHERE titre_chapitre LIKE %s OR titre_chapitre LIKE %s", ('%ordinateur%', '%jouet%'))
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} chapitres")
        for result in results:
            print(f"   - {result['code_chapitre']}: {result['titre_chapitre']}")
        
        cursor.close()
        connection.close()
        
        print("\nRecherche terminee!")
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    search_specific_products()
