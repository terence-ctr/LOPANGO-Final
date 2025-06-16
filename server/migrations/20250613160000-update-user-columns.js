export default {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Vérifier si les colonnes existent déjà
      const tableInfo = await queryInterface.describeTable('Users');
      
      // Ajouter les colonnes manquantes si elles n'existent pas
      if (!tableInfo.first_name) {
        await queryInterface.addColumn('Users', 'first_name', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: ''
        }, { transaction });
      }
      
      if (!tableInfo.last_name) {
        await queryInterface.addColumn('Users', 'last_name', {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: ''
        }, { transaction });
      }
      
      if (!tableInfo.email_verified) {
        await queryInterface.addColumn('Users', 'email_verified', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }, { transaction });
      }
      
      if (!tableInfo.phone_verified) {
        await queryInterface.addColumn('Users', 'phone_verified', {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        }, { transaction });
      }
      
      if (!tableInfo.reset_password_token) {
        await queryInterface.addColumn('Users', 'reset_password_token', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }
      
      // Mettre à jour les données existantes si nécessaire
      if (tableInfo.firstName && tableInfo.first_name) {
        await queryInterface.sequelize.query(
          'UPDATE Users SET first_name = firstName',
          { transaction }
        );
      }
      
      if (tableInfo.lastName && tableInfo.last_name) {
        await queryInterface.sequelize.query(
          'UPDATE Users SET last_name = lastName',
          { transaction }
        );
      }
      
      // Supprimer les anciennes colonnes si elles existent
      if (tableInfo.firstName) {
        await queryInterface.removeColumn('Users', 'firstName', { transaction });
      }
      
      if (tableInfo.lastName) {
        await queryInterface.removeColumn('Users', 'lastName', { transaction });
      }
      
      await transaction.commit();
      console.log('Migration réussie : Colonnes utilisateur mises à jour avec succès');
    } catch (error) {
      await transaction.rollback();
      console.error('Erreur lors de la migration :', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // En cas de rollback, nous ne faisons rien pour éviter les pertes de données
    console.log('Rollback de la migration des colonnes utilisateur - Aucune action effectuée');
  }
};
