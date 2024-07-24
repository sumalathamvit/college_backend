import sequelize from '../config/connect'
import { DataTypes } from 'sequelize'
import RequestModel from './request.model'

const TrainigModel = sequelize.define(
  'training',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    training_type: {
      type: DataTypes.STRING,
    },
    max_learner: {
      type: DataTypes.INTEGER,
    },
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ['scheduling', 'enrolling', 'completed', 'cancelled'],
    },
    start_date: {
      type: DataTypes.STRING,
    },
    end_date: {
      type: DataTypes.STRING,
    },
    start_time: {
      type: DataTypes.STRING,
    },
    end_time: {
      type: DataTypes.STRING,
    },
    time_zone: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    state: {
      type: DataTypes.STRING,
    },
    zipcode: {
      type: DataTypes.STRING,
    },
    notes: {
      type: DataTypes.TEXT,
    },
    lms_course_id: {
      type: DataTypes.INTEGER,
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
    request_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'request',
        key: 'id',
      },
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    training_course_id: {
      type: DataTypes.INTEGER,
    },
  },
  { sequelize, timestamps: false }
)
TrainigModel.belongsTo(RequestModel, { foreignKey: 'request_id' })

export default TrainigModel
