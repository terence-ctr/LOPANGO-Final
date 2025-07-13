// Configuration pour les propriétés
export const propertyConfig = {
  // Types de propriétés disponibles (doivent correspondre à la table property_types)
  propertyTypes: [
    { value: 'T1', label: 'Studio' },
    { value: 'T2', label: 'T2 (2 pièces)' },
    { value: 'T3', label: 'T3 (3 pièces)' },
    { value: 'T4+', label: 'T4+ (4 pièces et plus)' },
    { value: 'MAISON', label: 'Maison individuelle' },
    { value: 'APPARTEMENT', label: 'Appartement' },
    { value: 'BUREAU', label: 'Bureau' },
    { value: 'COMMERCE', label: 'Local commercial' },
    { value: 'AUTRE', label: 'Autre type de bien' },
    { value: 'MAISON_ETAGE', label: 'Maison avec étage' },
    { value: 'MAISON_SANS_ETAGE', label: 'Maison sans étage' },
    { value: 'IMMEUBLE', label: 'Immeuble (bâtiment à plusieurs logements ou bureaux)' },
    { value: 'STUDIO', label: 'Studio' },
    { value: 'VILLA', label: 'Villa' },
    { value: 'TERRAIN', label: 'Terrain (parcelle)' },
    { value: 'COMMERCE_LOCAL', label: 'Commerce local' },
    { value: 'HOTEL', label: 'Hôtel' },
    { value: 'ENTREPOT', label: 'Entrepôt' },
    { value: 'FERME', label: 'Ferme / Concession agricole' },
    { value: 'MAISON_PREFABRIQUEE', label: 'Maison préfabriquée' },
    { value: 'APPARTEMENT_COLLECTIF', label: 'Appartement (logement collectif)' },
    { value: 'LOGGEMENT_SOCIAL', label: 'Logement social' },
    { value: 'COMMERCE_DETAIL', label: 'Commerce de détail' },
    { value: 'BATIMENT_INDUSTRIEL', label: 'Bâtiment industriel' }
  ],
  
  // Statuts disponibles pour une propriété
  statuses: [
    { value: 'DISPONIBLE', label: 'Disponible' },
    { value: 'LOUE', label: 'Loué' },
    { value: 'MAINTENANCE', label: 'En maintenance' },
    { value: 'INACTIF', label: 'Inactif' }
  ],
  
  // Équipements disponibles
  equipment: [
    { value: 'FRIGO', label: 'Réfrigérateur' },
    { value: 'LINGE', label: 'Lave-linge' },
    { value: 'LAVE_VAISSELLE', label: 'Lave-vaisselle' },
    { value: 'MICRO_ONDES', label: 'Four à micro-ondes' },
    { value: 'FOUR', label: 'Four' },
    { value: 'PLAQUE_CUISSON', label: 'Plaque de cuisson' },
    { value: 'CAVE', label: 'Cave' },
    { value: 'GARAGE', label: 'Garage' },
    { value: 'PARKING', label: 'Place de parking' },
    { value: 'INTERNET', label: 'Internet' },
    { value: 'CLIMATISATION', label: 'Climatisation' },
    { value: 'CHAUFFAGE', label: 'Chauffage' },
    { value: 'MEUBLE', label: 'Meublé' },
    { value: 'ASCENSEUR', label: 'Ascenseur' },
    { value: 'DIGICODE', label: 'Digicode' },
    { value: 'INTERPHONE', label: 'Interphone' },
    { value: 'GARDIEN', label: 'Gardien' },
    { value: 'ALARME', label: 'Alarme' }
  ],
  
  // Devises disponibles
  currencies: [
    { value: 'EUR', label: '€ Euro', symbol: '€' },
    { value: 'USD', label: '$ US Dollar', symbol: '$' },
    { value: 'GBP', label: '£ Livre Sterling', symbol: '£' },
    { value: 'CHF', label: 'CHF Franc Suisse', symbol: 'CHF' },
    { value: 'CAD', label: 'C$ Dollar Canadien', symbol: 'C$' }
  ],
  
  // Valeurs par défaut pour une nouvelle propriété
  defaults: {
    type: 'APPARTEMENT',
    status: 'DISPONIBLE',
    country: 'Congo',
    currency: 'EUR',
    rooms: 1,
    bathrooms: 1,
    floor: '0',
    furnished: false,
    equipment: [],
    has_elevator: false,
    has_parking: false,
    has_balcony: false,
    has_terrace: false,
    has_garden: false,
    has_pool: false,
    has_air_conditioning: false,
    has_heating: false,
    charges: 0,
    is_featured: false
  },
  
  // Validation
  validation: {
    title: {
      minLength: 3,
      maxLength: 100
    },
    description: {
      maxLength: 5000
    },
    address: {
      minLength: 5,
      maxLength: 255
    },
    city: {
      minLength: 2,
      maxLength: 100
    },
    postalCode: {
      pattern: /^[0-9]{5}$/,
      message: 'Le code postal doit contenir 5 chiffres'
    },
    area: {
      min: 1,
      max: 10000
    },
    rooms: {
      min: 0,
      max: 100
    },
    bathrooms: {
      min: 0,
      max: 50
    },
    rent: {
      min: 0,
      max: 1000000
    },
    charges: {
      min: 0,
      max: 10000
    },
    deposit: {
      min: 0,
      max: 1000000
    }
  }
} as const;

export type PropertyType = typeof propertyConfig.propertyTypes[number]['value'];
export type PropertyStatus = typeof propertyConfig.statuses[number]['value'];
export type PropertyEquipment = typeof propertyConfig.equipment[number]['value'];
export type Currency = typeof propertyConfig.currencies[number]['value'];

// Fonction utilitaire pour obtenir le libellé d'un type de propriété
export function getPropertyTypeLabel(type: PropertyType): string {
  const typeObj = propertyConfig.propertyTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
}

// Fonction utilitaire pour obtenir le libellé d'un statut
export function getStatusLabel(status: PropertyStatus): string {
  const statusObj = propertyConfig.statuses.find(s => s.value === status);
  return statusObj ? statusObj.label : status;
}

// Fonction utilitaire pour obtenir le symbole d'une devise
export function getCurrencySymbol(currency: Currency): string {
  const currencyObj = propertyConfig.currencies.find(c => c.value === currency);
  return currencyObj ? currencyObj.symbol : currency;
}

// Fonction utilitaire pour formater un montant avec la devise
export function formatAmount(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(amount);
}
