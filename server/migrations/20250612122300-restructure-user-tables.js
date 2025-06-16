import { DataTypes, QueryTypes } from 'sequelize';

// Fonction utilitaire pour ajouter un délai
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  async up(queryInterface, Sequelize) {
    console.log('Début de la migration de restructuration des tables utilisateur...');
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Créer la table addresses si elle n'existe pas
      const tables = await queryInterface.showAllTables();
      
      if (!tables.includes('addresses')) {
        console.log('Création de la table addresses...');
        await queryInterface.createTable('addresses', {
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
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        }, { transaction });
        await delay(500);
      }

      // 2. Créer la table identity si elle n'existe pas
      if (!tables.includes('identity')) {
        console.log('Création de la table identity...');
        await queryInterface.createTable('identity', {
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
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        }, { transaction });
        await delay(500);
      }

      // 3. Ajouter les colonnes addressId et identityId à la table users si elles n'existent pas
      const tableDescription = await queryInterface.describeTable('users');
      
      if (!tableDescription.addressId) {
        console.log('Ajout de la colonne addressId...');
        await queryInterface.addColumn(
          'users',
          'addressId',
          {
            type: DataTypes.INTEGER,
            references: {
              model: 'addresses',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
        await delay(500);
      }

      if (!tableDescription.identityId) {
        console.log('Ajout de la colonne identityId...');
        await queryInterface.addColumn(
          'users',
          'identityId',
          {
            type: DataTypes.INTEGER,
            references: {
              model: 'identities',
              key: 'id',
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL',
          },
          { transaction }
        );
        await delay(500);
      }

      // 4. Vérifier s'il y a des données à migrer
      console.log('Vérification des données à migrer...');
      const [results] = await queryInterface.sequelize.query(
        'SELECT COUNT(*) as count FROM users WHERE address IS NOT NULL OR identity IS NOT NULL',
        { type: QueryTypes.SELECT, transaction }
      );

      if (results && results.count > 0) {
        console.log(`Migration de ${results.count} enregistrements...`);
        const users = await queryInterface.sequelize.query(
          'SELECT id, address, identity FROM users',
          { type: QueryTypes.SELECT, transaction }
        );

        for (const user of users) {
          try {
            if (user.address) {
              const address = typeof user.address === 'string' ? JSON.parse(user.address) : user.address;
              const [addressId] = await queryInterface.bulkInsert('addresses', [{
                street: address.street || null,
                city: address.city || null,
                postalCode: address.postalCode || null,
                country: address.country || null,
                createdAt: new Date(),
                updatedAt: new Date(),
              }], { transaction, returning: true });

              await queryInterface.sequelize.query(
                'UPDATE users SET "addressId" = ? WHERE id = ?',
                { replacements: [addressId, user.id], transaction }
              );
              await delay(100);
            }

            if (user.identity) {
              const identity = typeof user.identity === 'string' ? JSON.parse(user.identity) : user.identity;
              const [identityId] = await queryInterface.bulkInsert('identities', [{
                documentType: identity.documentType || null,
                documentNumber: identity.nationalId || null,
                verified: identity.verified || false,
                createdAt: new Date(),
                updatedAt: new Date(),
              }], { transaction, returning: true });

              await queryInterface.sequelize.query(
                'UPDATE users SET "identityId" = ? WHERE id = ?',
                { replacements: [identityId, user.id], transaction }
              );
              await delay(100);
            }
          } catch (error) {
            console.error(`Erreur lors de la migration de l'utilisateur ${user.id}:`, error);
            continue;
          }
        }
      }

      // 5. Supprimer les colonnes JSON obsolètes si elles existent
      if (tableDescription.address) {
        console.log('Suppression de la colonne address...');
        await queryInterface.removeColumn('users', 'address', { transaction });
        await delay(500);
      }
      
      if (tableDescription.identity) {
        console.log('Suppression de la colonne identity...');
        await queryInterface.removeColumn('users', 'identity', { transaction });
        await delay(500);
      }

      await transaction.commit();
      console.log('✅ Migration terminée avec succès !');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erreur lors de la migration:', error);
      throw error;
    }
  },

  async down() {
    // Implémentation de rollback si nécessaire
    console.log('Rollback non implémenté pour cette migration.');
  },
};
