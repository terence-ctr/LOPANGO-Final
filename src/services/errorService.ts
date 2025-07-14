import { AxiosError } from 'axios';

export interface ErrorConfig {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  title?: string;
  duration?: number;
}

export function handleError(error: unknown): string {
  let errorMessage = 'Une erreur est survenue';
  
  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    errorMessage = (error as { message: string }).message;
  } else {
    errorMessage = 'Une erreur inattendue est survenue';
  }

  return errorMessage;
}

export function show(errorConfig: ErrorConfig) {
  // Ici, vous pouvez implémenter la logique pour afficher l'erreur
  // Par exemple, en utilisant une bibliothèque de notifications
  console.error(errorConfig.message);
  return errorConfig.message;
}

export function showError(error: unknown) {
  // Utilise la fonction handleError pour extraire de façon sécurisée le message
  const message = handleError(error);
  show({ message, type: 'error' });
}

export function showSuccess(message: string) {
  show({ message, type: 'success' });
}

export function showWarning(message: string) {
  show({ message, type: 'warning' });
}

export function showInfo(message: string) {
  show({ message, type: 'info' });
}
