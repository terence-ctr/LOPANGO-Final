import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) => {
    await queryInterface.addColumn('users', 'deletedAt', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('users', 'deletedAt');
  }
};
