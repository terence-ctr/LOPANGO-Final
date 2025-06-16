import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface FavoriteAttributes {
  id: string;
  propertyId: string;
  userId: string;
  notes?: string;
  notificationEnabled: boolean;
  notificationPriceDrop: boolean;
  notificationStatusChange: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type FavoriteCreationAttributes = Optional<FavoriteAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Favorite extends Model<FavoriteAttributes, FavoriteCreationAttributes> {
  public id!: string;
  public propertyId!: string;
  public userId!: string;
  public notes?: string;
  public notificationEnabled!: boolean;
  public notificationPriceDrop!: boolean;
  public notificationStatusChange!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Associations
  public property?: any;
  public user?: any;

  static initialize(sequelize: any) {
    Favorite.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        propertyId: {
          type: DataTypes.UUID,
          field: 'property_id',
          allowNull: false,
          references: {
            model: 'properties',
            key: 'id',
          },
        },
        userId: {
          type: DataTypes.UUID,
          field: 'user_id',
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        notificationEnabled: {
          type: DataTypes.BOOLEAN,
          field: 'notification_enabled',
          defaultValue: true,
        },
        notificationPriceDrop: {
          type: DataTypes.BOOLEAN,
          field: 'notification_price_drop',
          defaultValue: true,
        },
        notificationStatusChange: {
          type: DataTypes.BOOLEAN,
          field: 'notification_status_change',
          defaultValue: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          field: 'created_at',
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        updatedAt: {
          type: DataTypes.DATE,
          field: 'updated_at',
          allowNull: false,
          defaultValue: DataTypes.NOW,
        },
        deletedAt: {
          type: DataTypes.DATE,
          field: 'deleted_at',
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'Favorite',
        tableName: 'favorites',
        underscored: true,
        paranoid: true,
        timestamps: true,
        indexes: [
          {
            fields: ['property_id'],
          },
          {
            fields: ['user_id'],
          },
          {
            unique: true,
            fields: ['property_id', 'user_id'],
            name: 'favorites_property_user_unique',
          },
        ],
      }
    );

    return Favorite;
  }

  static associate(models: any) {
    Favorite.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
    });

    Favorite.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

// Export the initialize function
export const initialize = (sequelize: any) => {
  Favorite.initialize(sequelize);
  return Favorite;
};

export default Favorite;
