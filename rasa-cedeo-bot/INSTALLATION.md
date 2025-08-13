# 🚀 GUIDE D'INSTALLATION - RASA BOT DOUANE CEDEAO

## 📋 **PRÉREQUIS**

### **Système d'exploitation**
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Ubuntu 18.04+ / Debian 10+

### **Python**
- ✅ Python 3.8+ (recommandé: Python 3.9)
- ✅ pip (gestionnaire de paquets Python)

### **Espace disque**
- ✅ 2 GB minimum (pour RASA + modèles)

## 🛠️ **INSTALLATION ÉTAPE PAR ÉTAPE**

### **1. Vérification Python**
```bash
# Vérifier la version Python
python --version
# ou
python3 --version

# Vérifier pip
pip --version
```

### **2. Création d'un environnement virtuel**
```bash
# Créer un environnement virtuel
python -m venv rasa-cedeo-env

# Activer l'environnement
# Windows:
rasa-cedeo-env\Scripts\activate

# macOS/Linux:
source rasa-cedeo-env/bin/activate
```

### **3. Installation des dépendances**
```bash
# Naviguer vers le dossier du projet
cd rasa-cedeo-bot

# Installer les dépendances
pip install -r requirements.txt
```

### **4. Installation de spaCy (optionnel mais recommandé)**
```bash
# Télécharger le modèle français
python -m spacy download fr_core_news_sm

# Ou pour un modèle plus complet
python -m spacy download fr_core_news_md
```

### **5. Configuration RASA**
```bash
# Initialiser RASA (si pas déjà fait)
rasa init

# Entraîner le modèle
rasa train
```

## 🚀 **LANCEMENT DU BOT**

### **1. Lancement du serveur d'actions**
```bash
# Terminal 1 - Serveur d'actions
rasa run actions
```

### **2. Lancement du serveur principal**
```bash
# Terminal 2 - Serveur principal
rasa run
```

### **3. Test interactif**
```bash
# Terminal 3 - Test en ligne de commande
rasa shell
```

## 🌐 **INTÉGRATION AVEC VOTRE SYSTÈME**

### **1. Configuration des endpoints**
Modifiez le fichier `endpoints.yml` selon votre configuration :

```yaml
action_endpoint:
  url: "http://localhost:5055/webhook"

rest:
  url: "http://localhost:5005/webhooks/rest/webhook"
```

### **2. Test de l'interface web**
Ouvrez le fichier `test-rasa-integration.html` dans votre navigateur.

### **3. Intégration avec votre API**
Le bridge JavaScript (`rasa-api-bridge.js`) permet l'intégration avec votre système existant.

## 🧪 **TESTS ET VALIDATION**

### **1. Tests automatiques**
```bash
# Lancer les tests
rasa test

# Tests avec données spécifiques
rasa test --stories tests/stories.md
```

### **2. Tests manuels**
```bash
# Test interactif
rasa shell

# Test avec données de test
rasa test --nlu data/nlu.yml
```

### **3. Validation des cas CEDEAO**
Testez les cas spécifiques :
- ✅ "avion" → Section XVII, Code 8802.20.00.00
- ✅ "avion jouet" → Section XX, Code 9503.00.00.00
- ✅ "poisson saumon" → Section I, Code 0302.11.00.00

## 🔧 **CONFIGURATION AVANCÉE**

### **1. Personnalisation des actions**
Modifiez `actions/cedeo_actions.py` pour adapter les règles de classification.

### **2. Ajout de nouveaux intents**
Ajoutez dans `data/nlu.yml` :
```yaml
- intent: nouveau_intent
  examples: |
    - Exemple 1
    - Exemple 2
```

### **3. Configuration des politiques**
Modifiez `config.yml` pour ajuster les politiques de dialogue.

## 🚨 **DÉPANNAGE**

### **Erreur: "Module not found"**
```bash
# Réinstaller les dépendances
pip install -r requirements.txt --force-reinstall
```

### **Erreur: "Port already in use"**
```bash
# Changer les ports dans endpoints.yml
action_endpoint:
  url: "http://localhost:5056/webhook"
```

### **Erreur: "Model not found"**
```bash
# Réentraîner le modèle
rasa train --force
```

### **Erreur: "spaCy model not found"**
```bash
# Installer le modèle français
python -m spacy download fr_core_news_sm
```

## 📊 **MONITORING ET LOGS**

### **1. Logs RASA**
```bash
# Activer les logs détaillés
rasa run --log-level DEBUG
```

### **2. Monitoring via interface**
Utilisez l'interface `test-rasa-integration.html` pour monitorer :
- ✅ Statut de connexion
- ✅ Temps de réponse
- ✅ Taux de succès
- ✅ Erreurs

### **3. Logs personnalisés**
Les actions personnalisées génèrent des logs dans `actions/cedeo_actions.py`.

## 🔒 **SÉCURITÉ**

### **1. Environnement de production**
```bash
# Variables d'environnement
export RASA_ENVIRONMENT=production
export RASA_LOG_LEVEL=WARNING
```

### **2. Validation stricte**
Le bot inclut une validation stricte pour :
- ✅ Conformité TEC CEDEAO
- ✅ Audit trail complet
- ✅ Validation humaine pour cas complexes

### **3. Fallback sécurisé**
En cas d'échec RASA, le système bascule automatiquement vers votre système existant.

## 📈 **OPTIMISATION**

### **1. Performance**
```bash
# Entraînement optimisé
rasa train --config config.yml --domain domain.yml --data data/
```

### **2. Précision**
- ✅ Ajoutez plus d'exemples dans `data/nlu.yml`
- ✅ Affinez les règles dans `data/rules.yml`
- ✅ Testez avec des cas réels

### **3. Évolutivité**
- ✅ Ajoutez de nouveaux produits
- ✅ Mettez à jour les taux d'imposition
- ✅ Intégrez de nouvelles règles CEDEAO

## 🎯 **PROCHAINES ÉTAPES**

1. **Test complet** avec vos données réelles
2. **Validation** par votre équipe douane
3. **Intégration** avec votre système de production
4. **Formation** des utilisateurs
5. **Monitoring** en continu

## 📞 **SUPPORT**

En cas de problème :
1. ✅ Vérifiez les logs RASA
2. ✅ Consultez la documentation RASA officielle
3. ✅ Testez avec l'interface de test fournie
4. ✅ Vérifiez la connectivité réseau

---

**🎉 Votre bot RASA spécialisé douane CEDEAO est maintenant prêt !**
