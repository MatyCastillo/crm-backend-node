import express from 'express';
import userController from '../controllers/userController.js';
import UserModel from '../models/userModel.js';

const router = express.Router();

router.get("/",userController.getUsers)

router.post('/', userController.createUser);

router.get('/:id', userController.getUserById);

router.put('/:id', userController.updateUserById);

router.delete('/:id', userController.deleteUserById);

router.get('/', userController.getAllUsers);

router.get('/users/username/:username', userController.getUserByUsername);

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
