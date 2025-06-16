import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Interface pour les attributs d'une adresse
export interface IAddress {
  id: number;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
  additionalInfo?: string | null;
  isPrimary: boolean;
  userId: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;
}

// Interface pour les attributs de création d'une adresse
export type AddressCreationAttributes = Optional<IAddress, 'id' | 'latitude' | 'longitude' | 'additionalInfo' | 'isPrimary' | 'createdAt' | 'updatedAt' | 'deletedAt'>;

class Address extends Model<IAddress, AddressCreationAttributes> implements IAddress {
  public id!: number;
  public street!: string;
  public city!: string;
  public state!: string;
  public postalCode!: string;
  public country!: string;
  public latitude?: number | null;
  public longitude?: number | null;
  public additionalInfo?: string | null;
  public isPrimary!: boolean;
  public userId!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;

  // Méthode pour initialiser le modèle
  public static initialize() {
    Address.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        street: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        postalCode: {
          type: DataTypes.STRING(20),
          allowNull: false,
          field: 'postal_code',
        },
        country: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        latitude: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        longitude: {
          type: DataTypes.FLOAT,
          allowNull: true,
        },
        additionalInfo: {
          type: DataTypes.TEXT,
          allowNull: true,
          field: 'additional_info',
        },
        isPrimary: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
          field: 'is_primary',
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
        modelName: 'Address',
        tableName: 'addresses',
        paranoid: true,
        timestamps: true,
        underscored: true,
      }
    );
  }

  // Méthode pour définir les associations
  public static associate(models: any) {
    Address.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

// Fonction d'initialisation pour le chargement du modèle
export const initialize = (sequelize: any): typeof Address => {
  Address.initialize();
  return Address;
};

export { Address };
export default Address;
