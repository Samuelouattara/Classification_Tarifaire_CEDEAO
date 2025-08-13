#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trouver les vrais termes pour ordinateur dans le TEC
"""

import mysql.connector

def find_computer_terms():
    """Trouve les termes liés aux ordinateurs"""
    print("Recherche des termes pour ordinateur dans le TEC")
    print("=" * 60)
    
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
        
        # Chercher dans le chapitre 84 (Machines et appareils mécaniques)
        print("\n1. Recherche dans le chapitre 84 (Machines mécaniques):")
        cursor.execute("""
            SELECT code_tarifaire, description_produit 
            FROM cedeo_codes_tarifaires 
            WHERE code_chapitre LIKE '84%' 
            AND (description_produit LIKE '%calculateur%' 
                 OR description_produit LIKE '%informatique%'
                 OR description_produit LIKE '%traitement%'
                 OR description_produit LIKE '%donnees%'
                 OR description_produit LIKE '%automatique%')
            LIMIT 10
        """)
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} codes tarifaires")
        for result in results:
            print(f"   - {result['code_tarifaire']}: {result['description_produit'][:100]}...")
        
        # Chercher dans le chapitre 85 (Machines électriques)
        print("\n2. Recherche dans le chapitre 85 (Machines électriques):")
        cursor.execute("""
            SELECT code_tarifaire, description_produit 
            FROM cedeo_codes_tarifaires 
            WHERE code_chapitre LIKE '85%' 
            AND (description_produit LIKE '%calculateur%' 
                 OR description_produit LIKE '%informatique%'
                 OR description_produit LIKE '%traitement%'
                 OR description_produit LIKE '%donnees%'
                 OR description_produit LIKE '%electronique%')
            LIMIT 10
        """)
        results = cursor.fetchall()
        print(f"   Trouve {len(results)} codes tarifaires")
        for result in results:
            print(f"   - {result['code_tarifaire']}: {result['description_produit'][:100]}...")
        
        # Chercher les chapitres liés aux machines
        print("\n3. Chapitres liés aux machines:")
        cursor.execute("""
            SELECT code_chapitre, titre_chapitre 
            FROM cedeo_chapitres 
            WHERE code_chapitre LIKE '84%' OR code_chapitre LIKE '85%'
            ORDER BY code_chapitre
        """)
        results = cursor.fetchall()
        for result in results:
            print(f"   - {result['code_chapitre']}: {result['titre_chapitre']}")
        
        # Chercher les termes les plus proches
        print("\n4. Recherche de termes similaires:")
        terms = ['calculateur', 'informatique', 'traitement', 'donnees', 'automatique', 'electronique']
        for term in terms:
            cursor.execute("""
                SELECT COUNT(*) as count 
                FROM cedeo_codes_tarifaires 
                WHERE description_produit LIKE %s
            """, (f'%{term}%',))
            result = cursor.fetchone()
            print(f"   '{term}': {result['count']} occurrences")
        
        cursor.close()
        connection.close()
        
        print("\nRecherche terminee!")
        
    except Exception as e:
        print(f"Erreur: {e}")

if __name__ == "__main__":
    find_computer_terms()
