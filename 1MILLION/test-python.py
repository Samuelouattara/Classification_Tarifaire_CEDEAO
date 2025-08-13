#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Test simple pour vérifier que Python fonctionne
"""

import sys
import datetime

print("🐍 Test Python - Bot CEDEAO")
print(f"📅 Date: {datetime.datetime.now()}")
print(f"🐍 Version Python: {sys.version}")
print("✅ Python fonctionne correctement!")

# Test des imports
try:
    import json
    print("✅ Module json importé")
except ImportError as e:
    print(f"❌ Erreur import json: {e}")

try:
    from flask import Flask
    print("✅ Module Flask importé")
except ImportError as e:
    print(f"❌ Erreur import Flask: {e}")

try:
    from flask_cors import CORS
    print("✅ Module Flask-CORS importé")
except ImportError as e:
    print(f"❌ Erreur import Flask-CORS: {e}")

print("\n🎯 Test terminé avec succès!")
