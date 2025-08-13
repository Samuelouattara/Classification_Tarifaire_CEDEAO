# Guide Bot CEDEAO MySQL
## Intégration complète avec votre base de données existante

### 🎯 Objectif
Ce guide vous accompagne dans l'intégration du bot CEDEAO avec votre base de données MySQL existante (`douane.sql`), remplaçant la solution SQLite par une solution plus robuste et intégrée.

### 📋 Prérequis
- ✅ MAMP installé et configuré
- ✅ Base de données `douane` créée dans phpMyAdmin
- ✅ Fichier `MON-TEC-CEDEAO-SH-2022-FREN-09-04-2024.txt` présent
- ✅ Python 3.7+ installé

### 🚀 Installation Rapide

#### Étape 1: Configuration automatique
```bash
# Dans le dossier 1MILLION
python setup-cedeo-mysql.py
```

Ce script automatise toutes les étapes suivantes :
- ✅ Vérification de la connexion MySQL
- ✅ Installation des dépendances Python
- ✅ Création des tables CEDEAO
- ✅ Parsing du fichier TEC
- ✅ Test du bot

#### Étape 2: Démarrage manuel (si nécessaire)
```bash
# Installer les dépendances
pip install -r requirements-bot.txt

# Créer les tables MySQL
python tec-parser-mysql.py

# Démarrer le bot
python cedeo-bot-mysql.py
```

### 🗄️ Structure de la Base de Données

#### Tables CEDEAO ajoutées à votre base `douane` :

1. **`cedeo_sections`** - Sections du TEC CEDEAO
   - `code_section` (I, II, III, etc.)
   - `titre_section` (Titre de la section)
   - `taux_moyen` (Taux moyen de la section)

2. **`cedeo_chapitres`** - Chapitres du TEC CEDEAO
   - `code_chapitre` (01, 02, 03, etc.)
   - `titre_chapitre` (Titre du chapitre)
   - `code_section` (Référence vers la section)

3. **`cedeo_codes_tarifaires`** - Codes tarifaires spécifiques
   - `code_tarifaire` (XXXX.XX.XX.XX)
   - `description_produit` (Description détaillée)
   - `taux_imposition` (Taux spécifique)
   - `code_chapitre` et `code_section` (Références)

4. **`cedeo_mots_cles`** - Mots-clés pour la recherche
   - `mot_cle` (Terme de recherche)
   - `code_tarifaire` (Référence)
   - `poids_recherche` (Importance du mot-clé)

5. **`cedeo_cache_classifications`** - Cache des classifications
   - `produit_normalise` (Produit normalisé)
   - `code_tarifaire_trouve` (Résultat)
   - `nombre_utilisations` (Statistiques)

### 🔧 Configuration MySQL

#### Paramètres de connexion (dans `cedeo-bot-mysql.py`) :
```python
config = {
    'host': 'localhost',
    'port': 4240,        # Port MAMP par défaut
    'user': 'root',
    'password': '',      # MAMP n'a souvent pas de mot de passe
    'database': 'douane'
}
```

#### Ajuster selon votre configuration :
- **Port** : Vérifiez le port MySQL dans MAMP
- **Mot de passe** : Si vous avez défini un mot de passe root
- **Base de données** : Assurez-vous que `douane` existe

### 📊 Fonctionnalités du Bot

#### 1. Classification Intelligente
```bash
# Test direct
curl -X POST http://localhost:5001/classify \
  -H "Content-Type: application/json" \
  -d '{"product": "avion commercial"}'
```

#### 2. Recherche dans les Règles
```bash
# Recherche par mot-clé
curl "http://localhost:5001/search?q=avion&limit=5"
```

#### 3. Statistiques de la Base
```bash
# Statistiques complètes
curl http://localhost:5001/stats
```

#### 4. Test de Santé
```bash
# Vérification du service
curl http://localhost:5001/health
```

### 🔄 Intégration avec votre Système PHP

#### 1. Vérification de la Connexion
```php
<?php
require_once 'cedeo-bot-integration.php';

$bot = new CEDEOBotIntegration();
$status = $bot->checkConnection();

if ($status['success']) {
    echo "✅ Bot CEDEAO MySQL connecté";
    echo "📊 " . $status['database_stats']['codes_tarifaires'] . " codes tarifaires";
} else {
    echo "❌ Bot non accessible: " . $status['message'];
}
?>
```

#### 2. Classification d'un Produit
```php
<?php
try {
    $result = $bot->classifyProduct('avion commercial');
    
    echo "Code tarifaire: " . $result['code_tarifaire'];
    echo "Taux: " . $result['taux_imposition'] . "%";
    echo "Section: " . $result['section']['title'];
    echo "Confiance: " . $result['confidence_score'] . "%";
    
} catch (Exception $e) {
    echo "Erreur: " . $e->getMessage();
}
?>
```

#### 3. Intégration dans votre API existante
Le fichier `api.php` est déjà configuré pour utiliser le bot MySQL via `cedeo-bot-integration.php`.

### 🎯 Avantages de la Version MySQL

#### ✅ Performance
- **Recherche optimisée** : Index sur les mots-clés et descriptions
- **Cache intégré** : Réutilisation des classifications fréquentes
- **Requêtes SQL optimisées** : Jointures et agrégations efficaces

#### ✅ Intégration
- **Base unifiée** : Tout dans votre base `douane` existante
- **Cohérence** : Même schéma, même gestionnaire
- **Backup** : Sauvegarde centralisée avec votre système

#### ✅ Maintenance
- **phpMyAdmin** : Interface familière pour la gestion
- **Requêtes SQL** : Possibilité de requêtes personnalisées
- **Évolutivité** : Facile d'ajouter de nouvelles fonctionnalités

### 🔍 Dépannage

#### Problème : "Bot non accessible"
```bash
# Vérifier que le bot démarre
python cedeo-bot-mysql.py

# Vérifier le port
netstat -an | grep 5001

# Tester l'API
curl http://localhost:5001/health
```

#### Problème : "Erreur de connexion MySQL"
```bash
# Vérifier MAMP
# - MySQL démarré ?
# - Port correct (4240) ?
# - Base 'douane' créée ?

# Tester la connexion
python -c "
import mysql.connector
conn = mysql.connector.connect(
    host='localhost', port=4240, 
    user='root', password='', 
    database='douane'
)
print('✅ Connexion OK')
"
```

#### Problème : "Aucun code tarifaire trouvé"
```bash
# Vérifier le parsing
python tec-parser-mysql.py

# Vérifier les données
mysql -h localhost -P 4240 -u root -e "USE douane; SELECT COUNT(*) FROM cedeo_codes_tarifaires;"
```

### 📈 Statistiques Attendues

Après un parsing réussi, vous devriez avoir :
- **~21 sections** (I à XXI)
- **~97 chapitres** (01 à 97)
- **~5000+ codes tarifaires** (selon le fichier TEC)
- **~15000+ mots-clés** (extraits automatiquement)

### 🔄 Mise à Jour

#### Pour mettre à jour les règles TEC :
```bash
# 1. Remplacer le fichier TEC
# 2. Relancer le parsing
python tec-parser-mysql.py

# 3. Redémarrer le bot
python cedeo-bot-mysql.py
```

#### Pour ajouter des règles personnalisées :
```sql
-- Ajouter un code tarifaire spécifique
INSERT INTO cedeo_codes_tarifaires 
(code_tarifaire, description_produit, code_chapitre, code_section, taux_imposition)
VALUES ('9999.99.99.99', 'Produit spécial', '99', 'XX', 10.00);

-- Ajouter des mots-clés
INSERT INTO cedeo_mots_cles (mot_cle, code_tarifaire, poids_recherche)
VALUES ('produit_special', '9999.99.99.99', 5);
```

### 🎉 Résultat Final

Votre système dispose maintenant d'un bot CEDEAO complet qui :
- ✅ Utilise votre base MySQL existante
- ✅ Contient toutes les règles du TEC CEDEAO
- ✅ Fournit des classifications précises
- ✅ S'intègre parfaitement avec votre système PHP
- ✅ Offre des performances optimales
- ✅ Permet une maintenance facile

### 📞 Support

En cas de problème :
1. Vérifiez les logs du bot Python
2. Consultez les erreurs MySQL dans phpMyAdmin
3. Testez les endpoints API individuellement
4. Relancez le script de configuration automatique

**Le bot CEDEAO MySQL est maintenant votre système principal de classification tarifaire !** 🚀
