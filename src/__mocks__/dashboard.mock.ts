import type { MockProperty, MockPayment } from './types';

type MockAlert = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  date: string;
  read: boolean;
  propertyId?: string;
  contractId?: string;
  propertyName?: string;
};

export const mockProperties: MockProperty[] = [
  {
    id: '1',
    name: 'Appartement T1',
    address: '123 Rue de la Paix, 75001 Paris',
    rent: 800,
    status: 'active',
    image: '/images/properties/appartement-1.jpg',
    description: 'Bel appartement lumineux proche des commodités'
  },
  {
    id: '2',
    name: 'Studio République',
    address: '45 Avenue de la République, 75011 Paris',
    rent: 650,
    status: 'active',
    image: '/images/properties/studio-1.jpg',
    description: 'Studio fonctionnel dans quartier animé'
  }
];

export const mockPayments: MockPayment[] = [
  {
    id: 'p1',
    amount: 800,
    date: '2025-06-15',
    status: 'completed',
    description: 'Loyer juin 2025',
    propertyId: '1',
    propertyName: 'Appartement T1'
  },
  {
    id: 'p2',
    amount: 800,
    date: '2025-05-15',
    status: 'completed',
    description: 'Loyer mai 2025',
    propertyId: '1',
    propertyName: 'Appartement T1'
  },
  {
    id: 'p3',
    amount: 650,
    date: '2025-06-10',
    status: 'completed',
    description: 'Loyer juin 2025',
    propertyId: '2',
    propertyName: 'Studio République'
  }
];

export const mockAlerts: MockAlert[] = [
  {
    id: 'a1',
    title: 'Paiement reçu',
    message: ' a effectué un paiement de 800€ pour le loyer de juin.',
    type: 'success',
    date: '2025-06-15T10:30:00Z',
    read: false,
    propertyId: '1',
    propertyName: 'Appartement T1'
  },
  {
    id: 'a2',
    title: 'Rappel de paiement',
    message: ' doit encore régler le loyer pour le mois de juillet.',
    type: 'warning',
    date: '2025-06-28T09:15:00Z',
    read: true,
    propertyId: '1',
    propertyName: 'Appartement T1'
  }
];

// Simule un appel API pour récupérer les propriétés
export const fetchMockProperties = (): Promise<MockProperty[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockProperties);
    }, 300);
  });
};

// Simule un appel API pour récupérer les paiements récents
export const fetchMockRecentPayments = (): Promise<MockPayment[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockPayments);
    }, 400);
  });
};

// Simule un appel API pour récupérer les alertes récentes
export const fetchMockRecentAlerts = (): Promise<MockAlert[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockAlerts);
    }, 500);
  });
};
