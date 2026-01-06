import bcrypt from "bcryptjs";
import logger from "../utils/logger.js"; // Importar el logger
import db from "../database/models/index.js";
import { Op } from "sequelize";

const UserModel = {
  getAllUsers: async () => {
    try {
      const users = await db.User.findAll();
      return users;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  createUser: async (userData) => {
    try {
      const { name, email, password } = userData;

      const existingUser = await db.User.findOne({ where: { email } });
      if (existingUser) {
        throw new Error("El email ya está en uso");
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await db.User.create({
        name,
        email,
        password: hashedPassword,
      });
      return newUser.id;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  getUserById: async (userId) => {
    try {
      const user = await db.User.findOne({ where: { id: userId } });

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      return user;
    } catch (error) {
      logger(error);
      throw error;
    }
  },

  updateUserById: async (userId, userData) => {
    try {
      const { name, email, password } = userData;
      const user = await db.User.findOne({ where: { id: userId } });
      let hashedPassword;

      if (!user) {
        throw new Error("Usuario no encontrado");
      }

      const existingUser = await db.User.findOne({
        where: { email, id: { [Op.ne]: userId } },
      });
      if (existingUser) {
        throw new Error("El email ya está en uso por otro usuario");
      }

      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
      }

      const [affectedRows] = await db.User.update(
        {
          name,
          email,
          password: hashedPassword,
        },
        {
          where: { id: userId },
        }
      );

      return affectedRows > 0 ? userId : null;
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      logger(error);
      throw error;
    }
  },

  deleteUserById: async (userId) => {
    try {
      const deletedRows = await db.User.destroy({
        where: { id: userId },
      });

      return deletedRows > 0;
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      logger(error);
      throw error;
    }
  },

  // Actualizar la última vez que el usuario inició sesión (last_login)
  // updateLastLogin: async (userId) => {
  //   try {
  //     const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

  //     const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
  //     const [result] = await connection.query(sql, [userId]);

  //     connection.release(); // Liberar la conexión

  //     return result.affectedRows > 0;
  //   } catch (error) {
  //     console.error("Error al actualizar last_login:", error);
  //     logger(error); // Registrar el error
  //     throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
  //   }
  // },
};

export default UserModel;
