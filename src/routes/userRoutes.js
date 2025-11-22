import express from 'express';
import userController from '../controllers/userController.js';
import UserModel from '../models/userModel.js';

const router = express.Router();

// Ruta para crear un nuevo usuario
router.post('/', userController.createUser);

// Ruta para obtener un usuario por ID
router.get('/users/:id', userController.getUserById);

// Ruta para actualizar un usuario por ID
router.put('/:id', userController.updateUserById);

// Ruta para eliminar un usuario por ID
router.delete('/users/:id', userController.deleteUserById);

// Ruta para obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Ruta para obtener un usuario por nombre de usuario (opcional)
router.get('/users/username/:username', userController.getUserByUsername);

// Ruta para actualizar la última vez que el usuario inició sesión
router.patch('/users/:id/last-login', userController.updateLastLogin);

router.get('/check-username', async (req, res) => {
    const { username } = req.query;
  
    try {
      const user = await UserModel.getUserByUsername(username);
      res.json({ isUnique: !user });
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar el nombre de usuario', error: error });
    }
  });

export default router;
