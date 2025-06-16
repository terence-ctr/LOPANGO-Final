import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    // Création de la table properties
    await queryInterface.createTable('properties', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      type: {
        type: Sequelize.ENUM('appartement', 'maison', 'bureau', 'local', 'autre'),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('available', 'rented', 'maintenance', 'sold', 'archived'),
        defaultValue: 'available',
        allowNull: false
      },
      address: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {}
      },
      surface: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      rooms: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      floor: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rent: {
        type: Sequelize.FLOAT,
        allowNull: true
      },
      purchasePrice: {
        type: Sequelize.FLOAT,
        allowNull: true,
        field: 'purchase_price'
      },
      purchaseDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'purchase_date'
      },
      equipments: {
        type: Sequelize.JSON,
        allowNull: true
      },
      images: {
        type: Sequelize.JSON,
        allowNull: true
      },
      landlordNotes: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'landlord_notes'
      },
      isFurnished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'is_furnished'
      },
      hasParking: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_parking'
      },
      hasElevator: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_elevator'
      },
      hasBalcony: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_balcony'
      },
      hasTerrace: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_terrace'
      },
      hasGarden: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_garden'
      },
      hasPool: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_pool'
      },
      hasAirConditioning: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_air_conditioning'
      },
      hasHeating: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        field: 'has_heating'
      },
      constructionYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'construction_year'
      },
      lastRenovationYear: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'last_renovation_year'
      },
      energyClass: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'NR'),
        allowNull: true,
        field: 'energy_class'
      },
      greenhouseGasEmission: {
        type: Sequelize.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'NR'),
        allowNull: true,
        field: 'greenhouse_gas_emission'
      },
      ownerId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'owner_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'created_by',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'updated_by',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        field: 'updated_at'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'deleted_at'
      }
    });

    // Ajout des index pour améliorer les performances
    await queryInterface.addIndex('properties', ['owner_id']);
    await queryInterface.addIndex('properties', ['type']);
    await queryInterface.addIndex('properties', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    // Désactiver temporairement les contraintes de clé étrangère
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Supprimer la table properties
    await queryInterface.dropTable('properties');
    
    // Réactiver les contraintes de clé étrangère
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  }
};
