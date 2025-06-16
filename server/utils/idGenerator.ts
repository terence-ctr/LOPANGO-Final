import { UserType } from '../utils/enums/user.enum';
import { v4 as uuidv4 } from 'uuid';

/**
 * Génère un ID personnalisé avec un préfixe basé sur le type d'utilisateur
 * @param userType - Type d'utilisateur (admin, agent, landlord, tenant, user)
 * @returns Un ID unique avec préfixe (ex: ADM-123e4567-e89b-12d3-a456-426614174000)
 */
export function generateUserId(userType: UserType): string {
  // Récupérer le préfixe en fonction du type d'utilisateur
  let prefix = 'USR'; // Par défaut
  
  switch (userType) {
    case 'admin':
      prefix = process.env.ID_PREFIX_ADMIN || 'ADM';
      break;
    case 'agent':
      prefix = process.env.ID_PREFIX_AGENT || 'AGN';
      break;
    case 'landlord':
      prefix = process.env.ID_PREFIX_LANDLORD || 'LND';
      break;
    case 'tenant':
      prefix = process.env.ID_PREFIX_TENANT || 'TNT';
      break;
    case 'user':
    default:
      prefix = process.env.ID_PREFIX_USER || 'USR';
  }
  
  // Générer un UUID v4 et le combiner avec le préfixe
  const uuid = uuidv4();
  return `${prefix}-${uuid}`;
}

/**
 * Vérifie si un ID correspond au format attendu pour un type d'utilisateur
 * @param id - L'ID à vérifier
 * @param userType - Le type d'utilisateur attendu
 * @returns true si l'ID est valide pour le type d'utilisateur, false sinon
 */
export function isValidUserId(id: string, userType: UserType): boolean {
  if (!id) return false;
  
  // Récupérer le préfixe attendu
  let expectedPrefix = 'USR';
  
  switch (userType) {
    case 'admin':
      expectedPrefix = process.env.ID_PREFIX_ADMIN || 'ADM';
      break;
    case 'agent':
      expectedPrefix = process.env.ID_PREFIX_AGENT || 'AGN';
      break;
    case 'landlord':
      expectedPrefix = process.env.ID_PREFIX_LANDLORD || 'LND';
      break;
    case 'tenant':
      expectedPrefix = process.env.ID_PREFIX_TENANT || 'TNT';
      break;
    case 'user':
    default:
      expectedPrefix = process.env.ID_PREFIX_USER || 'USR';
  }
  
  // Vérifier que l'ID commence par le préfixe attendu suivi d'un tiret
  const prefixPattern = new RegExp(`^${expectedPrefix}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`, 'i');
  return prefixPattern.test(id);
}

/**
 * Extrait le type d'utilisateur à partir d'un ID
 * @param id - L'ID de l'utilisateur
 * @returns Le type d'utilisateur ou null si non valide
 */
export function getUserTypeFromId(id: string): UserType | null {
  if (!id || typeof id !== 'string') return null;
  
  const prefix = id.split('-')[0];
  
  // Vérifier chaque type d'utilisateur
  if (prefix === (process.env.ID_PREFIX_ADMIN || 'ADM')) return 'admin';
  if (prefix === (process.env.ID_PREFIX_AGENT || 'AGN')) return 'agent';
  if (prefix === (process.env.ID_PREFIX_LANDLORD || 'LND')) return 'landlord';
  if (prefix === (process.env.ID_PREFIX_TENANT || 'TNT')) return 'tenant';
  if (prefix === (process.env.ID_PREFIX_USER || 'USR')) return 'user';
  
  return null;
}

/**
 * Vérifie si un ID a un format valide (quel que soit le type)
 * @param id - L'ID à vérifier
 * @returns true si l'ID a un format valide, false sinon
 */
export function isValidIdFormat(id: string): boolean {
  if (!id) return false;
  const uuidPattern = /^[A-Z]{2,3}-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
}
