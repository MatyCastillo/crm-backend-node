import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';
import process from "process"

const authController = {
  // Controlador para el inicio de sesión
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // Buscar al usuario por nombre de usuario
      const user = await UserModel.getUserByUsername(username);
      
      // Verificar si el usuario existe
      if (!user) {
        return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
      }

      // Verificar la contraseña utilizando bcrypt
      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return res.status(401).json({ message: 'Nombre de usuario o contraseña incorrectos' });
      }

      // Actualizar la última vez que el usuario inició sesión (last_login)
      await UserModel.updateLastLogin(user.id);

      // Generar un token JWT
      const token = jwt.sign(
        { username: user.username },
        process.env.JWT_SECRET, // Utilizar la clave secreta de las variables de entorno
        { expiresIn: '12h' } // Tiempo de expiración del token
      );

      // Devolver el token en la respuesta
      res.status(200).json({
        message: 'Inicio de sesión exitoso',
        token: token,
        user: {
          id: user.id,
          username: user.name,
          userType: user.role,
          branch: user.branch,
          user: user.username
        }
      });
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      return res.status(500).json({ message: 'Error en el servidor' });
    }
  }
};

export default authController;
