import bcrypt from 'bcryptjs';
import { DataTypes, Model, Op } from 'sequelize';

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
        status: {
          type: DataTypes.ENUM,
          values: ['PENDING', 'ACTIVE'],
          defaultValue: 'PENDING',
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'user',
        paranoid: true,
        createdAt: true,
        hooks: {
          beforeCreate: async (user, _options) => {
            const pendingConflictingAccount = await User.findOne({
              where: {
                [Op.or]: [{ username: user.username }, { email: user.email }],
                status: 'PENDING',
              },
              paranoid: false,
            });

            const hoursDiff =
              (new Date() - pendingConflictingAccount?.createdAt) /
              (1000 * 60 * 60);

            if (hoursDiff > 24) {
              await pendingConflictingAccount.destroy({ force: true });
            }

            user.password = await bcrypt.hash(user.password, 10);
          },
        },
      }
    );
  }
}
