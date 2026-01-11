import UserModel from "../models/userModel.js";
// import db from "../database/models/index.js";

const UserController = {
  
  getUsers: async (req, res) => {
    const data = await UserModel.getAllUsers();
    res.json(data);
  },

  createUser: async (req, res) => {
    try {
      const userData = req.body;
      const userId = await UserModel.createUser(userData);
      res.status(201).json({ id: userId }); 
    } catch (error) {
      res.status(400).json({ message: error.message, error: error });
    }
  },

  getUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await UserModel.getUserById(userId); 
      res.status(200).json(user);
    } catch (error) {
      res.status(404).json({ message: error.message }); 
    }
  },

  updateUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const userData = req.body; 
      const success = await UserModel.updateUserById(userId, userData); 
      if (success) {
        res.status(200).json({ message: "Usuario actualizado correctamente" });
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al actualizar el usuario:", error);
      res.status(400).json({ message: error.message });
    }
  },

  deleteUserById: async (req, res) => {
    try {
      const userId = req.params.id;
      const success = await UserModel.deleteUserById(userId);
      if (success) {
        res.status(200).json({ message: "Usuario eliminado correctamente" });
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
      res.status(400).json({ message: error.message });
    }
  },

  getAllUsers: async (req, res) => {
    try {
      const users = await UserModel.getAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error al obtener todos los usuarios:", error);
      res.status(400).json({ message: error.message });
    }
  },

  getUserByUsername: async (req, res) => {
    try {
      const username = req.params.username;
      const user = await UserModel.getUserByUsername(username);
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ message: "Usuario no encontrado" });
      }
    } catch (error) {
      console.error("Error al obtener usuario por nombre de usuario:", error);
      res.status(400).json({ message: error.message });
    }
  },

  updateLastLogin: async (req, res) => {
    try {
      const userId = req.params.id; // Obtener el ID del usuario de los parámetros
      const success = await UserModel.updateLastLogin(userId); // Actualizar la última vez que el usuario inició sesión
      if (success) {
        res
          .status(200)
          .json({
            message: "Último inicio de sesión actualizado correctamente",
          }); // Devolver mensaje de éxito
      } else {
        res.status(404).json({ message: "Usuario no encontrado" }); // Devolver mensaje de usuario no encontrado
      }
    } catch (error) {
      console.error("Error al actualizar last_login:", error);
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },
};

export default UserController;
