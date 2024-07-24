import sequelize from '../config/connect'
import { DataTypes } from 'sequelize'
import TrainigModel from './training.model'
import UsersModel from './users.modal'
import UsersDataModel from './user_data.model'

const LearnerTrainingMapping = sequelize.define(
  'learner_training_mapping',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: true,
      // values: [
      //   'clicked',
      //   'invited',
      //   'passed',
      //   'enrolled',
      //   'failed',
      //   'not_sent',
      // ],
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
    training_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'training',
        key: 'id',
      },
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    user_data_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'users_data',
        key: 'id',
      },
      allowNull: true,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    waive_pre_check: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  { sequelize, timestamps: false }
)
LearnerTrainingMapping.belongsTo(TrainigModel, { foreignKey: 'training_id' })
LearnerTrainingMapping.belongsTo(UsersDataModel, { foreignKey: 'user_data_id' })

export default LearnerTrainingMapping
