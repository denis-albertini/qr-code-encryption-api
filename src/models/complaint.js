import { DataTypes } from 'sequelize';
import sequelize from '../sequelize.js';

const Complaint = sequelize.define(
  'Complaint',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
  },
  { tableName: 'complaint' }
);

export default Complaint;
