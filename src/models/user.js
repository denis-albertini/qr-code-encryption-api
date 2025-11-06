import bcrypt from 'bcryptjs';
import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password: {
      type: DataTypes.STRING(60),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['USER', 'ADMIN'],
    },
    privateKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    publicKey: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'user',
    paranoid: true,
    hooks: {
      beforeCreate: async (user, _options) => {
        user.password = await bcrypt.hash(user.password, 10);
      },
    },
  }
);

export default User;
