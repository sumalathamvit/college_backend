import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import UsersModel from "./users.modal";

const UserLogModel = sequelize.define(
  "user_logs",
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
        model: "user",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false,
    },
    log_type: {
      type: DataTypes.STRING,
    },
    log_module: {
      type: DataTypes.STRING,
    },
    log_description: {
      type: DataTypes.STRING,
    },
    timestamp: {
      type: DataTypes.DATE,
    },
  },
  { sequelize, timestamps: false }
);

UserLogModel.belongsTo(UsersModel, { foreignKey: "user_id" });

export default UserLogModel;
