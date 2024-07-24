import Sequelize from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
  username: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
    },
  },
  pool: {
    max: 20,
    min: 0,
    idle: 10000,
  },
  logging: false,
  define: {
    freezeTableName: true,
  },
});

export default sequelize;
