import sequelize from '../config/connect'
import { DataTypes } from 'sequelize'
import CourseModel from './courses.model'

const Certification = sequelize.define(
  'certificate',
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
    },
    term: {
      type: DataTypes.STRING,
    },
    SelfwaivedTerm: {
      type: DataTypes.STRING,
      allownull: true,
    },
    course_id: {
      type: DataTypes.BIGINT,
      references: {
        model: 'course',
        key: 'id',
      },
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
CourseModel.hasMany(Certification, { foreignKey: 'course_id' })
Certification.belongsTo(CourseModel, { foreignKey: 'course_id' })

export default Certification
