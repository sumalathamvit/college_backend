import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import UserRoleModel from "./user_role.model";

const UsersModel = sequelize.define(
  "user",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    expiration_time: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    role_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "user_role",
        key: "id",
      },
      // defaultValue: 1,
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: true,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_council_member: {
      type: DataTypes.STRING,
      defaultValue: "YES",
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_date: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    updated_date: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    isMHA: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isCRMVerify:{
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  { sequelize, timestamps: false }
);

UsersModel.belongsTo(UserRoleModel, { foreignKey: "role_id" });

export default UsersModel;
