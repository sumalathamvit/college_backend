import sequelize from '../config/connect'
import { DataTypes } from 'sequelize'
import UserModel from './users.modal'
import Certification from './certificate.model'

const userCertificate = sequelize.define(
  'user_certificate',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'user',
        key: 'id',
      },
    },
    certificate_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'certificate',
        key: 'id',
      },
    },
    start_date: {
      type: DataTypes.STRING,
    },
    expire_date: {
      type: DataTypes.STRING,
    },
    certificate_status: {
      type: DataTypes.STRING,
      allownull: true,
    },
    source: {
      type: DataTypes.STRING,// values CRM, LMS,SELF_WAIVED
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
  },
  { sequelize, timestamps: false }
)

userCertificate.belongsTo(UserModel, { foreignKey: 'user_id' })
userCertificate.belongsTo(Certification, { foreignKey: 'certificate_id' })

export default userCertificate
