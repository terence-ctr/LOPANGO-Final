import * as yup from 'yup';

// Schéma de validation pour l'adresse
export const addressSchema = yup.object().shape({
  street: yup.string().required('La rue est requise'),
  postalCode: yup
    .string()
    .matches(/^(|[0-9]{5})$/, 'Le code postal doit contenir 5 chiffres'),
  city: yup.string().required('La ville est requise'),
  country: yup.string().default('France'),
  additionalInfo: yup.string(),
  parcelNumber: yup.string().required('Le numéro de parcelle est requis')
});

// Schéma de validation pour un équipement
export const equipmentSchema = yup.object().shape({
  id: yup.string().required(),
  name: yup.string().required(),
  included: yup.boolean().default(true),
  description: yup.string()
});

// Schéma de base pour une propriété
export const propertyBaseSchema = yup.object().shape({
  // Numéro de parcelle au niveau racine pour un accès plus facile
  parcelNumber: yup.string().required('Le numéro de parcelle est requis'),
  name: yup.string().required('Le nom de la propriété est requis'),
  title: yup.string(),
  description: yup.string(),
  price: yup.number().typeError('Le prix doit être un nombre').positive('Le prix doit être positif'),
  address: yup.string(),
  city: yup.string(),
  postalCode: yup
    .string()
    .matches(/^(|[0-9]{5})$/, 'Le code postal doit contenir 5 chiffres'),
  country: yup.string().default('France'),
  type: yup.string().required('Le type de propriété est requis'),
  status: yup
    .string()
    .oneOf(
      ['Disponible', 'Loué', 'En maintenance', 'Hors service', 'En attente de validation'],
      'Statut invalide'
    )
    .default('Disponible'),
  description: yup.string(),
  address: addressSchema.required('L\'adresse est requise'),
  surface: yup
    .number()
    .typeError('La surface doit être un nombre')
    .positive('La surface doit être positive')
    .required('La surface est requise'),
  rooms: yup
    .number()
    .typeError('Le nombre de pièces doit être un nombre')
    .integer('Le nombre de pièces doit être un entier')
    .min(1, 'Au moins une pièce est requise')
    .required('Le nombre de pièces est requis'),
  floor: yup.number().typeError('L\'étage doit être un nombre').integer('L\'étage doit être un entier'),
  rent: yup
    .number()
    .typeError('Le loyer doit être un nombre')
    .positive('Le loyer doit être positif')
    .required('Le loyer est requis'),
  charges: yup.number().typeError('Les charges doivent être un nombre').min(0, 'Les charges ne peuvent pas être négatives'),
  deposit: yup.number().typeError('Le dépôt de garantie doit être un nombre').min(0, 'Le dépôt de garantie ne peut pas être négatif'),
  availableFrom: yup.string().matches(/\d{4}-\d{2}-\d{2}/, 'La date doit être au format AAAA-MM-JJ'),
  constructionYear: yup
    .number()
    .typeError('L\'année de construction doit être un nombre')
    .integer('L\'année de construction doit être un entier')
    .min(1000, 'Année invalide')
    .max(new Date().getFullYear() + 1, 'L\'année ne peut pas être dans le futur'),
  energyClass: yup.string().matches(/^[A-G]$/, 'Classe énergétique invalide (A-G)'),
  greenhouseGases: yup.string().matches(/^[A-G]$/, 'Classe GES invalide (A-G)'),
  equipments: yup.array().of(equipmentSchema),
  notes: yup.string(),
  purchasePrice: yup.number().typeError('Le prix d\'achat doit être un nombre').min(0, 'Le prix d\'achat ne peut pas être négatif'),
  purchaseDate: yup.string().matches(/\d{4}-\d{2}-\d{2}/, 'La date doit être au format AAAA-MM-JJ'),
  landlordNotes: yup.string()
});

// Schéma complet pour la création d'une propriété
export const propertyCreateSchema = propertyBaseSchema.shape({
  ownerId: yup.string().required('Un propriétaire est requis')
});

// Schéma pour la mise à jour d'une propriété
export const propertyUpdateSchema = propertyBaseSchema.pick([
  'name',
  'type',
  'status',
  'description',
  'address',
  'surface',
  'rooms',
  'floor',
  'rent',
  'charges',
  'deposit',
  'availableFrom',
  'constructionYear',
  'energyClass',
  'greenhouseGases',
  'equipments',
  'notes',
  'purchasePrice',
  'purchaseDate',
  'landlordNotes'
]);

// Fonction utilitaire pour valider une propriété
export const validateProperty = async (data: any, isUpdate = false) => {
  try {
    const schema = isUpdate ? propertyUpdateSchema : propertyCreateSchema;
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: null };
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      const errors = err.inner.reduce((acc, currentError) => {
        return {
          ...acc,
          [currentError.path || '']: currentError.message
        };
      }, {});
      return { isValid: false, errors };
    }
    throw err;
  }
};
