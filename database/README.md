# 🌍 Système de Classification Tarifaire CEDEAO - Base de Données

## 📋 Vue d'ensemble

Ce système complet intègre une base de données robuste avec un système d'intelligence artificielle pour la classification tarifaire automatique selon les standards CEDEAO.

## 🗄️ Structure de la Base de Données

### Base de Données: `Douane_base`

#### 📊 Tables Principales

##### 1. **Table `User`**
```sql
- user_id (INT, AUTO_INCREMENT, PRIMARY KEY)
- nom_user (VARCHAR(100)) - Nom complet de l'utilisateur
- identifiant_user (VARCHAR(50), UNIQUE) - Identifiant de connexion
- mot_de_passe (VARCHAR(255)) - Mot de passe hashé avec bcrypt
- email (VARCHAR(150), UNIQUE) - Adresse email
- nombre_produits_classes (INT, DEFAULT 0) - Compteur de produits classés
- is_admin (BOOLEAN, DEFAULT FALSE) - Statut administrateur
- date_creation (TIMESTAMP) - Date de création du compte
- derniere_connexion (TIMESTAMP) - Dernière connexion
- statut_compte (ENUM: 'actif', 'inactif', 'suspendu')
```

##### 2. **Table `Produits`**
```sql
- id_produit (INT, AUTO_INCREMENT, PRIMARY KEY)
- origine_produit (VARCHAR(100)) - Pays d'origine
- description_produit (TEXT) - Description détaillée
- numero_serie (VARCHAR(50), NULLABLE) - Numéro de série optionnel
- is_groupe (BOOLEAN, DEFAULT FALSE) - Indique si c'est un paquet
- nombre_produits (INT, DEFAULT 1) - Nombre de produits dans le groupe
- taux_imposition (DECIMAL(5,2)) - Taux d'imposition appliqué
- section_produit (VARCHAR(10)) - Section tarifaire (I, II, III, etc.)
- sous_section_produit (VARCHAR(20)) - Sous-section/chapitres
- user_id (INT, FOREIGN KEY) - Utilisateur qui a classé
- date_classification (TIMESTAMP) - Date de classification
- date_modification (TIMESTAMP) - Dernière modification
- statut_validation (ENUM: 'en_attente', 'valide', 'rejete', 'en_revision')
- code_tarifaire (VARCHAR(20)) - Code tarifaire spécifique
- valeur_declaree (DECIMAL(15,2)) - Valeur déclarée en FCFA
- poids_kg (DECIMAL(10,3)) - Poids en kilogrammes
- unite_mesure (VARCHAR(20)) - Unité de mesure
- commentaires (TEXT) - Commentaires additionnels
```

##### 3. **Table `Produits_Membres`** (pour les paquets/groupes)
```sql
- id_membre (INT, AUTO_INCREMENT, PRIMARY KEY)
- id_produit (INT, FOREIGN KEY) - Référence au produit principal
- id_produit_membre (VARCHAR(50)) - Identifiant du membre
- taux_imposition_membre (DECIMAL(5,2)) - Taux spécifique au membre
- nom_produit_membre (VARCHAR(200)) - Nom du produit membre
- origine_produit_membre (VARCHAR(100)) - Origine du produit membre
- description_produit_membre (TEXT) - Description du produit membre
- numero_serie_membre (VARCHAR(50), NULLABLE) - Numéro de série du membre
- section_produit_membre (VARCHAR(10)) - Section du produit membre
- sous_section_produit_membre (VARCHAR(20)) - Sous-section du membre
- user_qui_classe_membre (INT, FOREIGN KEY) - Utilisateur classificateur
- date_classification_membre (TIMESTAMP) - Date de classification du membre
- date_modification_membre (TIMESTAMP) - Dernière modification
- quantite_membre (INT, DEFAULT 1) - Quantité du membre
- valeur_unitaire_membre (DECIMAL(12,2)) - Valeur unitaire
- poids_unitaire_membre (DECIMAL(8,3)) - Poids unitaire
- code_tarifaire_membre (VARCHAR(20)) - Code tarifaire du membre
```

##### 4. **Table `Taux_Imposition`**
```sql
- id_taux (INT, AUTO_INCREMENT, PRIMARY KEY)
- section (VARCHAR(10)) - Section tarifaire
- sous_section (VARCHAR(20)) - Sous-section/chapitres
- taux_pourcentage (DECIMAL(5,2)) - Taux en pourcentage
- description_taux (TEXT) - Description du taux
- date_application (DATE) - Date d'entrée en vigueur
- date_fin (DATE, NULLABLE) - Date de fin si applicable
- statut_taux (ENUM: 'actif', 'inactif')
```

##### 5. **Tables Additionnelles**
- `Sessions_Utilisateur` - Gestion des sessions
- `Historique_Classifications` - Historique des actions
- `Rapports_Classification` - Rapports et statistiques

## 🚀 Installation et Configuration

### 1. Installation de la Base de Données

```bash
# Exécuter le script de création
mysql -u root -p < database_setup.sql

# Insérer les données de test
mysql -u root -p < test_data.sql
```

### 2. Configuration des Taux CEDEAO

Les taux d'imposition par section sont pré-configurés selon le TEC CEDEAO :
- Section I (Animaux vivants) : 10.50%
- Section II (Produits végétaux) : 8.75%
- Section III (Graisses et huiles) : 12.00%
- Section IV (Industries alimentaires) : 15.25%
- Section V (Produits minéraux) : 5.50%
- Section VI (Industries chimiques) : 18.75%
- Section VII (Plastiques et caoutchouc) : 14.50%
- Section VIII (Cuirs et peaux) : 16.25%
- Section IX (Bois et ouvrages) : 11.75%
- Section X (Papier et carton) : 13.50%
- Section XI (Textiles) : 17.25%
- Section XII (Chaussures, coiffures) : 19.50%
- Section XIII (Pierre, céramique, verre) : 9.25%
- Section XIV (Métaux précieux) : 25.00%
- Section XV (Métaux communs) : 12.75%
- Section XVI (Machines électriques) : 22.50%
- Section XVII (Matériel de transport) : 20.75%
- Section XVIII (Instruments de précision) : 16.50%
- Section XIX (Armes et munitions) : 35.00%
- Section XX (Marchandises diverses) : 15.75%
- Section XXI (Objets d'art) : 30.00%

## 👥 Utilisateurs de Test

### Comptes Pré-configurés

1. **Administrateur**
   - Identifiant: `admin`
   - Mot de passe: `admin123`
   - Email: admin@douane-cedeao.org
   - Privilèges: Administrateur complet

2. **Marie Kouadio** (Agent Côte d'Ivoire)
   - Identifiant: `mkouadio`
   - Mot de passe: `marie123`
   - Email: marie.kouadio@douane-ci.gov

3. **Ahmed Diallo** (Agent Sénégal)
   - Identifiant: `adiallo`
   - Mot de passe: `ahmed123`
   - Email: ahmed.diallo@douane-sn.gov

## 🤖 Intégration IA

### Fonctionnalités
- Classification automatique basée sur la description
- Analyse sémantique avancée
- Système d'apprentissage progressif
- Validation croisée avec la base de données

### Workflow de Classification
1. **Saisie de la description** du produit
2. **Analyse IA** avec le TariffAIClassifier
3. **Obtention des taux** depuis la base de données
4. **Enregistrement automatique** avec validation
5. **Suivi et historique** des classifications

## 📊 Fonctionnalités Principales

### 🔐 Gestion des Utilisateurs
- Authentification sécurisée avec bcrypt
- Gestion des sessions
- Contrôle d'accès par rôles
- Historique des connexions

### 📦 Gestion des Produits
- Enregistrement de produits individuels
- Gestion de paquets/groupes de produits
- Classification automatique par IA
- Validation par les agents

### 📈 Statistiques et Rapports
- Statistiques en temps réel
- Rapports périodiques automatiques
- Tableaux de bord par utilisateur
- Analyses de performance

### 🔍 Recherche et Filtrage
- Recherche multicritères
- Filtres par section, statut, date
- Historique des classifications
- Export de données

## 🧪 Tests et Démonstration

### Interface de Test
Ouvrir `test-interface.html` dans un navigateur pour :
- Tester l'authentification
- Essayer la classification IA
- Enregistrer des produits
- Consulter les statistiques
- Valider le workflow complet

### Tests Automatisés
```javascript
// Test complet du système
const integration = new TariffDatabaseIntegration();
await integration.runSystemTest();
```

## 🛡️ Sécurité

### Mesures Implémentées
- Mots de passe hashés avec bcrypt
- Gestion sécurisée des sessions
- Validation des entrées utilisateur
- Logs d'audit complets
- Contrôle d'accès granulaire

### Recommandations Production
- Utiliser HTTPS exclusivement
- Configurer un firewall de base de données
- Mettre en place des sauvegardes automatiques
- Monitorer les tentatives d'intrusion
- Implémenter la rotation des mots de passe

## 📚 API et Intégration

### Principales Classes JavaScript
```javascript
// Gestionnaire de base de données
const dbManager = new DatabaseManager();

// Classification IA
const aiClassifier = new TariffAIClassifier();

// Intégration complète
const integration = new TariffDatabaseIntegration();
```

### Procédures Stockées
- `GetUserStatistics(user_id)` - Statistiques utilisateur
- `ValidateProduct(product_id, validator_id)` - Validation produit

### Vues Utiles
- `Vue_Produits_Complets` - Vue complète des produits avec utilisateurs
- `Vue_Statistiques_Utilisateur` - Statistiques par utilisateur

## 🔧 Maintenance

### Tâches Régulières
- Nettoyage des sessions expirées
- Archivage des anciens rapports
- Mise à jour des taux d'imposition
- Sauvegarde des données critiques

### Monitoring
- Surveillance des performances
- Alertes de capacité
- Logs d'erreurs
- Métriques d'utilisation

## 📞 Support

Pour toute question ou problème :
- Consulter la documentation technique
- Vérifier les logs système
- Tester avec l'interface de démonstration
- Contacter l'équipe de développement

---

**Version**: 1.0.0  
**Date**: Août 2025  
**Licence**: CEDEAO - Usage Officiel
