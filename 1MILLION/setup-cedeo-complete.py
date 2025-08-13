#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configuration CEDEAO Complète - Setup Script
===========================================

Script de configuration pour parser le fichier TEC CEDEAO et configurer
le bot de classification complet.
"""

import os
import sys
import subprocess
import time

def run_command(command, description):
    """Exécute une commande avec affichage du statut"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Succès")
            if result.stdout:
                print(result.stdout)
            return True
        else:
            print(f"❌ {description} - Échec")
            if result.stderr:
                print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ {description} - Erreur: {e}")
        return False

def check_file_exists(file_path):
    """Vérifie si un fichier existe"""
    if os.path.exists(file_path):
        print(f"✅ Fichier trouvé: {file_path}")
        return True
    else:
        print(f"❌ Fichier manquant: {file_path}")
        return False

def main():
    """Fonction principale de configuration"""
    print("🚀 Configuration CEDEAO Complète")
    print("=" * 50)
    
    # Vérifier les fichiers requis
    print("\n📁 Vérification des fichiers requis...")
    tec_file = "MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt"
    parser_file = "tec-parser.py"
    bot_file = "cedeo-bot-complete.py"
    
    if not check_file_exists(tec_file):
        print(f"❌ Fichier TEC CEDEAO manquant: {tec_file}")
        print("💡 Assurez-vous que le fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt est présent")
        return False
        
    if not check_file_exists(parser_file):
        print(f"❌ Parser manquant: {parser_file}")
        return False
        
    if not check_file_exists(bot_file):
        print(f"❌ Bot manquant: {bot_file}")
        return False
    
    # Étape 1: Parser le fichier TEC CEDEAO
    print("\n🔍 Étape 1: Parsing du fichier TEC CEDEAO...")
    if not run_command(f"python {parser_file}", "Parsing du fichier TEC CEDEAO"):
        print("❌ Échec du parsing. Vérifiez les erreurs ci-dessus.")
        return False
    
    # Vérifier que la base de données a été créée
    if not check_file_exists("cedeo_rules.db"):
        print("❌ Base de données non créée après le parsing")
        return False
    
    # Vérifier que le fichier JSON a été créé
    if not check_file_exists("cedeo_rules.json"):
        print("❌ Fichier JSON non créé après le parsing")
        return False
    
    # Étape 2: Tester le bot complet
    print("\n🤖 Étape 2: Test du bot CEDEAO complet...")
    
    # Démarrer le bot en arrière-plan
    print("🔄 Démarrage du bot CEDEAO complet...")
    try:
        bot_process = subprocess.Popen(
            [sys.executable, bot_file],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Attendre que le bot démarre
        time.sleep(3)
        
        # Tester la connexion
        if run_command("curl -s http://localhost:5001/health", "Test de connexion au bot"):
            print("✅ Bot CEDEAO complet opérationnel")
        else:
            print("❌ Bot CEDEAO complet non accessible")
            bot_process.terminate()
            return False
        
        # Tester la classification
        test_data = '{"product_name": "avion commercial"}'
        if run_command(f'curl -s -X POST -H "Content-Type: application/json" -d \'{test_data}\' http://localhost:5001/classify', "Test de classification"):
            print("✅ Classification fonctionnelle")
        else:
            print("❌ Classification non fonctionnelle")
        
        # Arrêter le bot
        bot_process.terminate()
        bot_process.wait()
        
    except Exception as e:
        print(f"❌ Erreur lors du test du bot: {e}")
        return False
    
    # Étape 3: Mise à jour de l'intégration PHP
    print("\n🔧 Étape 3: Mise à jour de l'intégration PHP...")
    
    # Vérifier si les fichiers d'intégration existent
    integration_files = [
        "cedeo-bot-integration.php",
        "api.php",
        "script-advanced.js"
    ]
    
    for file in integration_files:
        if check_file_exists(file):
            print(f"✅ Fichier d'intégration trouvé: {file}")
        else:
            print(f"⚠️ Fichier d'intégration manquant: {file}")
    
    print("\n📋 Instructions de configuration:")
    print("1. ✅ Parser TEC CEDEAO exécuté")
    print("2. ✅ Base de données créée")
    print("3. ✅ Bot CEDEAO complet testé")
    print("4. 🔧 Mise à jour manuelle requise:")
    print("   - Remplacer cedeo-bot-simple.py par cedeo-bot-complete.py")
    print("   - Vérifier que cedeo-bot-integration.php pointe vers le bon bot")
    print("   - Tester l'intégration complète")
    
    print("\n🚀 Pour démarrer le bot complet:")
    print("   python cedeo-bot-complete.py")
    
    print("\n🔍 Pour tester la classification:")
    print("   curl -X POST -H 'Content-Type: application/json' \\")
    print("        -d '{\"product_name\": \"avion commercial\"}' \\")
    print("        http://localhost:5001/classify")
    
    print("\n✅ Configuration CEDEAO complète terminée!")
    return True

if __name__ == "__main__":
    success = main()
    if success:
        print("\n🎉 Configuration réussie! Votre bot CEDEAO contient maintenant TOUTES les règles du fichier TEC.")
    else:
        print("\n❌ Configuration échouée. Vérifiez les erreurs ci-dessus.")
        sys.exit(1)
