import sequelize from "../config/connect";
import { DataTypes } from "sequelize";

const OAuthTokenModel = sequelize.define(
  "oAuth_token",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  { sequelize, timestamps: false }
);

export default OAuthTokenModel;
