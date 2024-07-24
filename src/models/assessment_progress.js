import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import CourseModel from "./courses.model";
import UserModel from "./users.modal";

const AssessmentProgress = sequelize.define(
  "assessment_progress",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    isCompleted: {
      type: DataTypes.BOOLEAN,
      default: false,
    },
    course_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "course",
        key: "id",
      },
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    questionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "user",
        key: "id",
      },
    },
    answers: {
      type: DataTypes.JSONB,
    },
    start_time:{
      type: DataTypes.STRING,
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

AssessmentProgress.belongsTo(CourseModel, { foreignKey: "course_id" });
AssessmentProgress.belongsTo(UserModel, { foreignKey: "user_id" });

export default AssessmentProgress;
