# LOPANGO - Plateforme de Gestion Immobilière

## 📋 Description

LOPANGO est une application web complète de gestion immobilière qui permet une gestion simplifiée des propriétés, des locataires, des contrats et des paiements. La plateforme est conçue pour différents types d'utilisateurs : administrateurs, propriétaires, locataires et agents immobiliers.

## 🚀 Fonctionnalités

### Pour les Administrateurs

- Tableau de bord administratif
- Gestion complète des utilisateurs
- Supervision des propriétés et contrats
- Suivi des paiements et taxes
- Gestion des réclamations

### Pour les Propriétaires

- Gestion des biens immobiliers
- Suivi des locations et des loyers
- Gestion des documents
- Calendrier des disponibilités
- Suivi de la maintenance

### Pour les Locataires

- Tableau de bord personnel
- Consultation des contrats
- Paiement en ligne
- Dépôt de réclamations
- Gestion des documents

### Pour les Agents Immobiliers

- Gestion du portefeuille clients
- Suivi des visites et rendez-vous
- Gestion des mandats
- Suivi des commissions

## 🎨 Modèles de Conception (Design Patterns)

### 1. Singleton

- **Utilisation** : Gestion unique des services comme `PersistenceService`
- **Avantages** : Assure une seule instance du service dans toute l'application
- **Exemple** : Gestion du stockage local avec une seule source de vérité

### 2. Composition API (Vue 3)

- **Utilisation** : Organisation logique du code par fonctionnalité
- **Avantages** : Meilleure organisation, réutilisation et testabilité du code
- **Exemple** : Séparation des préoccupations dans les composants Vue

### 3. Store Pattern (Pinia)

- **Utilisation** : Gestion centralisée de l'état de l'application
- **Avantages** : État prévisible et facile à déboguer
- **Exemple** : Gestion de l'authentification avec `useAuthStore`

### 4. Repository Pattern

- **Utilisation** : Abstraction de l'accès aux données
- **Avantages** : Séparation des préoccupations, facilité de test
- **Exemple** : Services API pour les utilisateurs, propriétés, etc.

### 5. Observer Pattern

- **Utilisation** : Réactivité dans Vue.js et gestion des événements
- **Avantages** : Découplage des composants
- **Exemple** : Abonnements aux changements d'état

### 6. Factory Pattern

- **Utilisation** : Création d'objets complexes
- **Avantages** : Encapsulation de la logique de création
- **Exemple** : Génération de formulaires dynamiques

## 🗃️ Migration de la table Properties

### Structure de la table

La table `properties` a été créée avec les champs suivants :

#### Informations de base

- `id` : Identifiant unique auto-incrémenté
- `title` : Titre de l'annonce
- `description` : Description détaillée
- `type` : Type de bien (T1, T2, T3, T4+, MAISON, APPARTEMENT, BUREAU, COMMERCE, AUTRE)
- `status` : Statut actuel (DISPONIBLE, LOUE, EN_ENTRETIEN, INDISPONIBLE, BROUILLON)
- `is_active` : Si le bien est actif
- `is_featured` : Si le bien est mis en avant

#### Relations

- `owner_id` : Référence vers le propriétaire (users.id)
- `tenant_id` : Référence optionnelle vers le locataire actuel (users.id)

#### Adresse

- `street` : Rue
- `city` : Ville
- `postal_code` : Code postal
- `country` : Pays
- `full_address` : Adresse complète générée automatiquement
- `latitude` / `longitude` : Coordonnées GPS

#### Caractéristiques

- `area` : Superficie en m²
- `floor_area` : Surface habitable en m²
- `land_area` : Surface du terrain en m²
- `rooms` : Nombre de pièces
- `bathrooms` : Nombre de salles de bain
- `floor` : Étage
- `furnished` : Si le bien est meublé
- `equipment` : Liste des équipements (stockée en JSON)
- `year_built` : Année de construction

#### Équipements (booléens)

- `has_elevator` : Ascenseur
- `has_parking` : Parking
- `has_balcony` : Balcon
- `has_terrace` : Terrasse
- `has_garden` : Jardin
- `has_pool` : Piscine
- `has_air_conditioning` : Climatisation
- `has_heating` : Chauffage

#### Financier

- `rent` : Loyer mensuel
- `charges` : Charges mensuelles
- `deposit` : Dépôt de garantie
- `currency` : Devise (par défaut EUR)

#### Métadonnées

- `available_from` : Date de disponibilité
- `published_at` : Date de publication
- `custom_fields` : Champs personnalisés (JSON)
- `created_at` / `updated_at` : Horodatages

### Index

- Index sur `status`, `is_active`, `is_featured` pour les recherches filtrées
- Index sur `city`, `postal_code` pour la recherche géographique
- Index sur `owner_id` pour les requêtes par propriétaire

### Migration

La migration `20250618232825_create_properties_table.cjs` a été créée pour gérer la création et la suppression de la table.

#### Pour exécuter la migration

```bash
npx knex migrate:latest
```

#### Pour annuler la migration

```bash
npx knex migrate:rollback
```

## 🔄 Refactorisation du composant PropertiesView.vue

### Problèmes résolus

- Correction de la structure invalide du composant (suppression des balises HTML, HEAD, BODY)
- Conversion en composant Vue 3 standard avec Composition API et TypeScript
- Suppression du code JavaScript inline et des manipulations DOM directes
- Amélioration de la réactivité avec les refs de Vue
- Nettoyage du code dupliqué et des éléments obsolètes

### Améliorations apportées

- Structure propre avec une seule balise `<template>` racine
- Script setup avec typage TypeScript
- Données réactives pour la gestion de l'état
- Gestion des événements avec les méthodes Vue
- Styles scoped pour éviter les conflits CSS

### Fonctionnalités implémentées

- Affichage de la liste des propriétés avec leurs détails
- Barre de recherche et filtres
- Menu d'actions pour chaque propriété
- Préparation pour l'ajout de modales (à implémenter)

## 🛠️ Technologies Utilisées

### Frontend

- Vue.js 3 (Composition API)
- TypeScript
- Vite (Build Tool)
- Pinia (Gestion d'état)
- Vue Router (Gestion des routes)
- Tailwind CSS (Styling)
- Headless UI (Composants UI)

## 🚀 Démarrage Rapide

### Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

1. Cloner le dépôt :

   ```bash
   git clone [URL_DU_REPO]
   cd LOPANGO-Final
   ```

2. Installer les dépendances :

   ```bash
   # Dans le terminal
   npm install
   npm run dev
   ```

3. Créer un fichier `.env` à la racine du projet en vous basant sur `.env.example`

4. Démarrer le serveur de développement :

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Pour la production :

   ```bash
   npm run build
   npm run preview
   ```

## 📁 Structure du Projet

```text
src/
├── assets/          # Ressources statiques
├── components/      # Composants réutilisables
│   ├── common/      # Composants généraux
│   ├── landlord/    # Composants propriétaires
│   ├── shared/      # Composants partagés
│   └── tenant/      # Composants locataires
├── composables/     # Logique réutilisable
├── config/         # Fichiers de configuration
├── layouts/        # Mises en page principales
├── router/         # Configuration des routes
├── services/       # Appels API
├── stores/         # Gestion d'état (Pinia)
├── types/          # Définitions TypeScript
├── utils/          # Utilitaires
├── validations/    # Schémas de validation
└── views/          # Pages de l'application
```

## 🔒 Sécurité

- Authentification JWT
- Gestion des rôles et permissions
- Protection des routes
- Validation des formulaires

## 📚 Documentation

### Développement

- [Documentation Vue 3](https://v3.vuejs.org/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Pinia](https://pinia.vuejs.org/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)

## 🔧 Dépannage

### Problème 1 : Échec de l'inscription - Contrainte de genre non respectée

**Symptôme**  

```text
Erreur: SQLITE_CONSTRAINT: CHECK constraint failed: gender
```

**Cause**  

- La table `users` a une contrainte CHECK qui n'accepte que les valeurs : 'male', 'female' ou 'other' (en minuscules)
- Le frontend envoyait 'Male' (avec une majuscule)
- La validation côté backend n'était pas assez stricte

## 🔍 Dépannage

### Problème : Erreur de compilation dans le store d'authentification

#### Description de l'erreur

L'application rencontrait une erreur de compilation avec le message suivant :

```text
GET http://localhost:5173/src/stores/auth.ts?t=1750093752687 net::ERR_ABORTED 500 (Internal Server Error)
Transform failed with 1 error:
C:/Users/teren/Music/LOPANGO Final/src/stores/auth.ts:160:6: ERROR: Unexpected "catch"
C:/Users/teren/Music/LOPANGO Final/src/stores/auth.ts:160:6
```

#### Cause du problème

L'erreur était due à une structure incorrecte dans la fonction `checkAuth` du store d'authentification. Plus précisément :

1. Un bloc `catch` mal positionné qui n'était pas correctement associé à un bloc `try`
2. Une mauvaise gestion des accolades ouvrantes et fermantes dans la fonction
3. Une logique de gestion d'erreurs qui pouvait potentiellement masquer des problèmes sous-jacents

#### Correctifs appliqués

1. **Restructuration de la fonction `checkAuth`** :
   - Réorganisation complète de la fonction pour une meilleure lisibilité
   - Correction de l'imbrication des blocs `try/catch`
   - Amélioration de la gestion des erreurs

2. **Normalisation du `userType`** :
   - Ajout d'une logique pour s'assurer que le `userType` est toujours en minuscules
   - Gestion des cas où le champ s'appelle `user_type` au lieu de `userType`
   - Nettoyage des anciennes clés après normalisation

3. **Amélioration des logs** :
   - Ajout de logs détaillés pour faciliter le débogage
   - Affichage des données brutes des réponses pour une meilleure visibilité

4. **Correction des références** :
   - Utilisation cohérente des références aux données utilisateur
   - Mise à jour des chemins de redirection en fonction du `userType`

#### Prochaines étapes

1. **Tests approfondis** :
   - Tester la connexion avec différents types d'utilisateurs
   - Vérifier que la barre latérale affiche les bons menus en fonction du rôle
   - S'assurer que les redirections fonctionnent correctement

2. **Améliorations potentielles** :
   - Ajouter des tests unitaires pour le store d'authentification
   - Implémenter une meilleure gestion des erreurs côté client
   - Ajouter des validations supplémentaires pour les données utilisateur

3. **Documentation** :
   - Mettre à jour la documentation technique
   - Documenter les flux d'authentification et les rôles utilisateurs

### Problème : Erreur de contrainte sur le champ gender

#### Solution appliquée

1. Normalisation du genre en minuscules côté backend
2. Validation stricte des valeurs autorisées
3. Meilleurs messages d'erreur

### Problème : Erreur de contrainte CHECK sur le champ document_type

#### Symptômes

- Erreur SQL : `SQLITE_CONSTRAINT: CHECK constraint failed: document_type`
- L'insertion échoue lors de la création d'une identité utilisateur

#### Cause

La table `identities` a une contrainte CHECK sur la colonne `document_type` qui n'accepte que les valeurs suivantes :

- 'permis_conduire'
- 'passeport'
- 'carte_identite'

1. **Normalisation du type de document** :

   - Conversion en minuscules
   - Suppression des espaces superflus
   - Gestion des variantes courantes (ex: 'passport' → 'passeport')

2. **Valeurs par défaut** :

   - Si le type de document n'est pas reconnu, 'carte_identite' est utilisé par défaut

3. **Logs détaillés** :

   - Affichage de la valeur originale
   - Affichage de la valeur nettoyée
   - Affichage de la valeur normalisée

4. **Gestion des erreurs améliorée** :

   - Messages d'erreur détaillés
   - Capture des codes d'erreur SQLite
   - Logs structurés pour le débogage

### Problème 2 : Échec de création d'adresse - Clé étrangère invalide

**Symptôme**  

```text
SQLITE_CONSTRAINT: FOREIGN KEY constraint failed
```

**Cause**  

- L'ID utilisateur était mal extrait après l'insertion
- La valeur était envoyée sous forme d'objet `{"id":1}` au lieu d'un nombre simple `1`

**Solution**  

1. Meilleure gestion du retour d'insertion SQLite
2. Vérification et conversion explicite en nombre
3. Logs détaillés pour le débogage

## 🤝 Contribution

1. Forkez le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 🗃️ Base de Données et Migrations

### Schéma des Contraintes

#### Table `users`

- `gender` : CHECK (gender IN ('male', 'female', 'other'))
- `user_type` : CHECK (user_type IN ('tenant', 'landlord', 'agent', 'admin'))

#### Table `addresses`

- Contrainte de clé étrangère sur `user_id` référençant `users(id)`

### Scripts Utiles

#### Vérification du schéma

```bash
# Voir la structure de la table users
node scripts/check-users-schema.ts

# Tester les contraintes de genre
node scripts/check-gender-constraint.ts
```

### Schéma de la Base de Données

La base de données utilise SQLite avec les tables suivantes :

#### 1. Table `users`

- `id` : Clé primaire auto-incrémentée
- `email` : Email unique de l'utilisateur
- `password` : Mot de passe hashé
- `first_name` : Prénom
- `last_name` : Nom de famille
- `phone` : Numéro de téléphone
- `date_of_birth` : Date de naissance
- `gender` : Genre (male/female/other)
- `user_type` : Type d'utilisateur (tenant/landlord/agent/admin)
- `email_verified` : Statut de vérification de l'email
- `is_active` : Statut actif/désactivé
- `last_login` : Date de dernière connexion
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

#### 2. Table `addresses`

- `id` : Clé primaire auto-incrémentée
- `user_id` : Clé étrangère vers `users.id`
- `street` : Rue
- `city` : Ville
- `postal_code` : Code postal
- `country` : Pays
- `additional_info` : Informations complémentaires
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

#### 3. Table `identities`

- `id` : Clé primaire auto-incrémentée
- `user_id` : Clé étrangère vers `users.id`
- `document_type` : Type de document (permis_conduire/passeport/carte_identite)
- `national_id` : Numéro d'identification national
- `document_front_url` : URL du recto du document
- `document_back_url` : URL du verso du document
- `verified` : Statut de vérification
- `verified_at` : Date de vérification
- `verified_by` : ID de l'administrateur ayant vérifié
- `verification_comment` : Commentaire de vérification
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

#### 4. Table `refresh_tokens`

- `id` : Clé primaire auto-incrémentée
- `user_id` : Clé étrangère vers `users.id`
- `token` : Jeton de rafraîchissement unique
- `expires_at` : Date d'expiration
- `revoked` : Statut de révocation
- `revoked_at` : Date de révocation
- `replaced_by_token` : Nouveau jeton de remplacement
- `ip_address` : Adresse IP de la requête
- `user_agent` : User-Agent du navigateur
- `created_at` : Date de création
- `updated_at` : Date de mise à jour

### Gestion des Migrations

#### Configuration

Le projet utilise Knex.js pour la gestion des migrations. La configuration se trouve dans `knexfile.js`.

#### Commandes de Migration

1. **Créer une nouvelle migration** :

   ```bash
   npx knex migrate:make nom_de_la_migration
   ```

2. **Exécuter les migrations** :

   ```bash
   node run-migration.js
   ```

   Ce script va :
   - Se connecter à la base de données
   - Annuler les migrations existantes
   - Exécuter toutes les migrations disponibles
   - Afficher les tables créées

3. **Annuler la dernière migration** :

   ```bash
   npx knex migrate:rollback
   ```

4. **Voir le statut des migrations** :

   ```bash
   npx knex migrate:status
   ```

#### Structure des Fichiers de Migration

Les migrations sont stockées dans `server/database/migrations/` et suivent le format :

```bash
YYYYMMDDHHmmss_nom_de_la_migration.cjs
```

Chaque migration doit exporter deux fonctions :

- `up` : Pour appliquer la migration
- `down` : Pour annuler la migration

### Environnements

La base de données prend en charge trois environnements :

1. **Développement** : `server/database/lopango_dev.sqlite3`
2. **Test** : `server/database/test.sqlite3`
3. **Production** : `server/database/lopango_prod.sqlite3`

L'environnement est défini par la variable d'environnement `NODE_ENV`.

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## ✉️ Contact
