// import express from 'express';
import app from './app.js';
import userRoutes from './routes/userRoutes.js';
import process from "process"

// Configurar las rutas
app.use('/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
