import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import CourseModel from "./courses.model";

const QuestionModel = sequelize.define(
  "question",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM,
      allowNull: false,
      defaultValue: "radio",
      values: ["radio", "checkbox"],
    },
    question_points:{
      type:DataTypes.INTEGER,
      // allowNull: false,
      default:1
    },
    course_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "course",
        key: "id",
      },
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
    options: {
      type: DataTypes.JSONB, // Use ARRAY to store an array of JSON objects
      allowNull: true,
    },
  },
  { sequelize, timestamps: false }
);

QuestionModel.belongsTo(CourseModel, { foreignKey: "course_id" });

export default QuestionModel;
