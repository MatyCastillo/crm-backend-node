import pool from '../config/dbConfig.js';
import logger from '../utils/logger.js'; // Importar el logger

const PatientModel = {
  // Crear un nuevo paciente
  createPatient: async (patientData) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const {
        first_name,
        last_name,
        dni,
        phone_number,
        health_insurance,
        affiliate_number,
        branch,
        observations,
        created_by,
      } = patientData;

      // Verificar si el DNI ya existe
      const [existingPatient] = await connection.query(
        'SELECT * FROM patients WHERE dni = ?',
        [dni]
      );
      if (existingPatient.length > 0) {
        connection.release(); // Liberar la conexión
        throw new Error('El DNI ya está registrado para otro paciente'); // Lanzar error si ya existe
      }

      // Consulta SQL para insertar el nuevo paciente
      const sql = `
        INSERT INTO patients
        (first_name, last_name, dni, phone_number, health_insurance, affiliate_number, branch, observations, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const values = [
        first_name,
        last_name,
        dni,
        phone_number,
        health_insurance,
        affiliate_number,
        branch,
        observations,
        created_by,
      ];

      const [result] = await connection.query(sql, values); // Ejecutar la consulta SQL

      connection.release(); // Liberar la conexión

      return result.insertId; // Devolver el ID del nuevo paciente creado
    } catch (error) {
      console.error('Error al crear un nuevo paciente:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener un paciente por ID
  getPatientById: async (patientId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM patients WHERE id = ?`;
      const [rows] = await connection.query(sql, [patientId]);

      connection.release(); // Liberar la conexión

      if (rows.length === 0) {
        throw new Error('Paciente no encontrado');
      }

      return rows[0]; // Devolver el paciente encontrado
    } catch (error) {
      console.error('Error al obtener el paciente por ID:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

   // Obtener un paciente por ID con vacunaciones
  getPatientByIdWithVaccinations: async (patientId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos
  
      // Consulta para obtener el paciente y sus vacunaciones
      const sql = `
        SELECT 
          p.id AS patient_id, 
          p.first_name, 
          p.last_name, 
          p.dni, 
          p.phone_number, 
          p.health_insurance, 
          p.affiliate_number,
          p.branch, 
          p.created_by, 
          v.id AS vaccination_id, 
          v.medication_applied, 
          v.date_of_vaccination 
        FROM 
          patients p 
        LEFT JOIN 
          vaccinations v 
        ON 
          p.id = v.patient_id 
        WHERE 
          p.id = ?
      `;
  
      const [rows] = await connection.query(sql, [patientId]);
      connection.release(); // Liberar la conexión
  
      if (rows.length === 0) {
        throw new Error('Paciente no encontrado');
      }
  
      const patient = {
        id: rows[0].patient_id,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        dni: rows[0].dni,
        phone_number: rows[0].phone_number,
        health_insurance: rows[0].health_insurance,
        affiliate_number: rows[0].affiliate_number,
        branch: rows[0].branch,
        created_by: rows[0].created_by,
        vaccinations: rows
          .filter(row => row.vaccination_id)
          .map(row => ({
            id: row.vaccination_id,
            medication_applied: row.medication_applied,
            date_of_vaccination: row.date_of_vaccination
          }))
      };
  
      return patient; // Devolver el paciente con las vacunaciones incluidas
    } catch (error) {
      console.error('Error al obtener el paciente con vacunaciones:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error
    }
  },

  // Actualizar un paciente por ID
  updatePatientById: async (patientId, patientData) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const {
        first_name,
        last_name,
        phone_number,
        health_insurance,
        affiliate_number,
        branch,
        observations,
      } = patientData;

      const updateFields = []; // Array para almacenar los campos a actualizar
      const values = []; // Array para almacenar los valores de los campos a actualizar

      // Construir dinámicamente la actualización de campos y valores
      if (first_name) {
        updateFields.push('first_name = ?');
        values.push(first_name);
      }
      if (last_name) {
        updateFields.push('last_name = ?');
        values.push(last_name);
      }
      if (phone_number) {
        updateFields.push('phone_number = ?');
        values.push(phone_number);
      }
      if (health_insurance) {
        updateFields.push('health_insurance = ?');
        values.push(health_insurance);
      }
      if (affiliate_number) {
        updateFields.push('affiliate_number = ?');
        values.push(affiliate_number);
      }
      if (branch) {
        updateFields.push('branch = ?');
        values.push(branch);
      }
      if (observations) {
        updateFields.push('observations = ?');
        values.push(observations);
      }

      // Verificar si hay campos para actualizar
      if (updateFields.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
      }

      // Construir la consulta SQL dinámica
      const sql = `UPDATE patients SET ${updateFields.join(', ')} WHERE id = ?`;
      values.push(patientId); // Añadir el patientId al final del array de valores

      const [result] = await connection.query(sql, values); // Ejecutar la consulta SQL

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0; // Devolver true si se actualizó el paciente correctamente
    } catch (error) {
      console.error('Error al actualizar el paciente:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Eliminar un paciente por ID
  deletePatientById: async (patientId) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `UPDATE patients SET is_deleted = true WHERE id = ?`;
      const [result] = await connection.query(sql, [patientId]);

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0; // Devolver true si se eliminó el paciente correctamente
    } catch (error) {
      console.error('Error al eliminar el paciente:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener todos los pacientes
  getAllPatients: async () => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM patients WHERE is_deleted = false`;
      const [rows] = await connection.query(sql);

      connection.release(); // Liberar la conexión

      return rows; // Devolver todos los pacientes encontrados
    } catch (error) {
      console.error('Error al obtener todos los pacientes:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener un paciente por DNI
  getPatientByDNI: async (dni) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `SELECT * FROM patients WHERE dni = ?`;
      const [rows] = await connection.query(sql, [dni]);

      connection.release(); // Liberar la conexión

      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error al obtener el paciente por DNI:', error);
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },

  // Obtener un paciente por DNI, incluyendo las vacunaciones
getPatientByDNIWithVaccinations: async (dni) => {
  try {
    const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

    // Consulta para obtener el paciente y sus vacunaciones
    const sql = `
      SELECT 
        p.id AS patient_id, 
        p.first_name, 
        p.last_name, 
        p.dni, 
        p.phone_number, 
        p.health_insurance, 
        p.affiliate_number,
        p.branch, 
        p.created_by,
        p.created_at, 
        p.observations,
        v.id AS vaccination_id, 
        v.medication_applied, 
        v.date_of_vaccination 
      FROM 
        patients p 
      LEFT JOIN 
        vaccinations v 
      ON 
        p.id = v.patient_id 
      WHERE 
        p.dni = ?
    `;

    const [rows] = await connection.query(sql, [dni]);
    connection.release(); // Liberar la conexión

    if (rows.length === 0) {
      return null; // Devolver null si no se encuentra el paciente
    }

    // Construir el objeto paciente con las vacunaciones incluidas
    const patient = {
      id: rows[0].patient_id,
      first_name: rows[0].first_name,
      last_name: rows[0].last_name,
      dni: rows[0].dni,
      phone_number: rows[0].phone_number,
      health_insurance: rows[0].health_insurance,
      affiliate_number: rows[0].affiliate_number,
      branch: rows[0].branch,
      created_by: rows[0].created_by,
      created_at: rows[0].created_at,
      observations: rows[0].observations, 
      vaccinations: rows
        .filter(row => row.vaccination_id) // Filtrar las filas donde hay vacunaciones
        .map(row => ({
          id: row.vaccination_id,
          medication_applied: row.medication_applied,
          date_of_vaccination: row.date_of_vaccination
        }))
    };

    return patient; // Devolver el paciente con las vacunaciones incluidas
  } catch (error) {
    console.error('Error al obtener el paciente por DNI:', error);
    throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
  }
},

  // Actualizar observaciones de un paciente por ID
  updateObservations: async (patientId, observations) => {
    try {
      const connection = await pool.getConnection(); // Obtener la conexión a la base de datos

      const sql = `UPDATE patients SET observations = ? WHERE id = ?`;
      const [result] = await connection.query(sql, [observations, patientId]);

      connection.release(); // Liberar la conexión

      return result.affectedRows > 0; // Devolver true si se actualizaron las observaciones correctamente
    } catch (error) {
      console.error('Error al actualizar las observaciones del paciente:', error);
      logger(error); // Registrar el error
      throw error; // Relanzar el error para manejarlo en otro lugar si es necesario
    }
  },
};

export default PatientModel;
