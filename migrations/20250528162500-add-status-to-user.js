import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.ENUM('active', 'inactive', 'suspended'),
      allowNull: false,
      defaultValue: 'active'
    });

    await queryInterface.addColumn('Users', 'lastLogin', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'status');
    await queryInterface.removeColumn('Users', 'lastLogin');
    
    // Supprimer le type ENUM après avoir supprimé la colonne
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Users_status";');
  }
};
