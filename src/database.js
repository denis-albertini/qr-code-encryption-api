import { Sequelize } from 'sequelize';
import Complaint from './models/complaint.js';
import QRCode from './models/qr-code.js';
import User from './models/user.js';

class Database {
  #sequelize;
  #transaction;

  get sequelize() {
    return this.#sequelize;
  }

  get transaction() {
    return this.#transaction;
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

  async startTransaction() {
    if (!this.sequelize) {
      throw new Error(
        'Trying to start a transaction but there is no connection.'
      );
    }

    if (this.transaction) {
      throw new Error(
        'Trying to start a new transaction but the last one is not finished.'
      );
    }

    this.#transaction = await this.sequelize.transaction();
  }

  async commitTransaction() {
    if (!this.transaction) {
      throw new Error(
        'Trying to commit a transaction but there is not one running.'
      );
    }

    await this.transaction.commit();

    this.#transaction = null;
  }

  async rollbackTransaction() {
    if (!this.transaction) {
      throw new Error(
        'Trying to rollback a transaction but there is not one running.'
      );
    }

    await this.transaction.rollback();

    this.#transaction = null;
  }
}

export default new Database();
