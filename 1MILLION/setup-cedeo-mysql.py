#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de configuration pour le bot CEDEAO MySQL
Automatise l'installation et la configuration
"""

import subprocess
import sys
import os
import time
import requests
import json

def run_command(command, description):
    """Exécute une commande avec gestion d'erreur"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Succès")
            return True
        else:
            print(f"❌ {description} - Erreur: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False

def check_mysql_connection():
    """Vérifie la connexion MySQL"""
    print("🔍 Vérification de la connexion MySQL...")
    
    try:
        import mysql.connector
        
        # Test de connexion
        config = {
            'host': 'localhost',
            'port': 4240,
            'user': 'root',
            'password': 'root',
            'database': 'douane'
        }
        
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Vérifier que la base existe
        cursor.execute("SHOW DATABASES LIKE 'douane'")
        if cursor.fetchone():
            print("✅ Base de données 'douane' trouvée")
            cursor.close()
            connection.close()
            return True
        else:
            print("❌ Base de données 'douane' non trouvée")
            print("💡 Veuillez créer la base de données 'douane' dans phpMyAdmin")
            return False
            
    except ImportError:
        print("❌ mysql-connector-python non installé")
        return False
    except Exception as e:
        print(f"❌ Erreur de connexion MySQL: {e}")
        print("💡 Vérifiez que MAMP est démarré et que MySQL fonctionne")
        return False

def install_dependencies():
    """Installe les dépendances Python"""
    print("📦 Installation des dépendances Python...")
    
    # Vérifier si pip est disponible
    if not run_command("pip --version", "Vérification de pip"):
        print("❌ pip n'est pas disponible")
        return False
    
    # Installer les dépendances
    if run_command("pip install -r requirements-bot.txt", "Installation des dépendances"):
        print("✅ Dépendances installées")
        return True
    else:
        print("❌ Échec de l'installation des dépendances")
        return False

def create_mysql_tables():
    """Crée les tables MySQL"""
    print("🗄️ Création des tables MySQL...")
    
    try:
        import mysql.connector
        
        # Connexion à MySQL
        config = {
            'host': 'localhost',
            'port': 4240,
            'user': 'root',
            'password': 'root',
            'database': 'douane'
        }
        
        connection = mysql.connector.connect(**config)
        cursor = connection.cursor()
        
        # Lire et exécuter le fichier SQL
        with open('cedeo-mysql-tables.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Exécuter les commandes SQL
        commands = sql_content.split(';')
        for command in commands:
            command = command.strip()
            if command and not command.startswith('--'):
                try:
                    cursor.execute(command)
                except Exception as e:
                    print(f"⚠️ Commande SQL ignorée: {e}")
        
        connection.commit()
        cursor.close()
        connection.close()
        
        print("✅ Tables MySQL créées")
        return True
        
    except Exception as e:
        print(f"❌ Erreur création tables: {e}")
        return False

def parse_tec_file():
    """Parse le fichier TEC CEDEAO"""
    print("📖 Parsing du fichier TEC CEDEAO...")
    
    if not os.path.exists('MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt'):
        print("❌ Fichier TEC CEDEAO non trouvé")
        print("💡 Assurez-vous que le fichier MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt est présent")
        return False
    
    if run_command("python tec-parser-mysql.py", "Parsing du fichier TEC"):
        print("✅ Fichier TEC parsé avec succès")
        return True
    else:
        print("❌ Échec du parsing du fichier TEC")
        return False

def test_bot():
    """Teste le bot"""
    print("🧪 Test du bot CEDEAO...")
    
    # Démarrer le bot en arrière-plan
    print("🚀 Démarrage du bot...")
    bot_process = subprocess.Popen([
        sys.executable, "cedeo-bot-mysql.py"
    ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Attendre que le bot démarre
    time.sleep(3)
    
    try:
        # Test de santé
        response = requests.get('http://localhost:5001/health', timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print("✅ Bot démarré avec succès")
            print(f"📊 Statistiques: {health_data.get('database_stats', {})}")
            
            # Test de classification
            test_data = {'product': 'avion'}
            response = requests.post('http://localhost:5001/classify', 
                                   json=test_data, timeout=5)
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Test classification: {result.get('code_tarifaire', 'N/A')}")
            else:
                print("⚠️ Test classification échoué")
            
            return True
        else:
            print("❌ Bot non accessible")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion au bot: {e}")
        return False
    finally:
        # Arrêter le bot
        bot_process.terminate()
        bot_process.wait()

def main():
    """Fonction principale"""
    print("🚀 Configuration du Bot CEDEAO MySQL")
    print("=" * 50)
    
    # Vérifier Python
    print(f"🐍 Python {sys.version}")
    
    # Étapes de configuration
    steps = [
        ("Vérification MySQL", check_mysql_connection),
        ("Installation dépendances", install_dependencies),
        ("Création tables MySQL", create_mysql_tables),
        ("Parsing fichier TEC", parse_tec_file),
        ("Test du bot", test_bot)
    ]
    
    success_count = 0
    for step_name, step_function in steps:
        print(f"\n📋 Étape: {step_name}")
        print("-" * 30)
        
        if step_function():
            success_count += 1
        else:
            print(f"❌ Étape '{step_name}' échouée")
            break
    
    print("\n" + "=" * 50)
    print("📊 Résumé de la configuration")
    print("=" * 50)
    
    if success_count == len(steps):
        print("🎉 Configuration terminée avec succès!")
        print("\n📋 Prochaines étapes:")
        print("1. Démarrer le bot: python cedeo-bot-mysql.py")
        print("2. Tester l'API: http://localhost:5001/health")
        print("3. Intégrer dans votre système PHP")
        print("\n📁 Fichiers créés:")
        print("- cedeo-mysql-tables.sql (tables MySQL)")
        print("- tec-parser-mysql.py (parser TEC)")
        print("- cedeo-bot-mysql.py (bot Flask)")
        print("- cedeo_rules_mysql.json (export JSON)")
    else:
        print(f"⚠️ Configuration partielle: {success_count}/{len(steps)} étapes réussies")
        print("\n🔧 Actions recommandées:")
        print("1. Vérifiez que MAMP est démarré")
        print("2. Créez la base de données 'douane' dans phpMyAdmin")
        print("3. Vérifiez que le fichier TEC CEDEAO est présent")
        print("4. Relancez ce script")

if __name__ == "__main__":
    main()
