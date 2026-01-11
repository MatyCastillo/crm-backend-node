import express from "express" 
import cors from "cors"

import  statusRoute from './routes/statusRoute.js';
import  userRoutes from './routes/userRoutes.js';
import  authRoutes from './routes/authRoutes.js';
import  patientsRoutes from './routes/patientsRoutes.js';
import  vaccinationRoutes from './routes/vaccinationRoutes.js'; 
import  prescriptionRoutes from './routes/prescriptionRoutes.js';
import { fileURLToPath } from "url";
import  path from 'path';
import sequelize, { testConnection } from './database/index.js';
import createMasterUser from './database/init.js';

import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CMR API",
      version: "1.0.0",
      description: "Documentación de la API con Swagger",
    },
  },
  apis: ["./routes/*.js"], 
});


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Middleware para parsear JSON
app.use(express.json());
app.use(cors());

app.use(express.json());

// Registrar la ruta de estado "alive" en la ruta específica
app.use('/api/v1', statusRoute);

// Rutas
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/patients', patientsRoutes);
app.use('/api/v1/vaccination',vaccinationRoutes)
app.use('/api/v1/prescriptions', prescriptionRoutes);

// Hacer accesible la carpeta 'uploads' (si es necesario)
app.use('/uploads', express.static('uploads'));

// Sirve el index.html para todas las rutas no especificadas después de las rutas de API (produccion)
app.get('/*', function(req, res) {
  res.sendFile(path.join(__dirname, '../index.html'), function(err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

(async () => {
  await testConnection();
  await sequelize.sync();
  //Usuario Master por defecto
  await createMasterUser();
  
  // Configurar rutas
  app.use('/users', userRoutes);
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  });
})();
