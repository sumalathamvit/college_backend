import sequelize from "../config/connect";
import { DataTypes } from "sequelize";

const UserRoleModel = sequelize.define(
  "user_role",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
    },
  },
  { sequelize, timestamps: false }
);

export default UserRoleModel;
