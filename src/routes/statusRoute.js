import express from "express"
const router = express.Router();

// Ruta para verificar el estado "alive" del servidor
router.get('/status', (req, res) => {
  res.json({ message: 'El servidor está vivo!' });
});

export default router;
