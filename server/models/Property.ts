import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Property as PropertyInterface } from '../utils/interfaces/property.interface';
import { User } from './User';

type PropertyCreationAttributes = Optional<PropertyInterface, 'id' | 'createdAt' | 'updatedAt'>;

export class Property extends Model<PropertyInterface, PropertyCreationAttributes> {
  public id!: string;
  public title!: string;
  public description!: string;
  public type!: 'apartment' | 'house' | 'villa' | 'commercial' | 'land' | 'other';
  public price!: number;
  public surface!: number;
  public rooms!: number;
  public bedrooms!: number;
  public bathrooms!: number;
  public floor?: number;
  public totalFloors?: number;
  public hasElevator?: boolean;
  public hasParking?: boolean;
  public hasBalcony?: boolean;
  public hasTerrace?: boolean;
  public hasGarden?: boolean;
  public isFurnished?: boolean;
  public isNewConstruction?: boolean;
  public yearBuilt?: number;
  public energyClass?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  public greenhouseGasEmission?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  public address!: string;
  public city!: string;
  public postalCode!: string;
  public country!: string;
  public lat?: number;
  public lng?: number;
  public status!: 'available' | 'pending' | 'sold' | 'rented' | 'draft';
  public isApproved!: boolean;
  public ownerId!: string;
  public approvedById?: string;
  public approvedAt?: Date;
  public rejectionReason?: string;
  public views!: number;
  public featured!: boolean;
  public featuredUntil?: Date;
  public featuredOrder?: number;
  public slug!: string;
  public metaTitle?: string;
  public metaDescription?: string;
  public metaKeywords?: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public deletedAt?: Date;

  // Timestamps
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at?: Date;

  // Associations
  public owner?: User;
  public approvedBy?: User;
  public images?: any[];
  public reviews?: any[];
  public bookings?: any[];
  public favorites?: any[];

  static initialize(sequelize: any) {
    Property.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        type: {
          type: DataTypes.ENUM('apartment', 'house', 'villa', 'commercial', 'land', 'other'),
          allowNull: false,
        },
        price: {
          type: DataTypes.DECIMAL(12, 2),
          allowNull: false,
        },
        surface: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        rooms: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        bedrooms: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        bathrooms: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        floor: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        totalFloors: {
          type: DataTypes.INTEGER,
          field: 'total_floors',
          allowNull: true,
        },
        hasElevator: {
          type: DataTypes.BOOLEAN,
          field: 'has_elevator',
          defaultValue: false,
        },
        hasParking: {
          type: DataTypes.BOOLEAN,
          field: 'has_parking',
          defaultValue: false,
        },
        hasBalcony: {
          type: DataTypes.BOOLEAN,
          field: 'has_balcony',
          defaultValue: false,
        },
        hasTerrace: {
          type: DataTypes.BOOLEAN,
          field: 'has_terrace',
          defaultValue: false,
        },
        hasGarden: {
          type: DataTypes.BOOLEAN,
          field: 'has_garden',
          defaultValue: false,
        },
        isFurnished: {
          type: DataTypes.BOOLEAN,
          field: 'is_furnished',
          defaultValue: false,
        },
        isNewConstruction: {
          type: DataTypes.BOOLEAN,
          field: 'is_new_construction',
          defaultValue: false,
        },
        yearBuilt: {
          type: DataTypes.INTEGER,
          field: 'year_built',
          allowNull: true,
        },
        energyClass: {
          type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G'),
          field: 'energy_class',
          allowNull: true,
        },
        greenhouseGasEmission: {
          type: DataTypes.ENUM('A', 'B', 'C', 'D', 'E', 'F', 'G'),
          field: 'greenhouse_gas_emission',
          allowNull: true,
        },
        address: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        city: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        postalCode: {
          type: DataTypes.STRING(20),
          field: 'postal_code',
          allowNull: false,
        },
        country: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        lat: {
          type: DataTypes.DECIMAL(10, 8),
          allowNull: true,
        },
        lng: {
          type: DataTypes.DECIMAL(11, 8),
          allowNull: true,
        },
        status: {
          type: DataTypes.ENUM('available', 'pending', 'sold', 'rented', 'draft'),
          defaultValue: 'draft',
        },
        isApproved: {
          type: DataTypes.BOOLEAN,
          field: 'is_approved',
          defaultValue: false,
        },
        ownerId: {
          type: DataTypes.UUID,
          field: 'owner_id',
          allowNull: false,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        approvedById: {
          type: DataTypes.UUID,
          field: 'approved_by_id',
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        approvedAt: {
          type: DataTypes.DATE,
          field: 'approved_at',
          allowNull: true,
        },
        rejectionReason: {
          type: DataTypes.TEXT,
          field: 'rejection_reason',
          allowNull: true,
        },
        views: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        featured: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        featuredUntil: {
          type: DataTypes.DATE,
          field: 'featured_until',
          allowNull: true,
        },
        featuredOrder: {
          type: DataTypes.INTEGER,
          field: 'featured_order',
          allowNull: true,
        },
        slug: {
          type: DataTypes.STRING(255),
          allowNull: false,
          unique: true,
        },
        metaTitle: {
          type: DataTypes.STRING(255),
          field: 'meta_title',
          allowNull: true,
        },
        metaDescription: {
          type: DataTypes.STRING(500),
          field: 'meta_description',
          allowNull: true,
        },
        metaKeywords: {
          type: DataTypes.STRING(500),
          field: 'meta_keywords',
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
        modelName: 'Property',
        tableName: 'properties',
        underscored: true,
        paranoid: true,
        timestamps: true,
      }
    );

    return Property;
  }

  static associate(models: any) {
    Property.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
    });

    Property.belongsTo(models.User, {
      foreignKey: 'approvedById',
      as: 'approvedBy',
    });

    Property.hasMany(models.PropertyImage, {
      foreignKey: 'propertyId',
      as: 'images',
    });

    Property.hasMany(models.Review, {
      foreignKey: 'propertyId',
      as: 'reviews',
    });

    Property.hasMany(models.Booking, {
      foreignKey: 'propertyId',
      as: 'bookings',
    });

    Property.hasMany(models.Favorite, {
      foreignKey: 'propertyId',
      as: 'favorites',
    });
  }
}

// Export the initialize function
export const initialize = (sequelize: any) => {
  Property.initialize(sequelize);
  return Property;
};

export default Property;
