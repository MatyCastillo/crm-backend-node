import  pool from '../config/dbConfig.js';
import  logger from '../utils/logger.js'; // Importar el logger

const VaccinationModel = {
  // Crear una nueva vacunación
  createVaccination: async (patientId, medication) => {

    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `
        INSERT INTO vaccinations (patient_id, medication_applied)
        VALUES (?, ?)
      `;
      const values = [patientId, medication];

      const [result] = await connection.query(sql, values); // Ejecutar la consulta SQL

      connection.release(); // Liberar la conexión

      return result.insertId; // Devolver el ID de la nueva vacunación creada
    } catch (error) {
      console.error('Error al crear una nueva vacunación:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener todas las vacunaciones
  getAllVaccinations: async () => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT v.id, v.medication_applied, v.date_of_vaccination, p.first_name, p.last_name, p.dni
      FROM vaccinations v
      JOIN patients p ON v.patient_id = p.id`;
      const [rows] = await connection.query(sql);

      connection.release(); // Liberar la conexión

      return rows.reverse(); // Devolver todas las vacunaciones encontradas
    } catch (error) {
      console.error('Error al obtener todas las vacunaciones:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener vacunaciones por ID de paciente
  getVaccinationsByPatientId: async (patientId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM vaccinations WHERE patient_id = ?`;
      const [rows] = await connection.query(sql, [patientId]);

      connection.release(); // Liberar la conexión

      return rows; // Devolver las vacunaciones encontradas para el paciente
    } catch (error) {
      console.error('Error al obtener las vacunaciones por ID de paciente:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Eliminar una vacunación por ID
  deleteVaccinationById: async (id) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `DELETE FROM vaccinations WHERE id = ?`;
      const [result] = await connection.query(sql, [id]);

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0; // Devolver true si se eliminó la vacunación correctamente
    } catch (error) {
      console.error('Error al eliminar la vacunación:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },
};

export default VaccinationModel;
