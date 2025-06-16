interface StorageData<T = any> {
  data: T;
  timestamp: number;
  expiresIn?: number; // en millisecondes
}

export class PersistenceService {
  private static instance: PersistenceService;
  private prefix: string = 'lopango_';

  private constructor() {}

  public static getInstance(): PersistenceService {
    if (!PersistenceService.instance) {
      PersistenceService.instance = new PersistenceService();
    }
    return PersistenceService.instance;
  }

  /**
   * Définit une valeur dans le stockage local
   * @param key Clé de stockage
   * @param data Données à stocker
   * @param expiresIn Durée de validité en secondes (optionnel)
   */
  public set<T>(key: string, data: T, expiresIn?: number): void {
    if (typeof window === 'undefined') return;

    const storageData: StorageData<T> = {
      data,
      timestamp: Date.now(),
      expiresIn: expiresIn ? expiresIn * 1000 : undefined
    };

    try {
      localStorage.setItem(
        `${this.prefix}${key}`,
        JSON.stringify(storageData)
      );
    } catch (error) {
      console.error('Erreur lors de la sauvegarde dans le localStorage:', error);
    }
  }

  /**
   * Récupère une valeur depuis le stockage local
   * @param key Clé de stockage
   * @returns Les données stockées ou null si expirées ou inexistantes
   */
  public get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    const item = localStorage.getItem(`${this.prefix}${key}`);
    if (!item) return null;

    try {
      const { data, timestamp, expiresIn } = JSON.parse(item) as StorageData<T>;
      
      // Vérifier si les données ont expiré
      if (expiresIn && Date.now() > timestamp + expiresIn) {
        this.remove(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erreur lors de la lecture du localStorage:', error);
      return null;
    }
  }

  /**
   * Supprime une entrée du stockage local
   * @param key Clé de stockage
   */
  public remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  /**
   * Efface toutes les entrées du stockage local avec le préfixe de l'application
   */
  public clearAll(): void {
    if (typeof window === 'undefined') return;
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
}

export const persistenceService = PersistenceService.getInstance();
