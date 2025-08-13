#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Diagnostic de la base de données CEDEAO
"""

import mysql.connector
import sys

def check_database():
    """Vérifie la base de données"""
    print("Diagnostic de la base de données CEDEAO")
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
        
        # Vérifier les tables
        tables = [
            'cedeo_sections',
            'cedeo_chapitres', 
            'cedeo_codes_tarifaires',
            'cedeo_mots_cles',
            'cedeo_cache_classifications'
        ]
        
        for table in tables:
            try:
                cursor.execute(f"SELECT COUNT(*) as count FROM {table}")
                result = cursor.fetchone()
                print(f"Table {table}: {result['count']} enregistrements")
            except Exception as e:
                print(f"Table {table}: ERREUR - {e}")
        
        # Vérifier quelques données
        print("\nExemples de données:")
        
        # Sections
        cursor.execute("SELECT * FROM cedeo_sections LIMIT 3")
        sections = cursor.fetchall()
        print(f"Sections ({len(sections)}):")
        for section in sections:
            print(f"  {section['code_section']}: {section['titre_section']}")
        
        # Codes tarifaires
        cursor.execute("SELECT * FROM cedeo_codes_tarifaires LIMIT 3")
        codes = cursor.fetchall()
        print(f"\nCodes tarifaires ({len(codes)}):")
        for code in codes:
            print(f"  {code['code_tarifaire']}: {code['description_produit'][:50]}...")
        
        cursor.close()
        connection.close()
        
        print("\nDiagnostic termine avec succes!")
        return True
        
    except Exception as e:
        print(f"Erreur: {e}")
        return False

if __name__ == "__main__":
    check_database()
