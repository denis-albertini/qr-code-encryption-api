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
        },
        deviceId: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: 'complaint',
        createdAt: true,
      }
    );
  }
}
