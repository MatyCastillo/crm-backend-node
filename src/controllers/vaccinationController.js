import VaccinationModel from '../models/vaccinationModel.js';

// Crear una nueva vacunación
const createVaccination = async (req, res) => {
  try {
    const { patient_id, medication_applied } = req.body;
    const newVaccinationId = await VaccinationModel.createVaccination(patient_id, medication_applied);
    res.status(201).json({ id: newVaccinationId });
  } catch (error) {
    console.error('Error al crear la vacunación:', error);
    res.status(500).json({ error: 'Error al crear la vacunación' });
  }
};

// Obtener todas las vacunaciones
const getAllVaccinations = async (req, res) => {
  try {
    const vaccinations = await VaccinationModel.getAllVaccinations();
    res.status(200).json(vaccinations);
  } catch (error) {
    console.error('Error al obtener todas las vacunaciones:', error);
    res.status(500).json({ error: 'Error al obtener las vacunaciones' });
  }
};

// Obtener vacunaciones por ID de paciente
const getVaccinationsByPatientId = async (req, res) => {
  try {
    const { patient_id } = req.params;
    const vaccinations = await VaccinationModel.getVaccinationsByPatientId(patient_id);
    res.status(200).json(vaccinations);
  } catch (error) {
    console.error('Error al obtener las vacunaciones por ID de paciente:', error);
    res.status(500).json({ error: 'Error al obtener las vacunaciones' });
  }
};

// Eliminar una vacunación por ID
const deleteVaccinationById = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await VaccinationModel.deleteVaccinationById(id);
    if (success) {
      res.status(204).send(); // No content
    } else {
      res.status(404).json({ error: 'Vacunación no encontrada' });
    }
  } catch (error) {
    console.error('Error al eliminar la vacunación:', error);
    res.status(500).json({ error: 'Error al eliminar la vacunación' });
  }
};

export default {
  createVaccination,
  getAllVaccinations,
  getVaccinationsByPatientId,
  deleteVaccinationById
};
