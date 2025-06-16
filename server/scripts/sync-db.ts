import { sequelize } from '../../server/config/database';
import { initModels } from '../../server/models/init-models';

async function syncDatabase() {
  try {
    // Initialiser les modèles
    initModels(sequelize);
    
    console.log('Synchronisation de la base de données...');
    
    // Synchroniser tous les modèles avec la base de données
    // force: true va supprimer les tables existantes et les recréer
    // alter: true va mettre à jour les tables existantes sans supprimer les données
    await sequelize.sync({ alter: true });
    
    console.log('Base de données synchronisée avec succès !');
    
    // Fermer la connexion
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors de la synchronisation de la base de données:', error);
    process.exit(1);
  }
}

syncDatabase();
