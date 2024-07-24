import sequelize from '../config/connect'
import { DataTypes } from 'sequelize'
import UsersModel from './users.modal'

const SupportModel = sequelize.define(
  'support',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    firstname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    address1_stateorprovince: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'user',
        key: 'id',
      },
      unique: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: false,
    },
    created_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, timestamps: false }
)
SupportModel.belongsTo(UsersModel, { foreignKey: 'user_id' })

export default SupportModel
