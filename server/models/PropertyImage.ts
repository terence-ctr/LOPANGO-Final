import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface PropertyImageAttributes {
  id: string;
  propertyId: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
  order: number;
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type PropertyImageCreationAttributes = Optional<PropertyImageAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class PropertyImage extends Model<PropertyImageAttributes, PropertyImageCreationAttributes> {
  public id!: string;
  public propertyId!: string;
  public url!: string;
  public altText?: string;
  public isPrimary!: boolean;
  public order!: number;
  public width?: number;
  public height?: number;
  public size?: number;
  public mimeType?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Associations
  public property?: any;

  static initialize(sequelize: any) {
    PropertyImage.init(
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
        url: {
          type: DataTypes.STRING(500),
          allowNull: false,
        },
        altText: {
          type: DataTypes.STRING(255),
          field: 'alt_text',
          allowNull: true,
        },
        isPrimary: {
          type: DataTypes.BOOLEAN,
          field: 'is_primary',
          defaultValue: false,
        },
        order: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        width: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        height: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        size: {
          type: DataTypes.INTEGER,
          comment: 'File size in bytes',
          allowNull: true,
        },
        mimeType: {
          type: DataTypes.STRING(100),
          field: 'mime_type',
          allowNull: true,
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
        modelName: 'PropertyImage',
        tableName: 'property_images',
        underscored: true,
        paranoid: true,
        timestamps: true,
      }
    );

    return PropertyImage;
  }

  static associate(models: any) {
    PropertyImage.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
    });
  }
}

// Export the initialize function
export const initialize = (sequelize: any) => {
  PropertyImage.initialize(sequelize);
  return PropertyImage;
};

export default PropertyImage;
