'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
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

    // Ajout d'index pour améliorer les performances des requêtes courantes
    await queryInterface.addIndex('Properties', ['userId']);
    await queryInterface.addIndex('Properties', ['type']);
    await queryInterface.addIndex('Properties', ['status']);
    await queryInterface.addIndex('Properties', ['city']);
    await queryInterface.addIndex('Properties', ['price']);
    await queryInterface.addIndex('Properties', ['surface']);
  },

  async down(queryInterface, Sequelize) {
    // Supprimer les index d'abord
    await queryInterface.removeIndex('Properties', ['userId']);
    await queryInterface.removeIndex('Properties', ['type']);
    await queryInterface.removeIndex('Properties', ['status']);
    await queryInterface.removeIndex('Properties', ['city']);
    await queryInterface.removeIndex('Properties', ['price']);
    await queryInterface.removeIndex('Properties', ['surface']);
    
    // Puis supprimer la table
    await queryInterface.dropTable('Properties');
  }
};
