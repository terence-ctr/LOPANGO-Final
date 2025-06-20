import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Configuration de dotenv
dotenv.config();

// Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';
const LOGIN_EMAIL = process.env.TEST_EMAIL || 'admin@example.com';
const LOGIN_PASSWORD = process.env.TEST_PASSWORD || 'password123';
const USER_TYPE = 'landlord'; // Doit être l'un de : 'tenant', 'landlord', 'agent', 'admin'

// Données de test pour la propriété
const testProperty = {
  type: 'T2',
  status: 'DISPONIBLE',
  street: '123 Rue de Test',
  city: 'Paris',
  postalCode: '75001',
  country: 'France',
  area: 65,
  floorArea: 65,
  rooms: 2,
  bathrooms: 1,
  floor: '2',
  furnished: true,
  equipment: ['climatisation', 'lave-vaisselle'],
  hasElevator: true,
  hasParking: true,
  rent: 1200,
  charges: 150,
  deposit: 1200,
  description: 'Appartement de test',
  availableFrom: new Date().toISOString().split('T')[0]
};

async function testPropertyCreation() {
  try {
    console.log('🚀 Début du test de création de propriété\n');
    
    // 1. Connexion pour obtenir un token
    console.log('🔑 Connexion...');
    console.log(`Tentative de connexion avec l'email: ${LOGIN_EMAIL}`);
    
    console.log('Tentative de connexion avec les identifiants:', {
      email: LOGIN_EMAIL,
      userType: USER_TYPE
    });

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD,
      userType: USER_TYPE
    }, {
      withCredentials: true,
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }).catch(error => {
      console.error('❌ Erreur de connexion détaillée:');
      if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
      } else if (error.request) {
        console.error('Aucune réponse du serveur. Vérifiez que le serveur est en cours d\'exécution.');
        console.error('Request:', error.request);
      } else {
        console.error('Erreur de configuration de la requête:', error.message);
      }
      throw error;
    });

    const { accessToken } = loginResponse.data.data.tokens;
    console.log('✅ Connecté avec succès');

    // 2. Création d'une propriété
    console.log('\n🏠 Création d\'une propriété...');
    const propertyResponse = await axios.post(
      `${API_BASE_URL}/properties`,
      testProperty,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        withCredentials: true
      }
    );

    console.log('✅ Propriété créée avec succès !');
    console.log('📋 Détails de la propriété créée :');
    console.log(JSON.stringify(propertyResponse.data, null, 2));
    
    return propertyResponse.data;

  } catch (error) {
    console.error('❌ Erreur lors du test :');
    
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('📌 Détails de l\'erreur :');
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // La requête a été faite mais aucune réponse n'a été reçue
      console.error('Aucune réponse du serveur. Vérifiez que le serveur est en cours d\'exécution.');
      console.error('Request:', error.request);
    } else {
      // Une erreur s'est produite lors de la configuration de la requête
      console.error('Erreur de configuration de la requête:', error.message);
    }
    
    console.error('\nConfiguration complète de l\'erreur:', error.config);
    throw error;
  }
}

// Exécution du test
console.log('🔍 Configuration du test :');
console.log(`- URL de l'API: ${API_BASE_URL}`);
console.log(`- Email de test: ${LOGIN_EMAIL}`);
console.log('\nDémarrage du test...\n');

testPropertyCreation()
  .catch(() => process.exit(1));
