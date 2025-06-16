# Système d'Authentification LOPANGO

Ce document décrit le système d'authentification personnalisé mis en place pour LOPANGO, utilisant des IDs personnalisés et des tokens JWT.

## Fonctionnalités

- Génération d'IDs personnalisés avec préfixes selon le type d'utilisateur
- Authentification par email/mot de passe
- Gestion des rôles (admin, agent, landlord, tenant)
- Rafraîchissement des tokens
- Protection des routes avec middleware d'authentification et d'autorisation
- Journalisation détaillée des activités d'authentification

## Configuration requise

Assurez-vous d'avoir configuré les variables d'environnement suivantes dans votre fichier `.env` :

```
# Configuration des préfixes d'ID
ID_PREFIX_ADMIN=ADM
ID_PREFIX_AGENT=AGN
ID_PREFIX_LANDLORD=LND
ID_PREFIX_TENANT=TNT
ID_PREFIX_USER=USR

# Configuration JWT
JWT_SECRET=votre_secret_tres_securise
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=votre_refresh_secret_tres_securise
REFRESH_TOKEN_EXPIRES_IN=7d
```

## Format des IDs personnalisés

Les IDs utilisateurs suivent le format : `{PREFIX}-{UUIDv4}`

Exemples :
- `ADM-123e4567-e89b-12d3-a456-426614174000` (Admin)
- `AGN-223e4567-e89b-12d3-a456-426614174001` (Agent)
- `LND-323e4567-e89b-12d3-a456-426614174002` (Propriétaire)
- `TNT-423e4567-e89b-12d3-a456-426614174003` (Locataire)

## Initialisation de la base de données

Pour initialiser la base de données avec des utilisateurs de test :

```bash
# Installation de cross-env si nécessaire
npm install -g cross-env

# Initialisation de la base de données
npm run db:init
```

Cela créera les utilisateurs suivants :

| Email | Mot de passe | Rôle | Statut |
|-------|-------------|------|---------|
| admin@lopango.com | Admin123! | Admin | Actif |
| agent@lopango.com | Agent123! | Agent | Actif |
| proprietaire@lopango.com | Landlord123! | Propriétaire | Actif |
| locataire@lopango.com | Tenant123! | Locataire | Actif |
| locataire2@lopango.com | Tenant123! | Locataire | En attente de vérification |

## Utilisation des tokens

### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@lopango.com",
  "password": "Admin123!"
}
```

Réponse :

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "15m",
    "tokenType": "Bearer"
  }
}
```

### Rafraîchissement du token

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "votre_refresh_token_ici"
}
```

### Utilisation du token d'accès

Ajoutez le token JWT dans le header `Authorization` :

```
Authorization: Bearer votre_token_ici
```

## Protection des routes

### Authentification requise

```typescript
import { authenticate } from '@/middleware/auth.middleware';

router.get('/profil', authenticate, (req, res) => {
  // Seuls les utilisateurs authentifiés peuvent accéder à cette route
  res.json({ user: req.user });
});
```

### Autorisation par rôle

```typescript
import { authenticate, authorize } from '@/middleware/auth.middleware';

// Seuls les administrateurs peuvent accéder à cette route
router.get('/admin', 
  authenticate, 
  authorize('admin'), 
  (req, res) => {
    res.json({ message: 'Accès admin autorisé' });
  }
);

// Plusieurs rôles peuvent être spécifiés
router.get('/admin-et-agents', 
  authenticate, 
  authorize('admin', 'agent'),
  (req, res) => {
    res.json({ message: 'Accès autorisé pour admin et agent' });
  }
);
```

## Gestion des erreurs

Le système renvoie des réponses d'erreur standardisées :

- `401 Unauthorized` : Authentification requise ou token invalide
- `403 Forbidden` : Accès refusé (droits insuffisants)
- `400 Bad Request` : Données de requête invalides
- `429 Too Many Requests` : Trop de tentatives de connexion

## Journalisation

Toutes les activités d'authentification sont enregistrées dans les fichiers de logs :

- `logs/combined.log` : Tous les logs
- `logs/error.log` : Erreurs uniquement

Les logs incluent des informations détaillées telles que :
- Date et heure
- Niveau de log (info, warn, error, etc.)
- ID de la requête
- Adresse IP de l'utilisateur
- Détails de l'erreur (le cas échéant)
- Données de la requête (sans les informations sensibles)

## Sécurité

- Les mots de passe sont hachés avec bcrypt
- Les tokens JWT sont signés avec une clé secrète forte
- Les tokens ont une durée de vie limitée
- Les refresh tokens peuvent être révoqués
- Protection contre les attaques par force brute
- Headers de sécurité HTTP (CORS, Helmet, etc.)
- Validation des entrées utilisateur

## Tests

Pour tester le système d'authentification, vous pouvez utiliser les outils suivants :

1. **Postman** : Pour les requêtes API manuelles
2. **Tests automatisés** : Voir le dossier `__tests__/auth`
3. **Interface utilisateur** : L'interface web de développement

## Dépannage

### Problèmes courants

1. **Token expiré** : Le token JWT a une durée de vie limitée (15 minutes par défaut)
   - Solution : Rafraîchissez le token avec le refresh token

2. **Accès refusé** : L'utilisateur n'a pas les droits nécessaires
   - Vérifiez le rôle de l'utilisateur et les permissions requises

3. **Compte désactivé** : Le compte peut être en attente de vérification ou suspendu
   - Vérifiez le statut du compte dans la base de données

### Journalisation

En cas de problème, consultez les fichiers de logs pour plus d'informations :

```bash
# Afficher les logs d'erreur
tail -f logs/error.log

# Afficher tous les logs
tail -f logs/combined.log
```

## Évolution

### Améliorations futures

- Authentification à deux facteurs (2FA)
- Connexion sociale (Google, Facebook, etc.)
- Gestion des sessions actives
- Limitation du nombre de connexions simultanées
- Détection d'activité suspecte

### Mises à jour de sécurité

- Mettez régulièrement à jour les dépendances
- Changez régulièrement les clés secrètes JWT
- Auditez régulièrement les logs pour détecter les activités suspectes

---

Pour toute question ou problème, veuillez contacter l'équipe de développement.
