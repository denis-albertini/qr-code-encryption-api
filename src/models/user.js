import bcrypt from 'bcryptjs';
import { DataTypes, Model } from 'sequelize';

export default class User extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        username: {
          type: DataTypes.STRING(50),
          allowNull: false,
          unique: true,
          validate: {
            len: [3, 50],
          },
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
          values: ['USER', 'ADMIN'],
          defaultValue: 'USER',
          allowNull: false,
        },
        privateKey: {
          type: DataTypes.STRING(1800),
          allowNull: false,
          unique: true,
        },
        publicKey: {
          type: DataTypes.STRING(460),
          allowNull: false,
          unique: true,
        },
      },
      {
        sequelize,
        tableName: 'user',
        paranoid: true,
        hooks: {
          beforeCreate: async (user, _options) => {
            user.password = await bcrypt.hash(user.password, 10);
          },
        },
      }
    );
  }
}
