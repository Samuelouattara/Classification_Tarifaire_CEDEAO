# 🚀 Guide Bot CEDEAO - Version Complète

## 📋 Vue d'ensemble

Ce guide vous explique comment configurer et utiliser le **Bot CEDEAO Version Complète** qui contient **TOUTES** les règles du fichier TEC CEDEAO officiel.

### 🎯 Avantages de cette approche

✅ **Performance optimale** : Base de données SQLite indexée pour des recherches rapides  
✅ **Règles complètes** : Tous les codes tarifaires du fichier TEC CEDEAO  
✅ **Recherche intelligente** : Par mots-clés et par description  
✅ **Cache intégré** : Résultats mis en cache pour plus de rapidité  
✅ **Fiabilité** : Fallback vers le système existant si nécessaire  

## 🔧 Installation et Configuration

### Étape 1: Vérification des fichiers

Assurez-vous d'avoir les fichiers suivants :
```
1MILLION/
├── MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt  # Fichier TEC officiel
├── tec-parser.py                               # Parser pour extraire les règles
├── cedeo-bot-complete.py                       # Bot complet avec base de données
├── setup-cedeo-complete.py                     # Script de configuration
├── cedeo-bot-integration.php                   # Intégration PHP
├── api.php                                     # API principale
└── script-advanced.js                          # Frontend JavaScript
```

### Étape 2: Exécution du script de configuration

```bash
cd 1MILLION
python setup-cedeo-complete.py
```

Ce script va :
1. ✅ Parser le fichier TEC CEDEAO complet
2. ✅ Créer la base de données SQLite (`cedeo_rules.db`)
3. ✅ Exporter les règles en JSON (`cedeo_rules.json`)
4. ✅ Tester le bot complet
5. ✅ Vérifier l'intégration

### Étape 3: Démarrage du bot

```bash
python cedeo-bot-complete.py
```

Le bot démarre sur `http://localhost:5001`

## 🔍 Utilisation

### Test direct du bot

```bash
# Test de santé
curl http://localhost:5001/health

# Classification d'un produit
curl -X POST -H "Content-Type: application/json" \
     -d '{"product_name": "avion commercial"}' \
     http://localhost:5001/classify

# Recherche dans les règles
curl "http://localhost:5001/search?q=avion&limit=5"

# Statistiques de la base
curl http://localhost:5001/stats
```

### Utilisation via l'interface web

1. Ouvrez votre navigateur sur votre système de classification
2. Entrez le nom d'un produit
3. Le bot CEDEAO complet sera utilisé automatiquement
4. Si le bot n'est pas disponible, le système existant prendra le relais

## 📊 Fonctionnalités du Bot Complet

### 🔍 Recherche intelligente

Le bot utilise **deux méthodes de recherche** :

1. **Recherche par mots-clés** (plus précise)
   - Extrait les mots-clés de la description du produit
   - Recherche dans la base de données indexée
   - Calcule un score de confiance basé sur le nombre de correspondances

2. **Recherche par description** (plus large)
   - Recherche par similarité dans les descriptions
   - Trouve des produits similaires même sans mots-clés exacts

### 🎯 Classification précise

Pour chaque produit, le bot retourne :
- **Code tarifaire** : Code HS complet (ex: 8802.11.00.00)
- **Section** : Section du TEC CEDEAO (ex: XVII)
- **Chapitre** : Chapitre du TEC (ex: 88)
- **Taux de taxe** : Taux exact du fichier TEC
- **Unité** : Unité de mesure (kg, u, l, etc.)
- **Description** : Description officielle du produit
- **Confiance** : Niveau de confiance de la classification (0.1 à 0.95)

### 💾 Cache intégré

- Les résultats sont mis en cache pour éviter les recherches répétées
- Améliore significativement les performances
- Cache automatiquement géré

## 🔧 Configuration avancée

### Modification de la base de données

Si vous voulez modifier les règles :

1. Modifiez le fichier `tec-parser.py`
2. Re-exécutez le parsing :
   ```bash
   python tec-parser.py
   ```

### Personnalisation du bot

Vous pouvez modifier `cedeo-bot-complete.py` pour :
- Ajuster les algorithmes de recherche
- Modifier les scores de confiance
- Ajouter de nouvelles fonctionnalités

### Intégration avec d'autres systèmes

Le bot expose une API REST complète :
- `POST /classify` : Classification de produits
- `GET /search` : Recherche dans les règles
- `GET /stats` : Statistiques de la base
- `GET /health` : État du service

## 🚨 Dépannage

### Le bot ne démarre pas

```bash
# Vérifiez que la base de données existe
ls -la cedeo_rules.db

# Si elle n'existe pas, re-exécutez le parser
python tec-parser.py
```

### Erreur de connexion à la base

```bash
# Vérifiez les permissions
chmod 644 cedeo_rules.db

# Vérifiez que SQLite est installé
python -c "import sqlite3; print('SQLite OK')"
```

### Classification incorrecte

1. Vérifiez que le fichier TEC est à jour
2. Re-exécutez le parser pour mettre à jour la base
3. Vérifiez les logs du bot pour les erreurs

### Performance lente

1. Vérifiez que les index sont créés
2. Redémarrez le bot pour vider le cache
3. Vérifiez l'espace disque disponible

## 📈 Statistiques attendues

Après le parsing complet, vous devriez avoir :
- **~10,000+ codes tarifaires** dans la base
- **~50,000+ mots-clés** indexés
- **21 sections** du TEC CEDEAO
- **Temps de réponse** : < 100ms pour la plupart des recherches

## 🔄 Mise à jour

Pour mettre à jour les règles :

1. Remplacez le fichier `MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt`
2. Re-exécutez le parser :
   ```bash
   python tec-parser.py
   ```
3. Redémarrez le bot :
   ```bash
   python cedeo-bot-complete.py
   ```

## 📞 Support

Si vous rencontrez des problèmes :

1. Vérifiez les logs du bot
2. Testez la connexion à la base de données
3. Vérifiez que tous les fichiers sont présents
4. Consultez ce guide pour le dépannage

---

## 🎉 Félicitations !

Votre bot CEDEAO contient maintenant **TOUTES** les règles du fichier TEC CEDEAO officiel et peut classifier n'importe quel produit avec une précision maximale !

**Avantages obtenus :**
- ✅ Classification basée sur les règles officielles
- ✅ Taux de taxe exacts du fichier TEC
- ✅ Performance optimale avec base de données
- ✅ Intégration transparente avec votre système existant
- ✅ Fallback automatique en cas de problème
