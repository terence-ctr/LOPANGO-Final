export enum PropertyType {
  STUDIO = 'studio',
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T4 = 'T4+',
  T5 = 'T5+',
  T6 = 'T6+',
  T7 = 'T7+',
  HOUSE = 'house',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  OFFICE = 'office',
  COMMERCIAL = 'commercial',
  LAND = 'land',
  PARKING = 'parking',
  OTHER = 'other'
}

export enum PropertyStatus {
  AVAILABLE = 'available',
  RENTED = 'rented',
  MAINTENANCE = 'maintenance',
  UNAVAILABLE = 'unavailable',
  RESERVED = 'reserved',
  SOLD = 'sold',
  DRAFT = 'draft',
  ARCHIVED = 'archived'
}

export enum PropertyListingType {
  RENT = 'rent',
  SALE = 'sale',
  SHORT_TERM = 'short_term',
  SHARED = 'shared',
  COMMERCIAL_LEASE = 'commercial_lease'
}

export enum PropertyFeature {
  ELEVATOR = 'elevator',
  PARKING = 'parking',
  BALCONY = 'balcony',
  TERRACE = 'terrace',
  GARDEN = 'garden',
  POOL = 'pool',
  AIR_CONDITIONING = 'air_conditioning',
  HEATING = 'heating',
  FURNISHED = 'furnished',
  PETS_ALLOWED = 'pets_allowed',
  SMOKING_ALLOWED = 'smoking_allowed',
  WHEELCHAIR_ACCESSIBLE = 'wheelchair_accessible',
  INTERNET = 'internet',
  CABLE_TV = 'cable_tv',
  DISHWASHER = 'dishwasher',
  WASHING_MACHINE = 'washing_machine',
  DRYER = 'dryer',
  MICROWAVE = 'microwave',
  OVEN = 'oven',
  REFRIGERATOR = 'refrigerator',
  KITCHEN = 'kitchen',
  GYM = 'gym',
  SECURITY = 'security',
  DOORMAN = 'doorman',
  FIREPLACE = 'fireplace'
}

export enum PropertySortBy {
  PRICE_ASC = 'price_asc',
  PRICE_DESC = 'price_desc',
  DATE_NEWEST = 'date_newest',
  DATE_OLDEST = 'date_oldest',
  AREA_ASC = 'area_asc',
  AREA_DESC = 'area_desc',
  ROOMS_ASC = 'rooms_asc',
  ROOMS_DESC = 'rooms_desc'
}
