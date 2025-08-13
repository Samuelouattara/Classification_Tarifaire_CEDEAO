# 🚀 RASA BOT SPÉCIALISÉ DOUANE CEDEAO

## 📋 **DESCRIPTION**

Bot RASA spécialement conçu pour la classification tarifaire CEDEAO avec validation stricte et traçabilité complète pour usage douanier.

## 🎯 **FONCTIONNALITÉS**

- ✅ Classification précise selon TEC CEDEAO
- ✅ Validation stricte des règles douanières
- ✅ Traçabilité complète des décisions
- ✅ Gestion des cas complexes (avion vs avion jouet)
- ✅ Calcul automatique des droits de douane
- ✅ Documentation automatique des classifications

## 🏗️ **ARCHITECTURE**

```
rasa-cedeo-bot/
├── data/
│   ├── nlu.yml          # Entités et intents spécialisés
│   ├── stories.yml      # Flux de conversation
│   └── rules.yml        # Règles de validation
├── actions/
│   ├── cedeo_actions.py # Actions personnalisées
│   └── validation.py    # Validation douanière
├── models/              # Modèles entraînés
├── config.yml           # Configuration RASA
├── domain.yml           # Domaine spécialisé
└── endpoints.yml        # Endpoints API
```

## 🚀 **INSTALLATION**

```bash
# 1. Installation RASA
pip install rasa

# 2. Initialisation du projet
rasa init

# 3. Entraînement du modèle
rasa train

# 4. Lancement du serveur d'actions
rasa run actions

# 5. Lancement du serveur principal
rasa run
```

## 🧪 **TESTS**

```bash
# Test de classification
rasa test

# Test interactif
rasa shell

# Test avec données spécifiques
python test_cedeo_classification.py
```

## 🔒 **SÉCURITÉ DOUANIÈRE**

- Validation stricte de chaque classification
- Traçabilité complète des décisions
- Conformité TEC CEDEAO garantie
- Audit trail pour contrôle douanier
