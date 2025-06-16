import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface ReviewAttributes {
  id: string;
  propertyId: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  response?: string;
  responseDate?: Date;
  isApproved: boolean;
  isFeatured: boolean;
  likes: number;
  dislikes: number;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type ReviewCreationAttributes = Optional<ReviewAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Review extends Model<ReviewAttributes, ReviewCreationAttributes> {
  public id!: string;
  public propertyId!: string;
  public userId!: string;
  public rating!: number;
  public title!: string;
  public comment!: string;
  public response?: string;
  public responseDate?: Date;
  public isApproved!: boolean;
  public isFeatured!: boolean;
  public likes!: number;
  public dislikes!: number;
  public ipAddress?: string;
  public userAgent?: string;
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
    Review.init(
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
        rating: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: {
            min: 1,
            max: 5,
          },
        },
        title: {
          type: DataTypes.STRING(255),
          allowNull: false,
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        response: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        responseDate: {
          type: DataTypes.DATE,
          field: 'response_date',
          allowNull: true,
        },
        isApproved: {
          type: DataTypes.BOOLEAN,
          field: 'is_approved',
          defaultValue: false,
        },
        isFeatured: {
          type: DataTypes.BOOLEAN,
          field: 'is_featured',
          defaultValue: false,
        },
        likes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        dislikes: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
        },
        ipAddress: {
          type: DataTypes.STRING(45),
          field: 'ip_address',
          allowNull: true,
        },
        userAgent: {
          type: DataTypes.TEXT,
          field: 'user_agent',
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
        modelName: 'Review',
        tableName: 'reviews',
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
            fields: ['is_approved'],
          },
          {
            fields: ['is_featured'],
          },
        ],
      }
    );

    return Review;
  }

  static associate(models: any) {
    Review.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
    });

    Review.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  }
}

// Export the initialize function
export const initialize = (sequelize: any) => {
  Review.initialize(sequelize);
  return Review;
};

export default Review;
