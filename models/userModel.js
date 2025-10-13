import pool from '../config/dbConfig.js';
import bcrypt from 'bcryptjs';
import logger from '../utils/logger.js'; // Importar el logger

const UserModel = {
  // Crear un nuevo usuario
  createUser: async (userData) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const { username, name, surname, branch, password, role } = userData;

      // Verificar si el nombre de usuario ya existe
      const [existingUser] = await connection.query(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      if (existingUser.length > 0) {
        connection.release(); // Liberar la conexión
        throw new Error('El nombre de usuario ya está en uso'); // Lanzar error si ya existe
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Generar hash de la contraseña

      // Consulta SQL para insertar el nuevo usuario
      const sql = `
        INSERT INTO users
        (username, name, surname, branch, password, role)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const values = [username, name, surname, branch, hashedPassword, role];

      const [result] = await connection.query(sql, values); // Ejecutar la consulta SQL

      connection.release(); // Liberar la conexión

      return result.insertId; // Devolver el ID del nuevo usuario creado
    } catch (error) {
      console.error('Error al crear un nuevo usuario:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener un usuario por ID
  getUserById: async (userId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM users WHERE id = ?`;
      const [rows] = await connection.query(sql, [userId]);

      connection.release(); // Liberar la conexión

      if (rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }

      return rows[0]; // Devolver el usuario encontrado
    } catch (error) {
      console.error('Error al obtener el usuario por ID:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Actualizar un usuario por ID
  updateUserById: async (userId, userData) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const { username, name, surname, branch, password, role } = userData;

      const updateFields = []; // Array para almacenar los campos a actualizar
      const values = []; // Array para almacenar los valores de los campos a actualizar

      // Construir dinámicamente la actualización de campos y valores
      if (name) {
        updateFields.push('name = ?');
        values.push(name);
      }
      if (surname) {
        updateFields.push('surname = ?');
        values.push(surname);
      }
      if (branch) {
        updateFields.push('branch = ?');
        values.push(branch);
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10); // Generar hash de la contraseña
        updateFields.push('password = ?');
        values.push(hashedPassword);
      }
      if (role) {
        updateFields.push('role = ?');
        values.push(role);
      }
      if (username) {
        // Verificar si el nombre de usuario ya existe y no pertenece al usuario actual
        const [existingUser] = await connection.query(
          'SELECT * FROM users WHERE username = ? AND id != ?',
          [username, userId]
        );
        if (existingUser.length > 0) {
          connection.release(); // Liberar la conexión
          throw new Error('El nombre de usuario ya está en uso'); // Lanzar error si ya existe
        }
        updateFields.push('username = ?');
        values.push(username);
      }

      // Verificar si hay campos para actualizar
      if (updateFields.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
      }

      // Construir la consulta SQL dinámica
      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      values.push(userId); // Añadir el userId al final del array de valores

      const [result] = await connection.query(sql, values); // Ejecutar la consulta SQL

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0; // Devolver true si se actualizó el usuario correctamente
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Eliminar un usuario por ID
  deleteUserById: async (userId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `DELETE FROM users WHERE id = ?`;
      const [result] = await connection.query(sql, [userId]);

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0; // Devolver true si se eliminó el usuario correctamente
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async () => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM users`;
      const [rows] = await connection.query(sql);

      connection.release(); // Liberar la conexión

      return rows; // Devolver todos los usuarios encontrados
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener un usuario por nombre de usuario
  getUserByUsername: async (username) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM users WHERE username = ?`;
      const [rows] = await connection.query(sql, [username]);

      connection.release(); // Liberar la conexión

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al obtener usuario por nombre de usuario:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Actualizar la última vez que el usuario inició sesión (last_login)
  updateLastLogin: async (userId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
      const [result] = await connection.query(sql, [userId]);

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar last_login:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },
};

export default UserModel;
