export type ContractStatus = 'active' | 'pending' | 'ended' | 'cancelled';

export interface Adresse {
  ville: string;
  quartier: string;
  commune: string;
  province: string;
  codePostal: string;
  avenue: string;
  numero: string;
}

export interface User {
  id: string | number;
  nom: string;
  prenom: string;
  nationalite: string;
  typePiece: 'permis de conduire' | 'passeport' | 'carte_sejour'  | 'carte_electeur' | 'autre';
  numeroPiece: string;
  adresse: Adresse;
  email?: string;
  telephone?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
}

export interface Property {
  id: string | number;
  nom: string;
  adresse: string;
  type: 'appartement' | 'maison' | 'bureau' | 'local' | 'autre';
  loyer: number;
  garantie: number;
  usage: 'residentiel' | 'commercial' | 'bureau' | 'autre';
  surface: number;
  nombrePieces: number;
  etage?: number;
  codePostal: string;
  ville: string;
  province: string;
  pays: string;
  description?: string;
  equipements?: string[];
  photos?: string[];
  bailleurId: string | number;
  dateAjout: string;
  dateMiseAJour: string;
}

export interface ContractFormData {
  // Informations du bailleur
  bailleurId: string | number;
  bailleurNationalite: string;
  bailleurTypePiece: string;
  bailleurNumeroPiece: string;
  bailleurNumeroPostal: string;
  bailleurProvince: string;
  bailleurQuartier: string;
  bailleurCommune: string;
  
  // Informations du locataire
  locataireId: string | number;
  locataireNationalite: string;
  locataireTypePiece: string;
  locataireNumeroPiece: string;
  locataireNumeroPostal: string;
  locataireProvince: string;
  locataireQuartier: string;
  locataireCommune: string;
  
  // Informations de la propriété
  proprieteId: string | number;
  usage: string;
  loyer: string | number;
  devise: string;
  garantie: string | number;
  duree: string;
  dateDebut: string;
  dateFin: string;
  statut: 'draft' | 'pending' | 'active' | 'ended' | 'cancelled';
}

export interface Contract {
  id?: string | number;
  bailleurId: string | number;
  locataireId: string | number;
  proprieteId: string | number;
  dateDebut: string;
  dateFin: string | null;
  loyer: number;
  garantie: number;
  devise: string;
  duree: string;
  statut: ContractStatus;
  conditionsSpeciales?: string;
  dateCreation?: string;
  dateMiseAJour?: string;
  // Références aux objets liés (optionnel, pour le chargement des données liées)
  bailleur?: User;
  locataire?: User;
  propriete?: Property;
}

export interface ContractFormData {
  // Bailleur
  bailleurId: string;
  bailleurNationalite: string;
  bailleurTypePiece: string;
  bailleurNumeroPiece: string;
  bailleurVille: string;
  bailleurQuartier: string;
  bailleurAvenue: string;
  bailleurNumero: string;
  
  // Locataire
  locataireId: string;
  locataireNationalite: string;
  locataireTypePiece: string;
  locataireNumeroPiece: string;
  locataireVille: string;
  locataireQuartier: string;
  locataireAvenue: string;
  locataireNumero: string;
  
  // Propriété
  proprieteId: string;
  usage: string;
  loyer: string;
  devise: string;
  garantie: string;
  duree: string;
  dateDebut: string;
  dateFin: string;
  statut: ContractStatus;
}
