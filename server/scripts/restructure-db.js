import { Sequelize, DataTypes } from 'sequelize';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration de la connexion à la base de données
const dbPath = path.resolve(__dirname, '../../data/database.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: console.log,
  pool: {
    max: 1,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// Fonction utilitaire pour ajouter un délai
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function restructureDatabase() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('Début de la restructuration de la base de données...');
    
    // 1. Créer la table addresses si elle n'existe pas
    const addressesExist = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('addresses'));
    
    if (!addressesExist) {
      console.log('Création de la table addresses...');
      await sequelize.getQueryInterface().createTable('addresses', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        street: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        city: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        postalCode: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        country: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });
      await delay(500);
    }

    // 2. Créer la table identities si elle n'existe pas
    const identitiesExist = await sequelize.getQueryInterface().showAllTables()
      .then(tables => tables.includes('identities'));
    
    if (!identitiesExist) {
      console.log('Création de la table identities...');
      await sequelize.getQueryInterface().createTable('identities', {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        documentType: {
          type: DataTypes.ENUM('permis de conduire', 'passport', 'carte d\'electeur'),
          allowNull: true,
        },
        documentNumber: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        verified: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
      }, { transaction });
      await delay(500);
    }

    // 3. Ajouter les colonnes à la table users si elles n'existent pas
    const usersColumns = await sequelize.getQueryInterface().describeTable('users');
    
    if (!usersColumns.addressId) {
      console.log('Ajout de la colonne addressId...');
      await sequelize.getQueryInterface().addColumn('users', 'addressId', {
        type: DataTypes.INTEGER,
        references: {
          model: 'addresses',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }, { transaction });
      await delay(500);
    }
    
    if (!usersColumns.identityId) {
      console.log('Ajout de la colonne identityId...');
      await sequelize.getQueryInterface().addColumn('users', 'identityId', {
        type: DataTypes.INTEGER,
        references: {
          model: 'identities',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }, { transaction });
      await delay(500);
    }

    // 4. Migrer les données existantes
    const users = await sequelize.query('SELECT id, address, identity FROM users', {
      type: sequelize.QueryTypes.SELECT,
      transaction
    });

    console.log(`Migration de ${users.length} utilisateurs...`);
    
    for (const user of users) {
      try {
        if (user.address) {
          const address = typeof user.address === 'string' ? JSON.parse(user.address) : user.address;
          
          const [addressId] = await sequelize.query(
            'INSERT INTO addresses (street, city, postalCode, country, createdAt, updatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
            {
              replacements: [
                address.street || null,
                address.city || null,
                address.postalCode || null,
                address.country || null
              ],
              transaction
            }
          );
          
          await sequelize.query(
            'UPDATE users SET addressId = ? WHERE id = ?',
            {
              replacements: [addressId, user.id],
              transaction
            }
          );
          await delay(100);
        }

        if (user.identity) {
          const identity = typeof user.identity === 'string' ? JSON.parse(user.identity) : user.identity;
          
          const [identityId] = await sequelize.query(
            'INSERT INTO identities (documentType, documentNumber, verified, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);',
            {
              replacements: [
                identity.documentType || null,
                identity.nationalId || null,
                identity.verified || false
              ],
              transaction
            }
          );
          
          await sequelize.query(
            'UPDATE users SET identityId = ? WHERE id = ?',
            {
              replacements: [identityId, user.id],
              transaction
            }
          );
          await delay(100);
        }
      } catch (error) {
        console.error(`Erreur lors de la migration de l'utilisateur ${user.id}:`, error);
        continue;
      }
    }

    // 5. Supprimer les anciennes colonnes si elles existent
    if (usersColumns.address) {
      console.log('Suppression de la colonne address...');
      await sequelize.getQueryInterface().removeColumn('users', 'address', { transaction });
    }
    
    if (usersColumns.identity) {
      console.log('Suppression de la colonne identity...');
      await sequelize.getQueryInterface().removeColumn('users', 'identity', { transaction });
    }

    await transaction.commit();
    console.log('✅ Restructuration terminée avec succès !');
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Erreur lors de la restructuration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Exécuter la restructuration
restructureDatabase()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
