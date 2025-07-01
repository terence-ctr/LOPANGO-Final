import type { Contract, Address, ContractStatus } from '@/types/contract';

const createAddress = (street: string, city: string, postalCode: string, country = 'congo'): Address => ({
  street,
  city,
  postalCode,
  country
});

export const mockContracts: Contract[] = [
  {
    id: '1',
    startDate: '2025-01-01',
    endDate: '2025-12-31',
    rent: 800,
    deposit: 1600,
    currency: 'EUR',
    duration: '12 mois',
    status: 'active' as ContractStatus, 
    propertyId: '1',
    tenantId: '1',
    landlordId: '1',
    property: {
      id: '1',
      title: 'Appartement T1',
      type: 'appartement',
      address: createAddress('123 Rue de la Paix', 'Paris', '75001'),
      rent: 800,
      deposit: 1600,
      usage: 'residentiel',
      area: 45,
      rooms: 2,
      bathrooms: 1,
      floor: 2,
      description: 'Bel appartement lumineux proche des commodités',
      equipment: ['Cuisine équipée', 'Ascenseur'],
      ownerId: '1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    tenant: {
      id: '1',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      telephone: '+33123456789',
      address: createAddress('10 Avenue des Champs-Élysées', 'Paris', '75008')
    },
    landlord: {
      id: '1',
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@example.com',
      telephone: '+33612345678',
      address: createAddress('15 Rue de Rivoli', 'Paris', '75004')
    }
  },
  {
    id: '2',
    startDate: '2025-02-01',
    endDate: '2026-01-31',
    rent: 650,
    deposit: 1300,
    currency: 'EUR',
    duration: '12 mois',
    status: 'active' as ContractStatus, 
    propertyId: '2',
    tenantId: '2',
    landlordId: '1',
    property: {
      id: '2',
      title: 'Studio République',
      type: 'appartement',
      address: createAddress('45 Avenue de la République', 'Paris', '75011'),
      rent: 650,
      deposit: 1300,
      usage: 'residentiel',
      area: 25,
      rooms: 1,
      bathrooms: 1,
      floor: 3,
      description: 'Studio fonctionnel dans quartier animé',
      equipment: ['Cuisine équipée'],
      ownerId: '1',
      createdAt: '2024-02-01T00:00:00Z',
      updatedAt: '2024-02-01T00:00:00Z'
    },
    tenant: {
      id: '2',
      firstName: 'Marie',
      lastName: 'Martin',
      email: 'marie.martin@example.com',
      telephone: '+33698765432',
      address: createAddress('20 Rue de la Roquette', 'Paris', '75011')
    },
    landlord: {
      id: '1',
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@example.com',
      telephone: '+33612345678',
      address: createAddress('15 Rue de Rivoli', 'Paris', '75004')
    }
  }
];

export const fetchMockContracts = (): Promise<Contract[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(mockContracts);
    }, 500); // Délai court pour simuler une réponse rapide
  });
};
