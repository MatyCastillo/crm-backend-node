import express from 'express';
import authController from '../controllers/authController.js';
const router = express.Router();

// Ruta para el inicio de sesión
router.post('/login', authController.login);

export default router