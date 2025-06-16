export default {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Début de la mise à jour de la table Users...');
      
      // Vérifier si les colonnes existent déjà
      const tableInfo = await queryInterface.describeTable('Users');
      
      // Ajouter les colonnes manquantes si elles n'existent pas
      if (!tableInfo.user_type) {
        console.log("Ajout de la colonne 'user_type'...");
        await queryInterface.addColumn('Users', 'user_type', {
          type: Sequelize.ENUM('tenant', 'landlord', 'admin', 'agent'),
          allowNull: false,
          defaultValue: 'tenant'
        }, { transaction });
      }
      
      if (!tableInfo.refresh_token) {
        console.log("Ajout de la colonne 'refresh_token'...");
        await queryInterface.addColumn('Users', 'refresh_token', {
          type: Sequelize.STRING,
          allowNull: true
        }, { transaction });
      }
      
      if (!tableInfo.reset_password_expires) {
        console.log("Ajout de la colonne 'reset_password_expires'...");
        await queryInterface.addColumn('Users', 'reset_password_expires', {
          type: Sequelize.DATE,
          allowNull: true
        }, { transaction });
      }
      
      // Mettre à jour les données existantes si nécessaire
      if (tableInfo.userType && tableInfo.user_type) {
        console.log("Mise à jour des données de 'userType' vers 'user_type'...");
        await queryInterface.sequelize.query(
          'UPDATE Users SET user_type = userType',
          { transaction }
        );
      }
      
      // Supprimer les anciennes colonnes si elles existent
      if (tableInfo.userType) {
        console.log("Suppression de l'ancienne colonne 'userType'...");
        await queryInterface.removeColumn('Users', 'userType', { transaction });
      }
      
      if (tableInfo.refreshToken) {
        console.log("Suppression de l'ancienne colonne 'refreshToken'...");
        await queryInterface.removeColumn('Users', 'refreshToken', { transaction });
      }
      
      if (tableInfo.resetPasswordExpires) {
        console.log("Suppression de l'ancienne colonne 'resetPasswordExpires'...");
        await queryInterface.removeColumn('Users', 'resetPasswordExpires', { transaction });
      }
      
      await transaction.commit();
      console.log('✅ Mise à jour de la table Users terminée avec succès');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erreur lors de la mise à jour de la table Users:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // En cas de rollback, nous ne faisons rien pour éviter les pertes de données
    console.log('Rollback de la migration - Aucune action effectuée');
  }
};
