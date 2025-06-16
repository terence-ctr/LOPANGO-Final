/**
 * Types de propriétés immobilières
 */
export enum PropertyType {
  // Résidentiel
  APARTMENT = 'appartement',
  HOUSE = 'maison',
  VILLA = 'villa',
  TOWNHOUSE = 'maison de ville',
  STUDIO = 'studio',
  LOFT = 'loft',
  DUPLEX = 'duplex',
  TRIPLEX = 'triplex',
  PENTHOUSE = 'penthouse',
  CHALET = 'chalet',
  COUNTRY_HOUSE = 'maison de campagne',
  CASTLE = 'château',
  MANOR = 'manoir',
  FARMHOUSE = 'ferme',
  
  // Commercial
  OFFICE = 'bureau',
  SHOP = 'commerce',
  WAREHOUSE = 'entrepôt',
  INDUSTRIAL = 'local industriel',
  BUSINESS = 'fonds de commerce',
  
  // Terrain
  LAND = 'terrain',
  BUILDING_LAND = 'terrain constructible',
  AGRICULTURAL_LAND = 'terrain agricole',
  WOODED_LAND = 'bois et forêts',
  
  // Autres
  PARKING = 'parking',
  BOX = 'box',
  CELLAR = 'cave',
  GARAGE = 'garage',
  OTHER = 'autre'
}

/**
 * Statuts de la propriété
 */
export enum PropertyStatus {
  DRAFT = 'brouillon',
  PENDING_APPROVAL = 'en_attente_validation',
  AVAILABLE = 'disponible',
  RENTED = 'loué',
  SOLD = 'vendu',
  RESERVED = 'réservé',
  UNDER_OPTION = 'en_compromis',
  UNDER_CONSTRUCTION = 'en construction',
  RENOVATION = 'en rénovation',
  OFF_MARKET = 'hors marché',
  DELETED = 'supprimé'
}

/**
 * Classes énergétiques (DPE)
 */
export enum EnergyClass {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  NOT_APPLICABLE = 'non applicable',
  NOT_SPECIFIED = 'non spécifié'
}

/**
 * Émissions de gaz à effet de serre (GES)
 */
export enum GreenhouseGasEmission {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
  NOT_APPLICABLE = 'non applicable',
  NOT_SPECIFIED = 'non spécifié'
}

/**
 * Types de transaction
 */
export enum TransactionType {
  SALE = 'vente',
  RENTAL = 'location',
  SEASONAL_RENTAL = 'location saisonnière',
  LEASE_TO_OWN = 'location avec option d\'achat',
  SHARED_OWNERSHIP = 'démembrement de propriété',
  LEASEHOLD = 'bail emphytéotique',
  LIFE_ANNUITY = 'viager'
}

/**
 * Types de chauffage
 */
export enum HeatingType {
  GAS = 'gaz',
  ELECTRIC = 'électrique',
  FUEL_OIL = 'fioul',
  WOOD = 'bois',
  SOLAR = 'solaire',
  HEAT_PUMP = 'pompe à chaleur',
  DISTRICT_HEATING = 'réseau de chaleur',
  ELECTRIC_RADIATOR = 'radiateur électrique',
  ELECTRIC_CONVECTOR = 'convecteur électrique',
  ELECTRIC_ACCUMULATOR = 'accumulateur électrique',
  ELECTRIC_FLOOR_HEATING = 'plancher chauffant électrique',
  HYDRONIC_FLOOR_HEATING = 'plancher chauffant hydraulique',
  HYDRONIC_RADIATOR = 'radiateur hydraulique',
  PELLET_STOVE = 'poêle à granulés',
  WOOD_STOVE = 'poêle à bois',
  FIREPLACE = 'cheminée',
  CLIMATE_CONTROL = 'climatisation réversible',
  OTHER = 'autre'
}

/**
 * Types de cuisine
 */
export enum KitchenType {
  SEPARATE = 'séparée',
  OPEN = 'ouverte',
  SEMI_OPEN = 'semi-ouverte',
  EQUIPPED = 'équipée',
  NOT_INSTALLED = 'non équipée',
  SEMI_PROFESSIONAL = 'semi-professionnelle',
  PROFESSIONAL = 'professionnelle',
  AMERICAN = 'américaine',
  KITCHENETTE = 'kitchenette',
  OTHER = 'autre'
}

/**
 * Types de fenêtres
 */
export enum WindowType {
  SINGLE_GLAZING = 'simple vitrage',
  DOUBLE_GLAZING = 'double vitrage',
  TRIPLE_GLAZING = 'triple vitrage',
  WOOD_FRAME = 'bois',
  PVC_FRAME = 'PVC',
  ALUMINUM_FRAME = 'aluminium',
  ALU_WOOD_FRAME = 'bois-aluminium',
  METAL_FRAME = 'métal',
  COMPOSITE_FRAME = 'composite',
  OTHER = 'autre'
}
