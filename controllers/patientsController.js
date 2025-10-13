import PatientModel from '../models/patientsModel.js';
import logger from '../utils/logger.js'; // Importar el logger

const PatientController = {
  createPatient: async (req, res) => {
    try {
      const patientData = req.body; // Obtener los datos del paciente del cuerpo de la solicitud
      const patientId = await PatientModel.createPatient(patientData); // Crear el paciente
      res.status(201).json({ id: patientId }); // Devolver la respuesta con el ID del nuevo paciente
    } catch (error) {
      console.error('Error al crear el paciente:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  getPatientById: async (req, res) => {
    try {
      const patientId = req.params.id; // Obtener el ID del paciente de los parámetros
      const patient = await PatientModel.getPatientById(patientId); // Obtener el paciente
      res.status(200).json(patient); // Devolver la respuesta con el paciente
    } catch (error) {
      console.error('Error al obtener el paciente:', error);
      logger(error); // Registrar el error
      res.status(404).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  updatePatientById: async (req, res) => {
    try {
      const patientId = req.params.id; // Obtener el ID del paciente de los parámetros
      const patientData = req.body; // Obtener los datos del paciente del cuerpo de la solicitud
      const success = await PatientModel.updatePatientById(patientId, patientData); // Actualizar el paciente
      if (success) {
        res.status(200).json({ message: 'Paciente actualizado correctamente' }); // Devolver mensaje de éxito
      } else {
        res.status(404).json({ message: 'Paciente no encontrado' }); // Devolver mensaje de paciente no encontrado
      }
    } catch (error) {
      console.error('Error al actualizar el paciente:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  deletePatientById: async (req, res) => {
    try {
      const patientId = req.params.id; // Obtener el ID del paciente de los parámetros
      const success = await PatientModel.deletePatientById(patientId); // Eliminar el paciente
      if (success) {
        res.status(200).json({ message: 'Paciente eliminado correctamente' }); // Devolver mensaje de éxito
      } else {
        res.status(404).json({ message: 'Paciente no encontrado' }); // Devolver mensaje de paciente no encontrado
      }
    } catch (error) {
      console.error('Error al eliminar el paciente:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  getAllPatients: async (req, res) => {
    try {
      const patients = await PatientModel.getAllPatients(); // Obtener todos los pacientes
      res.status(200).json(patients); // Devolver la respuesta con todos los pacientes
    } catch (error) {
      console.error('Error al obtener todos los pacientes:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  },

  getPatientByDNI: async (req, res) => {
    try {
      const dni = req.params.dni; // Obtener el DNI del paciente de los parámetros
      const patient = await PatientModel.getPatientByDNIWithVaccinations(dni); // Obtener el paciente por DNI con vacunaciones
      if (patient) {
        res.status(200).json({patient : patient, isUnique:false}); // Devolver la respuesta con el paciente
      } else {
        res.status(204).json({ message: 'Paciente no encontrado', isUnique:true }); // Devolver mensaje de paciente no encontrado
      }
    } catch (error) {
      console.error('Error al obtener paciente por DNI:', error);
      logger(error); // Registrar el error
      res.status(400).json({ message: error.message }); // Devolver un mensaje de error
    }
  }
};

export default PatientController;
