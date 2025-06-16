import { DataTypes, Model, type HookReturn } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database';
import { generateUserId } from '../utils/idGenerator';
import { UserModel, IUser, UserCreationAttributes } from '../types/user.types';
import { UserType } from '../utils/enums/user.enum';

class User extends Model<IUser, UserCreationAttributes> implements IUser {
  public id!: string; // Format: PREFIX-UUID (ex: USR-123e4567-e89b-12d3-a456-426614174000)
  public email!: string;
  public password!: string;
  public first_name!: string;
  public last_name!: string;
  public phone!: string;
  public userType!: UserType;
  public status!: string;
  public dateOfBirth!: Date;
  public gender!: string;
  public lastLogin?: Date | null;
  public email_verified!: boolean;
  public phone_verified!: boolean;
  public refresh_token?: string | null;
  public reset_password_token?: string | null;
  public reset_password_expires?: Date | null;
  public mfaEnabled!: boolean;
  public mfaSecret?: string | null;
  public failedLoginAttempts!: number;
  public accountLockedUntil?: Date | null;
  public acceptedTerms!: boolean;
  public acceptedTermsAt!: Date | null;
  public acceptedPrivacyPolicy!: boolean;
  public acceptedPrivacyPolicyAt!: Date | null;
  public addressId?: number | null;
  public identityId?: number | null;
  public preferences?: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;

  // Associations
  public properties?: any[];
  public reviews?: any[];
  public bookings?: any[];
  public favorites?: any[];
  public approvedProperties?: any[];

  // Méthode pour générer un ID personnalisé avant la création
  private static async generateCustomId(instance: User): Promise<void> {
    if (!instance.id && instance.userType) {
      instance.id = generateUserId(instance.userType);
    }
  }

  // Méthodes d'instance
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
  
  // Méthode pour définir le mot de passe (hachage automatique)
  public async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(password, salt);
  }

  // Initialisation du modèle
  public static initialize() {
    User.init(
      {
        id: {
          type: DataTypes.STRING(50), // Format: PREFIX-UUID (ex: USR-123e4567-e89b-12d3-a456-426614174000)
          primaryKey: true,
          allowNull: false,
          unique: true,
          validate: {
            is: /^(USR|ADM|AGN|LND|TNT)-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          },
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'first_name'
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'last_name'
        },
        phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        userType: {
          type: DataTypes.ENUM('tenant', 'landlord', 'admin', 'agent'),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('active', 'inactive', 'suspended', 'pending_verification'),
          defaultValue: 'pending_verification',
        },
        email_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'email_verified'
        },
        phone_verified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'phone_verified'
        },
        refresh_token: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'refresh_token'
        },
        reset_password_token: {
          type: DataTypes.STRING,
          allowNull: true,
          field: 'reset_password_token'
        },
        reset_password_expires: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'reset_password_expires'
        },
        // Les champs address et identity ont été déplacés vers des tables séparées
        // et sont accessibles via les associations addressData et identityData
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'Users', // S'assurer que le nom de la table correspond exactement à celui dans la base de données
        paranoid: true,
        timestamps: true,
        // Désactiver le underscore pour forcer l'utilisation de camelCase
        underscored: false,
        // Spécifier explicitement les noms des colonnes de timestamp
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
        deletedAt: 'deletedAt',
        hooks: {
          beforeCreate: async (user: User) => {
            await User.generateCustomId(user);
            if (user.changed('password')) {
              await user.setPassword(user.password);
            }
          },
          beforeUpdate: async (user: User) => {
            if (user.changed('password')) {
              await user.setPassword(user.password);
            }
          },
        },
        defaultScope: {
          attributes: { exclude: ['password', 'refreshToken', 'resetPasswordToken'] },
        },
        scopes: {
          withSensitiveData: {
            attributes: { include: ['password', 'refreshToken', 'resetPasswordToken'] },
          },
        },
      }
    );
  }

  // Définition des associations
  public static associate(models: any) {
    // Un utilisateur a une adresse (relation one-to-one)
    User.belongsTo(models.Address, { 
      foreignKey: 'addressId',
      as: 'addressData',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
    
    // Un utilisateur a une identité (relation one-to-one)
    User.belongsTo(models.Identity, { 
      foreignKey: 'identityId',
      as: 'identityData',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }
}

// Fonction d'initialisation pour le chargement du modèle
export const initialize = (sequelize: any): typeof User => {
  if (!sequelize.models.User) {
    // Initialiser le modèle
    User.initialize();
    
    // Ne pas appeler User.associate ici, il sera appelé par initModels
  } else {
    // Si le modèle existe déjà, s'assurer qu'il a les bonnes propriétés
    const existingModel = sequelize.models.User;
    if (!existingModel.prototype.addressId) {
      existingModel.init({
        // Définir uniquement les champs manquants
        addressId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'address_id',
          references: {
            model: 'addresses',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        },
        identityId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          field: 'identity_id',
          references: {
            model: 'identities',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }
      }, {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        timestamps: true,
        underscored: true
      });
    }
  }
  
  return User;
};

export { User };
export default User;
