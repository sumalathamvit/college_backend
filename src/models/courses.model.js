import sequelize from "../config/connect";
import { DataTypes } from "sequelize";

const CourseModel = sequelize.define(
  "course",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    Active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  { sequelize, timestamps: false }
);
export default CourseModel;
