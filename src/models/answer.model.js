import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import CourseModel from "./courses.model";
import QuestionModel from "./questions.model";

const AnswerModel = sequelize.define(
  "answer",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },

    course_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "course",
        key: "id",
      },
      allowNull: true,
    },

    question_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "question",
        key: "id",
      },
      allowNull: true,
    },
    answer: {
      allowNull: false,
      type: DataTypes.JSONB,
    },
    created_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE,
      defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  { sequelize, timestamps: false }
);



export default AnswerModel;
