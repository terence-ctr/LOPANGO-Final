import { Model, DataTypes, Optional } from 'sequelize';
import { sequelize } from '../config/database';

export interface BookingAttributes {
  id: string;
  propertyId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed';
  paymentMethod?: string;
  transactionId?: string;
  cancellationReason?: string;
  cancelledById?: string;
  cancelledAt?: Date;
  notes?: string;
  guestCount: number;
  specialRequests?: string;
  checkInInstructions?: string;
  cancellationPolicy: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  refundAmount?: number;
  refundedAt?: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

type BookingCreationAttributes = Optional<BookingAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Booking extends Model<BookingAttributes, BookingCreationAttributes> {
  public id!: string;
  public propertyId!: string;
  public userId!: string;
  public startDate!: Date;
  public endDate!: Date;
  public totalPrice!: number;
  public status!: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rejected';
  public paymentStatus!: 'pending' | 'paid' | 'refunded' | 'partially_refunded' | 'failed';
  public paymentMethod?: string;
  public transactionId?: string;
  public cancellationReason?: string;
  public cancelledById?: string;
  public cancelledAt?: Date;
  public notes?: string;
  public guestCount!: number;
  public specialRequests?: string;
  public checkInInstructions?: string;
  public cancellationPolicy!: 'flexible' | 'moderate' | 'strict' | 'super_strict';
  public refundAmount?: number;
  public refundedAt?: Date;
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
  public cancelledBy?: any;

  static initialize(sequelize: any) {
    Booking.init(
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
        startDate: {
          type: DataTypes.DATEONLY,
          field: 'start_date',
          allowNull: false,
        },
        endDate: {
          type: DataTypes.DATEONLY,
          field: 'end_date',
          allowNull: false,
          validate: {
            isAfterStartDate(value: Date) {
              if (value <= this.startDate) {
                throw new Error('End date must be after start date');
              }
            },
          },
        },
        totalPrice: {
          type: DataTypes.DECIMAL(12, 2),
          field: 'total_price',
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected'),
          defaultValue: 'pending',
        },
        paymentStatus: {
          type: DataTypes.ENUM('pending', 'paid', 'refunded', 'partially_refunded', 'failed'),
          field: 'payment_status',
          defaultValue: 'pending',
        },
        paymentMethod: {
          type: DataTypes.STRING(50),
          field: 'payment_method',
          allowNull: true,
        },
        transactionId: {
          type: DataTypes.STRING(100),
          field: 'transaction_id',
          allowNull: true,
        },
        cancellationReason: {
          type: DataTypes.TEXT,
          field: 'cancellation_reason',
          allowNull: true,
        },
        cancelledById: {
          type: DataTypes.UUID,
          field: 'cancelled_by_id',
          allowNull: true,
          references: {
            model: 'users',
            key: 'id',
          },
        },
        cancelledAt: {
          type: DataTypes.DATE,
          field: 'cancelled_at',
          allowNull: true,
        },
        notes: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        guestCount: {
          type: DataTypes.INTEGER,
          field: 'guest_count',
          defaultValue: 1,
          validate: {
            min: 1,
          },
        },
        specialRequests: {
          type: DataTypes.TEXT,
          field: 'special_requests',
          allowNull: true,
        },
        checkInInstructions: {
          type: DataTypes.TEXT,
          field: 'check_in_instructions',
          allowNull: true,
        },
        cancellationPolicy: {
          type: DataTypes.ENUM('flexible', 'moderate', 'strict', 'super_strict'),
          field: 'cancellation_policy',
          defaultValue: 'moderate',
        },
        refundAmount: {
          type: DataTypes.DECIMAL(12, 2),
          field: 'refund_amount',
          allowNull: true,
        },
        refundedAt: {
          type: DataTypes.DATE,
          field: 'refunded_at',
          allowNull: true,
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
        modelName: 'Booking',
        tableName: 'bookings',
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
            fields: ['status'],
          },
          {
            fields: ['payment_status'],
          },
          {
            fields: ['start_date', 'end_date'],
          },
        ],
      }
    );

    return Booking;
  }

  static associate(models: any) {
    Booking.belongsTo(models.Property, {
      foreignKey: 'propertyId',
      as: 'property',
    });

    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    Booking.belongsTo(models.User, {
      foreignKey: 'cancelledById',
      as: 'cancelledBy',
    });
  }
}

// Export the initialize function
export const initialize = (sequelize: any) => {
  Booking.initialize(sequelize);
  return Booking;
};

export default Booking;
