#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test simple du bot CEDEAO MySQL
"""

import requests
import json
import time

def test_bot():
    """Teste le bot CEDEAO"""
    print("Test du bot CEDEAO MySQL")
    print("=" * 40)
    
    # Test de santé
    try:
        print("1. Test de santé...")
        response = requests.get('http://localhost:5001/health', timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   Status: {health_data.get('status')}")
            print(f"   Service: {health_data.get('service')}")
            print(f"   Version: {health_data.get('version')}")
            print(f"   Stats DB: {health_data.get('database_stats')}")
        else:
            print(f"   Erreur: {response.status_code}")
            return False
    except Exception as e:
        print(f"   Erreur connexion: {e}")
        return False
    
    # Test de classification
    try:
        print("\n2. Test de classification...")
        test_products = ['avion', 'voiture', 'ordinateur']
        
        for product in test_products:
            print(f"   Test '{product}'...")
            response = requests.post('http://localhost:5001/classify', 
                                   json={'product': product}, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"     Code: {result.get('code_tarifaire')}")
                    print(f"     Taux: {result.get('taux_imposition')}%")
                    print(f"     Source: {result.get('source')}")
                else:
                    print(f"     Echec: {result.get('error', 'Erreur inconnue')}")
            else:
                print(f"     Erreur HTTP: {response.status_code}")
    
    except Exception as e:
        print(f"   Erreur classification: {e}")
        return False
    
    print("\nTest termine avec succes!")
    return True

if __name__ == "__main__":
    test_bot()
