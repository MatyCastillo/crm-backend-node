import express from 'express';
import multer from 'multer';
import prescriptionController from '../controllers/prescriptionController.js';
import path from 'path';

const router = express.Router();

// Configurar Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
  },
  filename: (req, file, cb) => {
    const patientId = req.body.patientId; 
    const extension = path.extname(file.originalname); // Obtiene la extensión del archivo
    const uniqueFilename = `${patientId}-${Date.now()}${extension}`; // Nombre único basado en el ID del paciente y una marca de tiempo
    cb(null, uniqueFilename);
  }
});
const upload = multer({ storage });

// Ruta para subir la prescripción
router.post('/', upload.single('fotoReceta'), prescriptionController.addPrescription);
// Ruta para crear una receta
// router.post('/prescriptions', prescriptionController.createPrescription);

// Ruta para obtener recetas próximas a vencer
router.get('/upcoming-expirations', prescriptionController.getUpcomingExpirations);
router.get('/:patientId', prescriptionController.fetchPatientPrescriptions);

router.get('/elegible-prescriptions/:patientId', prescriptionController.getEligiblePrescriptions);

// Ruta para marcar la notificación como enviada
router.put('/', prescriptionController.updateNotificationStatus);

router.put('/mark-withdrawal', prescriptionController.markAsWithdrawn);

router.post('/withdrawal', prescriptionController.registerWithdrawal);
router.get('/withdrawal/:patientId', prescriptionController.getWithdrawalByPatientId);


export default router;
