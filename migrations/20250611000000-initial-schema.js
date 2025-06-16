import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Création de la table Users
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
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('ADMIN', 'LANDLORD', 'TENANT', 'AGENT'),
        allowNull: false,
        defaultValue: 'TENANT'
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED'),
        allowNull: false,
        defaultValue: 'INACTIVE'
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
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Création de la table Properties
    await queryInterface.createTable('Properties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      postalCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      country: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'France'
      },
      surface: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rooms: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      bedrooms: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('APARTMENT', 'HOUSE', 'OFFICE', 'LAND', 'PARKING', 'OTHER'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'PENDING_APPROVAL', 'AVAILABLE', 'RENTED', 'SOLD', 'UNAVAILABLE', 'REJECTED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isAvailable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      publishedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Création des index pour les propriétés
    await queryInterface.addIndex('Properties', ['userId']);
    await queryInterface.addIndex('Properties', ['type']);
    await queryInterface.addIndex('Properties', ['status']);
    await queryInterface.addIndex('Properties', ['city']);
    await queryInterface.addIndex('Properties', ['price']);
    await queryInterface.addIndex('Properties', ['surface']);
  },

  async down(queryInterface, Sequelize) {
    // Suppression des tables dans l'ordre inverse de leur création
    await queryInterface.dropTable('Properties');
    await queryInterface.dropTable('Users');
  }
};
