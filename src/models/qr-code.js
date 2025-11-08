import { DataTypes, Model } from 'sequelize';

export default class QRCode extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        content: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        signature: {
          type: DataTypes.CHAR(344),
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'qr_code',
        paranoid: true,
        createdAt: true,
      }
    );
  }
}
