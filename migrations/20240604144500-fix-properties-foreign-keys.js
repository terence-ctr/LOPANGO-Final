import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    const t = await queryInterface.sequelize.transaction();
    
    try {
      // Désactiver temporairement les contraintes de clé étrangère
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction: t });

      // Vérifier si la table properties existe
      const [results] = await queryInterface.sequelize.query(
        "SHOW TABLES LIKE 'properties'",
        { transaction: t }
      );
      
      if (results.length > 0) {
        // Supprimer les contraintes de clé étrangère existantes si elles existent
        const constraints = await queryInterface.sequelize.query(
          `SELECT CONSTRAINT_NAME 
           FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
           WHERE TABLE_NAME = 'properties' 
           AND CONSTRAINT_NAME IN (
             'properties_owner_id_users_fk',
             'properties_created_by_users_fk',
             'properties_updated_by_users_fk'
           )`,
          { transaction: t }
        );

        for (const constraint of constraints[0]) {
          await queryInterface.removeConstraint(
            'properties', 
            constraint.CONSTRAINT_NAME,
            { transaction: t }
          );
        }


        // Vérifier si les colonnes existent avant de les modifier
        const columns = await queryInterface.describeTable('properties');
        
        if (columns.owner_id) {
          await queryInterface.changeColumn('properties', 'owner_id', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }, { transaction: t });
        }

        if (columns.created_by) {
          await queryInterface.changeColumn('properties', 'created_by', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }, { transaction: t });
        }

        if (columns.updated_by) {
          await queryInterface.changeColumn('properties', 'updated_by', {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'users',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'RESTRICT'
          }, { transaction: t });
        }
      }

      // Réactiver les contraintes de clé étrangère
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction: t });
      
      await t.commit();
    } catch (error) {
      // En cas d'erreur, annuler la transaction et réactiver les contraintes
      console.error('Migration error:', error);
      if (t) {
        await t.rollback();
      }
      await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Cette migration ne peut pas être annulée car elle corrige une incohérence
    // La seule façon de revenir en arrière serait de supprimer et recréer la table avec les bons types
    console.warn('Impossible de revenir en arrière sur cette migration. La suppression de la table properties est nécessaire.');
  }
};
