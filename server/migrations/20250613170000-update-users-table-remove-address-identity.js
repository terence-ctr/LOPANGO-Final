// @ts-check

/** @type {import('sequelize-cli').Migration} */
export const up = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log("Début de la migration pour supprimer les colonnes address et identity");
    
    // Vérifier si les colonnes existent avant de les supprimer
    const tableInfo = await queryInterface.describeTable('users');
    
    if (tableInfo.address) {
      console.log("Suppression de la colonne 'address'...");
      await queryInterface.removeColumn('users', 'address', { transaction });
    }
    
    if (tableInfo.identity) {
      console.log("Suppression de la colonne 'identity'...");
      await queryInterface.removeColumn('users', 'identity', { transaction });
    }
    
    // Vérifier si les colonnes address_id et identity_id existent déjà
    if (!tableInfo.address_id) {
      console.log("Ajout de la colonne 'address_id'...");
      await queryInterface.addColumn('users', 'address_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'addresses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });
    }
    
    if (!tableInfo.identity_id) {
      console.log("Ajout de la colonne 'identity_id'...");
      await queryInterface.addColumn('users', 'identity_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'identities',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      }, { transaction });
    }
    
    await transaction.commit();
    console.log("Migration terminée avec succès");
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de la migration:", error);
    throw error;
  }
};

/** @type {import('sequelize-cli').Migration} */
export const down = async (queryInterface, Sequelize) => {
  const transaction = await queryInterface.sequelize.transaction();
  
  try {
    console.log("Annulation de la migration...");
    
    // Vérifier l'état actuel de la table
    const tableInfo = await queryInterface.describeTable('users');
    
    // Supprimer les nouvelles colonnes si elles existent
    if (tableInfo.address_id) {
      console.log("Suppression de la colonne 'address_id'...");
      await queryInterface.removeColumn('users', 'address_id', { transaction });
    }
    
    if (tableInfo.identity_id) {
      console.log("Suppression de la colonne 'identity_id'...");
      await queryInterface.removeColumn('users', 'identity_id', { transaction });
    }
    
    // Recréer les anciennes colonnes si elles n'existent plus
    if (!tableInfo.address) {
      console.log("Recréation de la colonne 'address'...");
      await queryInterface.addColumn('users', 'address', {
        type: Sequelize.JSONB,
        allowNull: true
      }, { transaction });
    }
    
    if (!tableInfo.identity) {
      console.log("Recréation de la colonne 'identity'...");
      await queryInterface.addColumn('users', 'identity', {
        type: Sequelize.JSONB,
        allowNull: true
      }, { transaction });
    }
    
    await transaction.commit();
    console.log("Annulation de la migration terminée avec succès");
  } catch (error) {
    await transaction.rollback();
    console.error("Erreur lors de l'annulation de la migration:", error);
    throw error;
  }
};
