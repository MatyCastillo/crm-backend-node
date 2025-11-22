// prescriptionController.js
import PrescriptionModel from '../models/prescriptionModel.js';
import logger from '../utils/logger.js';
// import calculateExpirationDates from '../utils/calculateExpirationDates.js';

// Método para agregar una nueva prescripción
const addPrescription = async (req, res) => {

  try {
      const { patientId, validityPeriod, medication , issueDate} = req.body;
      const fotoReceta = req.file ? req.file.path : null;
    // Llamar al modelo para agregar la receta en la base de datos
    const result = await PrescriptionModel.createPrescription(patientId, fotoReceta, validityPeriod, medication, issueDate);

    // Enviar respuesta exitosa con los detalles
    res.status(201).json({
      message: 'Receta agregada con éxito',
      prescriptionId: result.insertId,
    });
  } catch (err) {
    logger(`Error al agregar la prescripción:, ${err}`);
    res.status(500).json({ message: 'Error al agregar la prescripción', error: err });
  }
};

// prescriptionController.js

// Controller to add a new prescription (metodo con el calculo de dias en un JSON)
// const addPrescription = async (req, res) => {
//   const { patientId, medication, validityDays } = req.body;
//   const prescriptionImage = req.file ? req.file.path : null;
//   const createdAt = new Date();

//   // Calculate notification dates and withdrawals
//   const withdrawalInfo = {
//     withdrawals: []
//   };

//   const periods = validityDays / 30; // Calculate the number of withdrawals (1, 2, or 3)
//   console.log("cant retiros ",periods , "dias de validez: ", validityDays)
//   for (let i = 0; i < periods; i++) {
//     const withdrawalNumber = i + 1;
//     const notificationDate = new Date(createdAt);
//     const expirationDate = new Date(createdAt);
//     notificationDate.setDate(notificationDate.getDate() + (30 * withdrawalNumber) - 10); // 10 days before each period
//     expirationDate.setDate(expirationDate.getDate() + (30 * withdrawalNumber));

//     withdrawalInfo.withdrawals.push({
//       withdrawal_number: withdrawalNumber,
//       notification_date: notificationDate,
//       withdrawal_date: null,
//       notified: false,
//       withdrawal: false,
//       expiration_date: expirationDate
//     });
//   }
//   console.log("withdrawals",withdrawalInfo)
//   try {
//     // Call the model to insert the prescription into the database
//     await PrescriptionModel.addPrescription(patientId, medication, validityDays, createdAt, prescriptionImage, withdrawalInfo);
//     res.status(201).send('Prescription created successfully');
//   } catch (error) {
//     console.error('Error creating prescription:', error);
//     res.status(500).send('Error creating prescription');
//   }
// };


// const getUpcomingExpirations = async (req, res) => {
//     try {
//       const expirations = await PrescriptionModel.getUpcomingExpirations();
//       res.json(expirations); // Devuelve las recetas próximas a vencer como JSON
//     } catch (err) {
//       console.error('Error al obtener recetas próximas a vencer:', err);
//       logger(`'Error al obtener recetas próximas a vencer -:, ${err}`);
//       res.status(500).json({ message: 'Error al obtener recetas próximas a vencer', error: err });
//     }
//   };

const getUpcomingExpirations = async (req, res) => {
  try {
    // Fetch the upcoming expirations from the model
    const upcomingExpirations = await PrescriptionModel.getUpcomingExpirations();
    
    // Send the results to the client
    res.status(200).json(upcomingExpirations);
  } catch (error) {
    console.error('Error fetching expiring prescriptions:', error);
    res.status(500).send('Error fetching expiring prescriptions');
  }
};

// Controlador para manejar la obtención de recetas de un paciente por su ID
const fetchPatientPrescriptions = async (req, res) => {
    const { patientId } = req.params;
  
    try {
      const prescriptions = await PrescriptionModel.getPrescriptionsByPatientId(patientId);
      res.json(prescriptions); // Devuelve las recetas como JSON
    } catch (error) {
      console.error('Error al obtener las recetas del paciente:', error);
      res.status(500).json({ message: 'Error al obtener las recetas del paciente' });
    }
  };
  
  const updateNotificationStatus = async (req, res) => {
    const { prescriptionId, withdrawalNumber, notified } = req.body;
  
    try {
      await PrescriptionModel.markAsNotificationSend(prescriptionId, withdrawalNumber, notified);
      res.status(200).json({ message: 'Notificación actualizada correctamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  // Controlador para manejar la obtención de recetas de un paciente por su ID
const getEligiblePrescriptions = async (req, res) => {
  const { patientId } = req.params;

  try {
    const prescriptions = await PrescriptionModel.getEligiblePrescriptions(patientId);
    res.json(prescriptions); // Devuelve las recetas como JSON
  } catch (error) {
    console.error('Error al obtener las recetas del paciente:', error);
    res.status(500).json({ message: 'Error al obtener las recetas del paciente' });
  }
};

const markAsWithdrawn = async (req, res) => {
  const { prescriptionId, withdrawalNumber } = req.body;

  try {
    await PrescriptionModel.markAsWithdrawn(prescriptionId, withdrawalNumber);
    res.status(200).json({ message: 'Retiro actualizado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const registerWithdrawal = async (req, res) => {
  const { prescriptionId, medications, patientId,withdrawalNumber } = req.body;
  try {
    await PrescriptionModel.registerWithdrawal(prescriptionId, medications, patientId,withdrawalNumber);
    res.status(200).json({ message: 'Retiro registrado correctamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

const getWithdrawalByPatientId = async (req, res) => {
    const {patientId} = req.params;
    try {
    const withdrawalByPatientId = await PrescriptionModel.getWithdrawalByPatientId(patientId);
    
    res.status(200).json(withdrawalByPatientId);
  } catch (err) {
    res.status(500).send({message:'Error al obtener retiros por id',error: err});
  }
}

export default {
  addPrescription,
  getUpcomingExpirations,
  fetchPatientPrescriptions,
  updateNotificationStatus,
  getEligiblePrescriptions,
  markAsWithdrawn,
  registerWithdrawal,
  getWithdrawalByPatientId
};
