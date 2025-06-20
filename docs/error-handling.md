# Gestion des erreurs dans LOPANGO

Ce document décrit la stratégie de gestion des erreurs mise en place dans l'application LOPANGO, à la fois côté client et côté serveur.

## Architecture

La gestion des erreurs est organisée en plusieurs couches :

1. **Côté client** : Gestion des erreurs dans l'interface utilisateur
2. **Côté serveur** : Gestion des erreurs dans l'API
3. **Journalisation** : Enregistrement des erreurs pour le débogage

## Structure des dossiers

```
src/
  utils/
    error-handling/
      errorHandler.ts    # Gestionnaire d'erreurs principal
      errorConfig.ts     # Configuration des messages d'erreur
      types.ts           # Types TypeScript pour les erreurs

server/
  middleware/
    error-handling/
      errorHandler.ts    # Middleware de gestion des erreurs
  utils/
    logger.ts          # Utilitaire de journalisation
```

## Côté client

### Gestionnaire d'erreurs principal (`errorHandler.ts`)

Ce module fournit des méthodes pour gérer les erreurs de manière centralisée :

- `handleError(error: unknown)` : Traite une erreur et retourne un message utilisateur approprié
- `setupGlobalErrorHandling()` : Configure la gestion des erreurs globales (erreurs non attrapées, rejets de promesses, etc.)

### Configuration des erreurs (`errorConfig.ts`)

Contient les messages d'erreur, les codes d'erreur personnalisés et la configuration de la gestion des erreurs.

#### Utilisation typique

```typescript
import ErrorHandler from '@/utils/error-handling/errorHandler';
import { ERROR_MESSAGES, ERROR_CODES } from '@/utils/error-handling/errorConfig';

try {
  // Code qui peut échouer
} catch (error) {
  const { message, status } = ErrorHandler.handleError(error);
  
  // Afficher un message à l'utilisateur
  showErrorNotification(message);
  
  // Journaliser l'erreur
  console.error(`Erreur ${status}:`, message);
  
  // Rediriger si nécessaire
  if (status === 401) {
    router.push('/login');
  }
}
```

## Côté serveur

### Middleware de gestion des erreurs (`errorHandler.ts`)

Ce middleware intercepte et traite toutes les erreurs qui se produisent pendant le traitement des requêtes.

#### Fonctionnalités

- Traitement des erreurs de validation
- Gestion des erreurs JWT (expiré, invalide)
- Gestion des erreurs de base de données
- Journalisation des erreurs
- Réponses d'erreur normalisées

#### Format de réponse d'erreur

```json
{
  "statusCode": 400,
  "message": "Message d'erreur lisible par l'utilisateur",
  "error": "Bad Request",
  "timestamp": "2023-04-01T12:00:00.000Z",
  "path": "/api/endpoint",
  "errors": {
    "field1": ["Message d'erreur 1", "Message d'erreur 2"],
    "field2": ["Message d'erreur 3"]
  }
}
```

### Journalisation des erreurs (`logger.ts`)

Utilise Winston pour la journalisation des erreurs avec rotation des fichiers de logs.

#### Niveaux de journalisation

- `error` : Erreurs critiques qui nécessitent une attention immédiate
- `warn` : Situations inhabituelles mais non critiques
- `info` : Informations générales sur le fonctionnement de l'application
- `debug` : Informations détaillées pour le débogage
- `trace` : Informations très détaillées (traçage des appels de fonction)

## Bonnes pratiques

1. **Touvez attraper et gérer les erreurs** : Ne laissez jamais une erreur non attrapée remonter jusqu'au gestionnaire d'erreurs global.

2. **Utilisez des erreurs personnalisées** : Étendez la classe `AppError` pour créer des erreurs métier spécifiques.

3. **Fournissez des messages d'erreur utiles** : Les messages d'erreur doivent être clairs et orientés vers l'utilisateur final.

4. **Journalisez les erreurs** : Toutes les erreurs doivent être journalisées avec suffisamment de contexte pour le débogage.

5. **Ne pas exposer d'informations sensibles** : Dans les environnements de production, ne renvoyez pas de détails d'erreur sensibles aux clients.

6. **Testez vos gestionnaires d'erreurs** : Assurez-vous que vos gestionnaires d'erreurs fonctionnent comme prévu dans différents scénarios.

## Exemples

### Création d'une erreur personnalisée

```typescript
import { AppError } from '@/types/error.types';

export class ValidationError extends AppError {
  constructor(message: string = 'Erreur de validation', details?: any) {
    super(message, 422, true, details);
  }
}

// Utilisation
throw new ValidationError('Données invalides', { field: 'email', reason: 'Format invalide' });
```

### Gestion des erreurs dans un contrôleur

```typescript
import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../errors';

export const getUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      throw new NotFoundError('Utilisateur non trouvé');
    }
    
    res.json(user);
  } catch (error) {
    next(error); // Passe l'erreur au middleware de gestion des erreurs
  }
};
```

### Configuration du middleware d'erreurs dans Express

```typescript
import express from 'express';
import { errorHandler, notFoundHandler } from './middleware/error-handling/errorHandler';

const app = express();

// Routes
app.use('/api', apiRouter);

// Gestion des routes non trouvées
app.use(notFoundHandler);

// Gestion des erreurs (doit être le dernier middleware)
app.use(errorHandler);

export default app;
```

## Dépannage

### Erreurs courantes et solutions

1. **Erreur 401 non attrapée** : Vérifiez que le token JWT est correctement envoyé dans l'en-tête `Authorization`.

2. **Erreurs de validation non affichées** : Assurez-vous que les erreurs de validation sont correctement formatées et renvoyées par l'API.

3. **Journaux manquants** : Vérifiez que le dossier `logs` existe et que l'application a les permissions nécessaires pour y écrire.

4. **Erreurs CORS** : Vérifiez la configuration CORS dans `app.ts` pour vous assurer que les origines autorisées sont correctement définies.

## Améliorations futures

- [ ] Ajouter la traduction des messages d'erreur
- [ ] Implémenter le suivi des erreurs avec un service externe (Sentry, LogRocket)
- [ ] Ajouter des métriques pour suivre les erreurs courantes
- [ ] Améliorer la documentation avec des exemples spécifiques à chaque module
