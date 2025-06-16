import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database.js';

export enum IdentityType {
  NATIONAL_ID = 'national_id',
  PASSPORT = 'passport',
  DRIVING_LICENSE = 'driving_license'
}

// Interface pour les attributs d'une identité
export interface IIdentity {
  id: number;
  type: IdentityType;
  number: string;
  issueDate: Date;
  expiryDate?: Date | null;
  issueCountry: string;
  issueAuthority?: string | null;
  isVerified: boolean;
  verificationDate?: Date | null;
  documentFrontUrl?: string | null;
  documentBackUrl?: string | null;
  selfieUrl?: string | null;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Interface pour les attributs de création d'une identité
export type IdentityCreationAttributes = Optional<
  IIdentity, 
  'id' | 'expiryDate' | 'issueAuthority' | 'isVerified' | 'verificationDate' | 
  'documentFrontUrl' | 'documentBackUrl' | 'selfieUrl' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

class Identity extends Model<IIdentity, IdentityCreationAttributes> implements IIdentity {
  public id!: number;
  public type!: IdentityType;
  public number!: string;
  public issueDate!: Date;
  public expiryDate?: Date | null;
  public issueCountry!: string;
  public issueAuthority?: string | null;
  public isVerified!: boolean;
  public verificationDate?: Date | null;
  public documentFrontUrl?: string | null;
  public documentBackUrl?: string | null;
  public selfieUrl?: string | null;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;

  // Méthode pour initialiser le modèle
  public static initialize() {
    Identity.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        type: {
          type: DataTypes.ENUM(
            IdentityType.NATIONAL_ID,
            IdentityType.PASSPORT,
            IdentityType.DRIVING_LICENSE
          ),
          allowNull: false,
        },
        number: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        issueDate: {
          type: DataTypes.DATEONLY,
          allowNull: false,
          field: 'issue_date',
        },
        expiryDate: {
          type: DataTypes.DATEONLY,
          allowNull: true,
          field: 'expiry_date',
        },
        issueCountry: {
          type: DataTypes.STRING(100),
          allowNull: false,
          field: 'issue_country',
        },
        issueAuthority: {
          type: DataTypes.STRING(255),
          allowNull: true,
          field: 'issue_authority',
        },
        isVerified: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_verified',
        },
        verificationDate: {
          type: DataTypes.DATE,
          allowNull: true,
          field: 'verification_date',
        },
        documentFrontUrl: {
          type: DataTypes.STRING(512),
          allowNull: true,
          field: 'document_front_url',
        },
        documentBackUrl: {
          type: DataTypes.STRING(512),
          allowNull: true,
          field: 'document_back_url',
        },
        selfieUrl: {
          type: DataTypes.STRING(512),
          allowNull: true,
          field: 'selfie_url',
        },
        userId: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'user_id',
          references: {
            model: 'users',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
      },
      {
        sequelize,
        modelName: 'Identity',
        tableName: 'identities',
        paranoid: true,
        timestamps: true,
        underscored: true,
      }
    );
  }

  // Méthode pour définir les associations
  public static associate(models: any) {
    Identity.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

// Fonction d'initialisation pour le chargement du modèle
export const initialize = (sequelize: any): typeof Identity => {
  Identity.initialize();
  return Identity;
};

export { Identity };
export default Identity;
