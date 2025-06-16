export default {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Début de la mise à jour des relations utilisateur...');
      
      // Vérifier si les colonnes existent déjà
      const tableInfo = await queryInterface.describeTable('users');
      
      // Ajouter la colonne address_id si elle n'existe pas
      if (!tableInfo.address_id) {
        console.log("Ajout de la colonne 'address_id'...");
        await queryInterface.addColumn('users', 'address_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'addresses',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
      }
      
      // Ajouter la colonne identity_id si elle n'existe pas
      if (!tableInfo.identity_id) {
        console.log("Ajout de la colonne 'identity_id'...");
        // D'abord ajouter la colonne sans contrainte UNIQUE
        await queryInterface.addColumn('users', 'identity_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'identities',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        }, { transaction });
        
        // Ensuite ajouter la contrainte UNIQUE séparément
        try {
          await queryInterface.addConstraint('users', {
            fields: ['identity_id'],
            type: 'unique',
            name: 'users_identity_id_unique',
            transaction
          });
          console.log("Contrainte UNIQUE ajoutée sur identity_id");
        } catch (error) {
          console.warn("Impossible d'ajouter la contrainte UNIQUE sur identity_id:", error.message);
          // Continuer même si la contrainte UNIQUE échoue
        }
      }
      
      // Mettre à jour les contraintes de clé étrangère si nécessaire
      console.log("Vérification des contraintes de clé étrangère...");
      
      await transaction.commit();
      console.log('✅ Mise à jour des relations utilisateur terminée avec succès');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erreur lors de la mise à jour des relations utilisateur:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      console.log('Annulation des modifications des relations utilisateur...');
      
      // Supprimer les contraintes de clé étrangère d'abord
      await queryInterface.removeConstraint('users', 'users_identity_id_foreign_key', { transaction });
      await queryInterface.removeConstraint('users', 'users_address_id_foreign_key', { transaction });
      
      // Supprimer les colonnes si elles existent
      const tableInfo = await queryInterface.describeTable('users');
      
      if (tableInfo.identity_id) {
        await queryInterface.removeColumn('users', 'identity_id', { transaction });
      }
      
      if (tableInfo.address_id) {
        await queryInterface.removeColumn('users', 'address_id', { transaction });
      }
      
      await transaction.commit();
      console.log('✅ Annulation des modifications des relations utilisateur terminée avec succès');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Erreur lors de l\'annulation des modifications:', error);
      throw error;
    }
  }
};
