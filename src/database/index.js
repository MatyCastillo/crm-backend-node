import { Sequelize } from "sequelize";
import config from "./config.js";

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: "mysql",
    logging: config.logging
  }
);

// Probá conexión
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to MySQL with Sequelize");
  } catch (err) {
    console.error("Unable to connect:", err);
  }
};

export default sequelize;
