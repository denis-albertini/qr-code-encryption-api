import { DataTypes, Model } from 'sequelize';

export default class Complaint extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        description: {
          type: DataTypes.STRING(500),
          allowNull: true,
          field: 'description',
        },
        deviceId: {
          type: DataTypes.STRING,
          allowNull: false,
          field: 'device_id',
        },
        qrCodeId: {
          type: DataTypes.UUID,
          allowNull: false,
          field: 'qr_code_id',
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: true,
          field: 'user_id',
        },
      },
      {
        sequelize,
        tableName: 'complaint',
        createdAt: true,
        indexes: [
          {
            unique: true,
            fields: ['device_id', 'qr_code_id'],
            name: 'complaint_device_qrcode_unique',
          },
        ],
      }
    );
  }
}
