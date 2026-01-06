import dotenv from "dotenv";
import process from "process";
dotenv.config();

export default {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: "mysql",
  logging: process.env.SEQUELIZE_LOGGING === "true"
};
