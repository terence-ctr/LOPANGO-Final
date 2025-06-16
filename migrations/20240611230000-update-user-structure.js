import { DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default {
  up: async (queryInterface, Sequelize) => {
    // Désactiver temporairement les contraintes de clé étrangère
    await queryInterface.sequelize.query('PRAGMA foreign_keys = OFF');
    
    // 1. Créer une table temporaire pour sauvegarder les données existantes
    await queryInterface.sequelize.query(`
      CREATE TABLE temp_users AS SELECT * FROM users;
    `);
    
    // 2. Supprimer l'ancienne table
    await queryInterface.dropTable('users');
    
    // 3. Créer la nouvelle table avec la structure mise à jour
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'first_name'
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'last_name'
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      dateOfBirth: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'date_of_birth'
      },
      gender: {
        type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
        allowNull: true
      },
      userType: {
        type: DataTypes.ENUM('tenant', 'landlord', 'admin', 'agent'),
        allowNull: false,
        defaultValue: 'tenant',
        field: 'user_type'
      },
      status: {
        type: DataTypes.ENUM('pending_verification', 'active', 'suspended', 'deactivated'),
        allowNull: false,
        defaultValue: 'pending_verification'
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'profile_picture'
      },
      aboutMe: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'about_me'
      },
      // Champs d'adresse (sérialisés en JSON)
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const value = this.getDataValue('address');
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue('address', JSON.stringify(value));
        }
      },
      // Champs d'identité (sérialisés en JSON)
      identity: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const value = this.getDataValue('identity');
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue('identity', JSON.stringify(value));
        }
      },
      // Préférences utilisateur (sérialisées en JSON)
      preferences: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
          const value = this.getDataValue('preferences');
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue('preferences', JSON.stringify(value));
        }
      },
      // Connexions sociales (sérialisées en JSON)
      socialLogins: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'social_logins',
        get() {
          const value = this.getDataValue('socialLogins');
          return value ? JSON.parse(value) : null;
        },
        set(value) {
          this.setDataValue('socialLogins', JSON.stringify(value));
        }
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'email_verified'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'reset_password_token'
      },
      resetPasswordExpire: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'reset_password_expire'
      },
      emailVerificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'email_verification_token'
      },
      emailVerificationExpire: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_verification_expire'
      },
      accountRecoveryToken: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'account_recovery_token'
      },
      accountRecoveryExpire: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'account_recovery_expire'
      },
      failedLoginAttempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'failed_login_attempts'
      },
      accountLockedUntil: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'account_locked_until'
      },
      mfaEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'mfa_enabled'
      },
      mfaSecret: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'mfa_secret'
      },
      acceptedTerms: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'accepted_terms'
      },
      acceptedTermsAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'accepted_terms_at'
      },
      acceptedPrivacyPolicy: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'accepted_privacy_policy'
      },
      acceptedPrivacyPolicyAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'accepted_privacy_policy_at'
      },
      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'last_login'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        field: 'updated_at'
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'deleted_at'
      }
    });

    // 4. Recopier les données de l'ancienne table vers la nouvelle
    // (seulement les champs qui existent dans les deux tables)
    await queryInterface.sequelize.query(`
      INSERT INTO users (
        id, email, password, first_name, last_name, phone, 
        status, created_at, updated_at, deleted_at
      )
      SELECT 
        id, email, password, first_name, last_name, phone,
        'active' as status, 
        COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
        COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at,
        deleted_at
      FROM temp_users;
    `);

    // 5. Supprimer la table temporaire
    await queryInterface.dropTable('temp_users');

    // 6. Créer les index
    await queryInterface.addIndex('users', ['email'], { unique: true });
    await queryInterface.addIndex('users', ['user_type']);
    await queryInterface.addIndex('users', ['status']);
    await queryInterface.addIndex('users', ['email_verification_token']);
    await queryInterface.addIndex('users', ['reset_password_token']);
    
    // Réactiver les contraintes de clé étrangère
    await queryInterface.sequelize.query('PRAGMA foreign_keys = ON');
  },

  down: async (queryInterface, Sequelize) => {
    // En cas de rollback, on ne peut pas restaurer la structure exacte précédente
    // car nous n'avons pas sauvegardé tous les champs
    console.warn('Rollback will not restore the exact previous table structure');
    
    // Créer une sauvegarde de la table actuelle
    await queryInterface.sequelize.query(`
      CREATE TABLE rollback_users_backup AS SELECT * FROM users;
    `);
    
    // Supprimer la table actuelle
    await queryInterface.dropTable('users');
    
    // Recréer la table précédente
    await queryInterface.createTable('users', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: ''
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });
    
    // Recopier les données de la sauvegarde vers la table rollback
    await queryInterface.sequelize.query(`
      INSERT INTO users (
        id, email, password, first_name, last_name, phone, 
        created_at, updated_at, deleted_at
      )
      SELECT 
        id, email, password, first_name, last_name, phone,
        COALESCE(created_at, CURRENT_TIMESTAMP) as created_at,
        COALESCE(updated_at, CURRENT_TIMESTAMP) as updated_at,
        deleted_at
      FROM rollback_users_backup;
    `);
    
    // Supprimer la sauvegarde
    await queryInterface.dropTable('rollback_users_backup');
  }
};
