import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lastName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: ''
      },
      address: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{"street":"","city":"","postalCode":"","country":"France"}'
      },
      userType: {
        type: Sequelize.ENUM('tenant', 'landlord', 'admin', 'agent'),
        allowNull: false,
        defaultValue: 'tenant'
      },
      identity: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: '{"documentType":"permis de conduire","nationalId":"123456789","verified":false}'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Ajout d'un index sur l'email pour des performances de recherche
    await queryInterface.addIndex('Users', ['email']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};