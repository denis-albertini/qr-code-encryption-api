import { Sequelize } from 'sequelize';
import Complaint from './models/complaint.js';
import QRCode from './models/qr-code.js';
import User from './models/user.js';

class Database {
  #sequelize;

  get sequelize() {
    return this.#sequelize;
  }

  async initConnection() {
    if (this.sequelize) {
      throw new Error('Trying to instanciate another database connection.');
    }

    this.#sequelize = new Sequelize(process.env.POSTGRESQL_CONNECTION_URI, {
      logging: false,
      define: {
        underscored: true,
        timestamps: true,
        createdAt: false,
        updatedAt: false,
      },
    });

    await this.sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    this.#initModels();
    this.#initAssociations();
  }

  #initModels() {
    User.init(this.sequelize);
    QRCode.init(this.sequelize);
    Complaint.init(this.sequelize);
  }

  #initAssociations() {
    User.hasMany(QRCode, { foreignKey: { name: 'userId', allowNull: false } });
    QRCode.belongsTo(User, {
      foreignKey: { name: 'userId', allowNull: false },
    });

    User.hasMany(Complaint, { foreignKey: 'userId' });
    Complaint.belongsTo(User, { foreignKey: 'userId' });

    QRCode.hasMany(Complaint, {
      foreignKey: { name: 'qrCodeId', allowNull: false },
    });
    Complaint.belongsTo(QRCode, {
      foreignKey: { name: 'qrCodeId', allowNull: false },
    });
  }

  async sync(options) {
    if (!this.sequelize) {
      throw new Error('Trying to sync without a connection.');
    }

    await this.sequelize.sync(options);
  }
}

export default new Database();
