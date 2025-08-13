#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test de classification de plusieurs produits
"""

import requests
import json
import time

def test_products():
    """Teste la classification de plusieurs produits"""
    print("Test de classification CEDEAO - Produits multiples")
    print("=" * 60)
    
    # Liste de produits à tester
    products = [
        "avion",
        "voiture", 
        "ordinateur",
        "telephone",
        "vetement",
        "jouet",
        "bambou",
        "cafe",
        "chocolat",
        "medicament"
    ]
    
    results = []
    
    for product in products:
        try:
            print(f"\n🔍 Test de '{product}'...")
            
            response = requests.post(
                'http://localhost:5001/classify',
                json={'product': product},
                timeout=5
            )
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"   ✅ Code: {result.get('code_tarifaire')}")
                    print(f"   📊 Taux: {result.get('taux_imposition')}%")
                    print(f"   📝 Description: {result.get('description', '')[:50]}...")
                    print(f"   🎯 Source: {result.get('source')}")
                    
                    results.append({
                        'product': product,
                        'success': True,
                        'code': result.get('code_tarifaire'),
                        'rate': result.get('taux_imposition'),
                        'source': result.get('source')
                    })
                else:
                    print(f"   ❌ Échec: {result.get('error', 'Erreur inconnue')}")
                    results.append({
                        'product': product,
                        'success': False,
                        'error': result.get('error', 'Erreur inconnue')
                    })
            else:
                print(f"   ❌ Erreur HTTP: {response.status_code}")
                results.append({
                    'product': product,
                    'success': False,
                    'error': f'HTTP {response.status_code}'
                })
                
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
            results.append({
                'product': product,
                'success': False,
                'error': str(e)
            })
        
        time.sleep(0.5)  # Pause entre les tests
    
    # Résumé
    print(f"\n📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]
    
    print(f"✅ Succès: {len(successful)}/{len(results)}")
    print(f"❌ Échecs: {len(failed)}/{len(results)}")
    
    if successful:
        print(f"\n🎯 Classifications réussies:")
        for result in successful:
            print(f"   {result['product']}: {result['code']} ({result['rate']}%) - {result['source']}")
    
    if failed:
        print(f"\n⚠️ Échecs:")
        for result in failed:
            print(f"   {result['product']}: {result['error']}")
    
    return results

if __name__ == "__main__":
    test_products()
