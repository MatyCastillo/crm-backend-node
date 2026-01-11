import { DataTypes } from "sequelize";
import sequelize from "../index.js";

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: DataTypes.STRING(100),
  email: { type: DataTypes.STRING(150), unique: true },
  password: DataTypes.STRING(255),
  role: DataTypes.STRING(50),
  lastConnection: DataTypes.DATE,
  createDate: DataTypes.DATE,
  updateDate: DataTypes.DATE
}, {
  tableName: "users",
  timestamps: false   // desactivamos createdAt / updatedAt de Sequelize
});


export default User;
