# LOPANGO - API Backend

Ce dépôt contient le code source de l'API backend pour la plateforme immobilière LOPANGO, développée avec Node.js, Express.js, TypeScript et SQLITE.

## Prérequis

- Node.js (version 16 ou supérieure)
- npm (version 8 ou supérieure) ou yarn
- MySQL (version 8.0 ou supérieure)
- Git

## Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/votre-utilisateur/lopango-backend.git
   cd lopango-backend
   ```

2. **Installer les dépendances**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer l'environnement**

   Créez un fichier `.env` à la racine du projet en copiant le fichier d'exemple :

   ```bash
   cp .env.example .env
   ```

   Puis modifiez les variables d'environnement dans le fichier `.env` selon votre configuration.

4. **Configurer la base de données**

   Assurez-vous que MySQL est en cours d'exécution, puis créez une base de données vide :

   ```sql
   CREATE DATABASE lopango CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

5. **Exécuter les migrations**

   ```bash
   npm run db:migrate
   # ou
   yarn db:migrate
   ```

6. **Lancer le serveur en mode développement**

   ```bash
   npm run dev
   # ou
   yarn dev
   ```

Le serveur démarrera sur `http://localhost:3001` par défaut.

## Commandes utiles

- `npm run dev` - Lance le serveur en mode développement avec rechargement automatique
- `npm run build` - Compile le code TypeScript en JavaScript
- `npm start` - Lance le serveur en mode production
- `npm run lint` - Exécute ESLint pour vérifier le code
- `npm run test` - Exécute les tests
- `npm run db:migrate` - Exécute les migrations de base de données
- `npm run db:rollback` - Annule la dernière migration
- `npm run db:seed` - Exécute les seeders pour peupler la base de données avec des données de test

## Structure du projet

```plaintext
server/
├── src/                    # Code source TypeScript
│   ├── config/             # Fichiers de configuration
│   ├── controllers/        # Contrôleurs pour gérer les requêtes
│   ├── middleware/         # Middlewares personnalisés
│   ├── models/             # Modèles de données
│   ├── routes/             # Définition des routes
│   ├── services/           # Logique métier
│   ├── types/              # Définitions de types TypeScript
│   ├── utils/              # Utilitaires et helpers
│   ├── validators/         # Validateurs de données
│   ├── app.ts              # Configuration de l'application Express
│   └── server.ts           # Point d'entrée du serveur
├── .env.example            # Exemple de fichier d'environnement
├── .eslintrc.js            # Configuration ESLint
├── .gitignore              # Fichiers à ignorer par Git
├── package.json            # Dépendances et scripts
├── README.md               # Ce fichier
└── tsconfig.json           # Configuration TypeScript
```

## Variables d'environnement

Le fichier `.env` doit contenir les variables suivantes :

```env
# Configuration du serveur
PORT=3001
NODE_ENV=development

# Configuration de la session
SESSION_SECRET=votre_secret_session_tres_securise

# Configuration JWT
JWT_SECRET=votre_cle_secrete_tres_securisee
JWT_REFRESH_SECRET=votre_cle_rafraichissement_tres_securisee
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
JWT_ISSUER=lopango-api
JWT_AUDIENCE=lopango-app

# Configuration de l'application
APP_NAME=LOPANGO
SUPPORT_EMAIL=support@lopango.com

# Configuration de l'API
API_URL=http://localhost:3001

# Configuration du client
CLIENT_URL=http://localhost:5173
EMAIL_VERIFICATION_URL=http://localhost:5173/verify-email
PASSWORD_RESET_URL=http://localhost:5173/reset-password

# Configuration de sécurité
MAX_LOGIN_ATTEMPTS=5
ACCOUNT_LOCKOUT_TIME=15
RESET_TOKEN_EXPIRES_IN=1h
EMAIL_VERIFICATION_EXPIRES_IN=24h

# Configuration du hachage de mot de passe
BCRYPT_SALT_ROUNDS=12

# Configuration de la base de données
DB_HOST=localhost
DB_PORT=3306
DB_NAME=lopango
DB_USER=root
DB_PASSWORD=
DB_DIALECT=mysql
```

## Développement

### Lancer le serveur en mode développement

```bash
npm run dev
```

### Lancer les tests

```bash
npm test
```

### Vérifier le style de code

```bash
npm run lint
```

### Générer la documentation de l'API

```bash
npm run docs
```

## Déploiement

### Préparer pour la production

1. Compilez le code TypeScript :

   ```bash
   npm run build
   ```

2. Configurez les variables d'environnement pour la production dans `.env`.

3. Assurez-vous que la base de données est configurée et que les migrations ont été exécutées.

### Avec PM2 (recommandé pour la production)

1. Installez PM2 globalement :

   ```bash
   npm install -g pm2
   ```

2. Démarrez l'application avec PM2 :

   ```bash
   pm2 start dist/server.js --name lopango-api
   ```

Pour plus d'informations sur PM2, consultez la [documentation officielle](https://pm2.keymetrics.io/).

## API Documentation

Une fois le serveur démarré, vous pouvez accéder à la documentation de l'API à l'adresse :

```bash
http://localhost:3001/api-docs
```

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
