import sequelize from "../config/connect";
import { DataTypes } from "sequelize";
import UsersModel from "./users.modal";

const UsersDataModel = sequelize.define(
  "users_data",
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mhfa_connect: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressline1: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    addressline2: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.BIGINT,
      references: {
        model: "user",
        key: "id",

      },
      unique: true,
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    mfa_options: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_part_of_organization: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    organization: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    job_title: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    get_news_letter: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    public_profile: {
      type: DataTypes.BOOLEAN,
      default:true,
      allowNull: true,
    },
    dietary_restrictions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    describe_dietary_restrictions: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    created_date: {
      allowNull: true,
      type: DataTypes.DATE,
    },
    updated_date: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  },
  { sequelize, timestamps: false }
);


UsersDataModel.belongsTo(UsersModel, { foreignKey: "user_id" });

export default UsersDataModel;
