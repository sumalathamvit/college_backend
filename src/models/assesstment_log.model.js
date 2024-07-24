import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import CourseModel from "./courses.model";
import UserModel from "./users.modal";

const AssessmentLogModel = sequelize.define(
  "assessment_log",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    // user_activity_status_log: {
    //   type: DataTypes.JSONB,
    // },
    is_profile_completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    user_activity_status: {
      type: DataTypes.ENUM,
      values: ["Started", "Score", "Profile", "Enrolled", "Store", "Error"],
      //  1. "Started" when the candidate starts the Assessment.
      //  2. "Score" when the candidate clicks to go from the Score page to the User Profile.
      //  3. "Profile" when the User Profile is saved
      //  4. "Enrolled" when the private path integrations successfully complete
      //  5. "Store" when the public path integrations successfully complete
      //  6. "Error" when the integrations fail
    },
    status: {
      type: DataTypes.ENUM,
      values: ["Submission", "Failed", "Accepted", "Rejected"],
    },

    course_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "course",
        key: "id",
      },
      allowNull: true,
      // onUpdate: "CASCADE",
      // onDelete: "CASCADE",
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "user",
        key: "id",
      },
      allowNull: true,
      // onUpdate: "CASCADE",
      // onDelete: "CASCADE",
    },
    start_time: {
      type: DataTypes.STRING,
    },
    end_time: {
      type: DataTypes.STRING,
    },
    reassessment_date: {
      type: DataTypes.STRING,
    },
    assessment_score: {
      type: DataTypes.INTEGER,
      // allowNull:false,
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

AssessmentLogModel.belongsTo(CourseModel, { foreignKey: "course_id" });
AssessmentLogModel.belongsTo(UserModel, { foreignKey: "user_id" });

export default AssessmentLogModel;
