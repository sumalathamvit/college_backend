import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import UsersModel from "./users.modal";
import UsersDataModel from "./user_data.model";

const RequestModel = sequelize.define(
  "request",
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
    status: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["pending", "contracted", "notContracted"],
    },
    submission_date: {
      type: DataTypes.STRING,
    },
    instructorTrainingCount: {
      type: DataTypes.INTEGER,
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
    haveFunding: {
      type: DataTypes.STRING,
    },
    users_data_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "users_data",
        key: "id",
      },
      allowNull: true,
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    intrested_training: {
      type: DataTypes.ARRAY(DataTypes.STRING),
    },
    max_training: {
      type: DataTypes.INTEGER,
    },
    organization: {
      type: DataTypes.STRING,
    },
    first_name: {
      type: DataTypes.STRING,
    },
    last_name: {
      type: DataTypes.STRING,
    },
  },
  { sequelize, timestamps: false }
);
RequestModel.belongsTo(UsersDataModel, { foreignKey: "users_data_id" });

export default RequestModel;
