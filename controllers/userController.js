import UserModel from '../models/userModel.js';
import logger from '../utils/logger.js'; // Importar el logger

const UserController = {
  createUser: async (req, res) => {
    try {
      const userData = req.body; // Obtener los datos del usuario del cuerpo de la solicitud
      const userId = await UserModel.createUser(userData); // Crear el usuario
      res.status(201).json({ id: userId }); // Devolver la respuesta con el ID del nuevo usuario
    } catch (error) {
      console.error('Error al crear el usuario:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message, error:error }); // Devolver un mensaje de error
    }
  },

  getUserById: async (req, res) => {
    try {
      const userId = req.params.id; // Obtener el ID del usuario de los parámetros
      const user = await UserModel.getUserById(userId); // Obtener el usuario
      res.status(200).json(user); // Devolver la respuesta con el usuario
    } catch (error) {
      console.error('Error al obtener el usuario:', error);
      logger(error); // Registrar el error
      res.status(404).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  updateUserById: async (req, res) => {
    try {
      const userId = req.params.id; // Obtener el ID del usuario de los parámetros
      const userData = req.body; // Obtener los datos del usuario del cuerpo de la solicitud
      const success = await UserModel.updateUserById(userId, userData); // Actualizar el usuario
      if (success) {
        res.status(200).json({ message: 'Usuario actualizado correctamente' }); // Devolver mensaje de éxito
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' }); // Devolver mensaje de usuario no encontrado
      }
    } catch (error) {
      console.error('Error al actualizar el usuario:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  deleteUserById: async (req, res) => {
    try {
      const userId = req.params.id; // Obtener el ID del usuario de los parámetros
      const success = await UserModel.deleteUserById(userId); // Eliminar el usuario
      if (success) {
        res.status(200).json({ message: 'Usuario eliminado correctamente' }); // Devolver mensaje de éxito
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' }); // Devolver mensaje de usuario no encontrado
      }
    } catch (error) {
      console.error('Error al eliminar el usuario:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAllUsers(); // Obtener todos los usuarios
      res.status(200).json(users); // Devolver la respuesta con todos los usuarios
    } catch (error) {
      console.error('Error al obtener todos los usuarios:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  getUserByUsername: async (req, res) => {
    try {
      const username = req.params.username; // Obtener el nombre de usuario de los parámetros
      const user = await UserModel.getUserByUsername(username); // Obtener el usuario por nombre de usuario
      if (user) {
        res.status(200).json(user); // Devolver la respuesta con el usuario
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' }); // Devolver mensaje de usuario no encontrado
      }
    } catch (error) {
      console.error('Error al obtener usuario por nombre de usuario:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  updateLastLogin: async (req, res) => {
    try {
      const userId = req.params.id; // Obtener el ID del usuario de los parámetros
      const success = await UserModel.updateLastLogin(userId); // Actualizar la última vez que el usuario inició sesión
      if (success) {
        res.status(200).json({ message: 'Último inicio de sesión actualizado correctamente' }); // Devolver mensaje de éxito
      } else {
        res.status(404).json({ message: 'Usuario no encontrado' }); // Devolver mensaje de usuario no encontrado
      }
    } catch (error) {
      console.error('Error al actualizar last_login:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },
};

export default UserController;
