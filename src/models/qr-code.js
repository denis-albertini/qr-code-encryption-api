import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const QRCode = sequelize.define(
  'QRCode',
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
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: 'qr_code',
    paranoid: true,
    createdAt: true,
  }
);

export default QRCode;
