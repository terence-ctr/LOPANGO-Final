import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    // Désactiver temporairement les contraintes de clé étrangère
    await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF');
    
    // Supprimer les tables existantes dans le bon ordre
    const tables = [
      'property_images',
      'properties',
      'users'
    ];

    for (const table of tables) {
      try {
        await queryInterface.dropTable(table);
        console.log(`✅ Table ${table} supprimée`);
      } catch (error) {
        console.log(`ℹ️ Impossible de supprimer la table ${table}: ${error.message}`);
      }
    }

    // Créer la table users avec une structure simplifiée
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      address: {
        type: DataTypes.TEXT, // Utilisation de TEXT au lieu de JSON pour une meilleure compatibilité
        allowNull: false,
        defaultValue: '{}',
        get() {
          const value = this.getDataValue('address');
          return value ? JSON.parse(value) : {};
        },
        set(value) {
          this.setDataValue('address', JSON.stringify(value));
        }
      },
      user_type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'tenant',
        validate: {
          isIn: [['tenant', 'landlord', 'admin', 'agent']]
        }
      },
      identity: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '{}',
        get() {
          const value = this.getDataValue('identity');
          return value ? JSON.parse(value) : {};
        },
        set(value) {
          this.setDataValue('identity', JSON.stringify(value));
        }
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'active',
        validate: {
          isIn: [['active', 'inactive', 'suspended']]
        }
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    // Ajouter les index
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['user_type']);
    await queryInterface.addIndex('users', ['status']);

    console.log('✅ Table users créée avec succès');
    
    // Réactiver les contraintes de clé étrangère
    await queryInterface.sequelize.query('PRAGMA foreign_keys = ON');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
