// @ts-check

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log("Vérification des colonnes de timestamp dans la table 'users'...");
    
    // Vérifier si les colonnes existent déjà
    const tableInfo = await queryInterface.describeTable('users');
    
    if (!tableInfo.createdAt) {
      console.log("Ajout de la colonne 'createdAt'...");
      await queryInterface.addColumn('users', 'createdAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }, { transaction });
    }
    
    if (!tableInfo.updatedAt) {
      console.log("Ajout de la colonne 'updatedAt'...");
      await queryInterface.addColumn('users', 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }, { transaction });
    }
    
    await transaction.commit();
    console.log("Colonnes de timestamp ajoutées avec succès");
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de l'ajout des colonnes de timestamp:", error);
    throw error;
  }
};

/** @type {import('sequelize-cli').Migration} */
export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log("Suppression des colonnes de timestamp...");
    
    // Vérifier si les colonnes existent avant de les supprimer
    const tableInfo = await queryInterface.describeTable('users');
    
    if (tableInfo.createdAt) {
      console.log("Suppression de la colonne 'createdAt'...");
      await queryInterface.removeColumn('users', 'createdAt', { transaction });
    }
    
    if (tableInfo.updatedAt) {
      console.log("Suppression de la colonne 'updatedAt'...");
      await queryInterface.removeColumn('users', 'updatedAt', { transaction });
    }
    
    await transaction.commit();
    console.log("Colonnes de timestamp supprimées avec succès");
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de la suppression des colonnes de timestamp:", error);
    throw error;
  }
};
