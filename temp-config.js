// Fichier temporaire pour vérifier la configuration
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Vérifier si le fichier .env existe
const envPath = join(process.cwd(), '.env');
const envExists = existsSync(envPath);

console.log('Fichier .env existe:', envExists);

if (envExists) {
  console.log('Contenu du fichier .env:');
  try {
    const content = readFileSync(envPath, 'utf8');
    console.log(content);
    
    // Vérifier si DB_DIALECT est défini sur sqlite
    if (content.includes('DB_DIALECT=sqlite')) {
      console.log('\nConfiguration SQLite détectée');
    } else {
      console.log('\nMise à jour de la configuration pour utiliser SQLite...');
      const updatedContent = content
        .replace(/DB_DIALECT=.*/g, 'DB_DIALECT=sqlite')
        .replace(/DB_HOST=.*\n/g, '')
        .replace(/DB_PORT=.*\n/g, '')
        .replace(/DB_NAME=.*\n/g, '')
        .replace(/DB_USER=.*\n/g, '')
        .replace(/DB_PASSWORD=.*\n/g, '');
      
      writeFileSync(envPath, updatedContent);
      console.log('Configuration mise à jour pour utiliser SQLite');
    }
  } catch (err) {
    console.error('Erreur lors de la lecture du fichier .env:', err);
  }
} else {
  console.log('Création d\'un fichier .env de base...');
  const defaultEnv = `# Configuration du serveur
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Configuration de la session
SESSION_SECRET=dev_session_secret_123456

# Configuration JWT
JWT_SECRET=dev_jwt_secret_123456
JWT_REFRESH_SECRET=dev_refresh_secret_123456

# Configuration de l'application
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
BCRYPT_SALT_ROUNDS=10

# Configuration SQLite
DB_DIALECT=sqlite
`;
  
  try {
    writeFileSync(envPath, defaultEnv);
    console.log('Fichier .env créé avec succès avec la configuration SQLite');
  } catch (err) {
    console.error('Erreur lors de la création du fichier .env:', err);
  }
}
