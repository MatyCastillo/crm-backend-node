import pool from '../config/dbConfig.js';
// import logger from '../utils/logger.js';

// Crear una nueva receta
// Método para agregar una nueva prescripción a la base de datos
const createPrescription = async (patientId, fotoReceta, validityPeriod, medication,issueDate) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO prescriptions (patient_id, prescription_image, validity_days, medication, created_at,issue_date) 
       VALUES (?, ?, ?, ?, NOW(),?)`,
      [patientId, fotoReceta, validityPeriod, medication,issueDate]
    );
    return result;
  } catch (error) {
    throw new Error(`Error al agregar la prescripción a la base de datos ${error}`);
  }
};

// Función para agregar una nueva receta en la base de datos (esta funcion tomaba los dias y hacia los calculos con un JSON)
// const addPrescription = async (patientId, medication, validityDays, createdAt, prescriptionImage, withdrawalInfo) => {
//   const query = `
//     INSERT INTO prescriptions (patient_id, medication, validity_days, created_at, prescription_image, withdrawal_info)
//     VALUES (?, ?, ?, ?, ?, ?)
//   `;
//   const values = [patientId, medication, validityDays, createdAt, prescriptionImage, JSON.stringify(withdrawalInfo)];

//   try {
//     const [result] = await pool.query(query, values);
//     return result;  // Puedes devolver el resultado si es necesario
//   } catch (error) {
//     console.error('Error inserting prescription into database:', error);
//     throw error;  // Lanza el error para que el controlador lo maneje
//   }
// };

const addPrescription = async (patientId, medication, validityDays, createdAt, prescriptionImage, issueDate) => {
    const query = `
      INSERT INTO prescriptions (patient_id, medication, validity_days, created_at, prescription_image, issue_date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [patientId, medication, validityDays, createdAt, prescriptionImage, issueDate];
  
    try {
      const [result] = await pool.query(query, values);
      return result;  // Puedes devolver el resultado si es necesario
    } catch (error) {
      console.error('Error inserting prescription into database:', error);
      throw error;  // Lanza el error para que el controlador lo maneje
    }
  };
  

// Function to get prescriptions and patients with pending withdrawals (esta funcion recorrre el json para obtener los retiros proximos a vencer)
// const getUpcomingExpirations = async () => {
//   const today = new Date();
//   const notificationDays = 10;

//   // Calcular la fecha límite para notificar (10 días desde hoy)
//   const notificationWindow = new Date(today);
//   notificationWindow.setDate(today.getDate() + notificationDays);

//   // Consulta SQL para obtener recetas con withdrawal_info
//   const query = `
//     SELECT 
//      prescriptions.id AS prescription_id,
//       prescriptions.created_at AS prescriptions_created_at, 
//       patients.created_at AS patients_created_at, 
//       prescriptions.*, 
//       patients.* 
//     FROM prescriptions 
//     INNER JOIN patients 
//       ON prescriptions.patient_id = patients.id
//     WHERE prescriptions.withdrawal_info IS NOT NULL
//   `;

//   try {
//     // Ejecutar la consulta
//     const [rows] = await pool.query(query);

//     console.log('Prescriptions fetched from DB:', rows.length); // Mostrar cuántas recetas se obtuvieron de la BD

//     // Filtrar los retiros que están próximos a vencer (dentro de withdrawal_info)
//     const upcomingExpirations = rows.map(row => {
//       const withdrawalInfo = JSON.parse(row.withdrawal_info);  // Parse withdrawal_info from JSON
//       const withdrawals = withdrawalInfo.withdrawals || [];
      
//       // Encontrar la primera fecha de notificación que está próxima a vencer
//       const expiringWithdrawal = withdrawals.find(withdrawal => {
//         const notificationDate = new Date(withdrawal.notification_date);
//         console.log(`Comparing notification date ${notificationDate} with today ${today}`);
//         return !withdrawal.withdrawn && notificationDate <= notificationWindow;
//       });

//       // Si hay un retiro próximo a vencer, agregar la fecha de vencimiento
//       if (expiringWithdrawal) {
//         return {
//           ...row,  // Incluye todos los campos de la receta
//           withdrawal_number: expiringWithdrawal.withdrawal_number  // Agrega la nueva clave expiration_date
//         };
//       }

//       return null;  // Retorna null si no hay retiros próximos a vencer
//     }).filter(Boolean);  // Filtrar los nulls del array

//     console.log('Upcoming expirations:', upcomingExpirations.length);  // Verificar cuántas coincidencias se encuentran
//     return upcomingExpirations;  // Devuelve las recetas con retiros próximos a vencer
//   } catch (error) {
//     console.error('Error fetching upcoming expirations:', error);
//     throw new Error('Error fetching upcoming expirations');
//   }
// };

const getUpcomingExpirations = async () => {
  const today = new Date();
  const notificationDaysBeforeExpiration = 5;  // Notificar 5 días antes del vencimiento

  // Eliminar la parte de la hora en la fecha de hoy
  const todayWithoutTime = new Date(today.setHours(0, 0, 0, 0));

  // Consulta SQL para obtener recetas activas
  const query = `
    SELECT 
      prescriptions.id AS prescription_id,
      prescriptions.issue_date,
      prescriptions.active,
      prescriptions.*, 
      patients.* 
    FROM prescriptions 
    INNER JOIN patients 
      ON prescriptions.patient_id = patients.id
    WHERE prescriptions.active = 1
  `;

  try {
    // Ejecutar la consulta para obtener todas las recetas activas
    const [rows] = await pool.query(query);

    // Filtrar las recetas cuyo vencimiento es dentro de 5 días o menos
    const upcomingExpirations = rows.map(row => {
      const issueDate = new Date(row.issue_date);

      // Calcular la fecha de vencimiento (issue_date + 30 días)
      const expirationDate = new Date(issueDate);
      expirationDate.setDate(issueDate.getDate() + 30);

      // Calcular la fecha de notificación (5 días antes del vencimiento)
      const notificationDate = new Date(expirationDate);
      notificationDate.setDate(expirationDate.getDate() - notificationDaysBeforeExpiration);

      // Comparar si hoy está dentro de los 5 días antes del vencimiento o si ya pasó
      if (todayWithoutTime >= notificationDate && todayWithoutTime <= expirationDate) {
        return row;  // Retorna la receta si está próxima al vencimiento
      }

      return null;  // Retorna null si no hay receta próxima a notificación
    }).filter(Boolean);  // Filtrar los nulls del array

    return upcomingExpirations;  // Devuelve las recetas con retiros próximos a vencer
  } catch (error) {
    throw new Error(`Error fetching upcoming expirations ${error}`);
  }
};


// Método para obtener las recetas de un paciente por su ID
const getPrescriptionsByPatientId = async (patientId) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM prescriptions WHERE patient_id = ?',
      [patientId]
    );
    return rows; // Devuelve las recetas
  } catch (error) {
    console.error('Error al obtener las recetas del paciente:', error);
    throw error; // Lanza el error para manejarlo en el controlador
  }
};


const markAsNotificationSend = async (prescriptionId, withdrawalNumber, notified) => {
  try {
    const connection = await pool.getConnection();
    try {
      // Obtener la información de retiros (withdrawal_info) de la receta correspondiente
      const [rows] = await connection.query(
        'SELECT withdrawal_info FROM prescriptions WHERE id = ?',
        [prescriptionId]
      );

      if (rows.length === 0) {
        throw new Error('Receta no encontrada');
      }

      const withdrawalInfo = JSON.parse(rows[0].withdrawal_info);

      // Iterar sobre los retiros y actualizar el valor de 'notified' en el que coincida el withdrawalNumber
      const updatedWithdrawals = withdrawalInfo.withdrawals.map((withdrawal) => {
        if (withdrawal.withdrawal_number === withdrawalNumber) {
          return { ...withdrawal, notified }; // Actualiza solo 'notified' del retiro correspondiente
        }
        return withdrawal;
      });

      // Convertir la información de retiros actualizada en JSON
      const updatedWithdrawalInfo = JSON.stringify({ withdrawals: updatedWithdrawals });

      // Actualizar la información de retiros en la base de datos solo para esa receta
      await connection.query(
        'UPDATE prescriptions SET withdrawal_info = ? WHERE id = ?',
        [updatedWithdrawalInfo, prescriptionId]
      );
    } finally {
      connection.release(); // Liberar la conexión
    }
  } catch (error) {
    console.error('Error al marcar la notificación como enviada:', error);
    throw error;
  }
};

const markAsWithdrawn = async (prescriptionId) => {
  if (!prescriptionId || typeof prescriptionId !== 'number') {
    throw new Error('Invalid prescription ID');
  }

  try {
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE prescriptions SET withdrawn = 1 WHERE id = ?',
        [prescriptionId]
      );
      
      // Verificar si se afectó alguna fila
      if (result.affectedRows === 0) {
        throw new Error('No prescription found with the given ID');
      }

      console.log('Prescription marked as withdrawn successfully');
    } finally {
      connection.release(); // Liberar la conexión
    }
  } catch (error) {
    console.error('Error al marcar la receta como retirada:', error);
    throw error;
  }
};

// const markAsWithdrawn = async (prescriptionId, withdrawalNumber, withdrawn) => {
//   try {
//     const connection = await pool.getConnection();
//     try {
//       // Obtener la información de retiros (withdrawal_info) de la receta correspondiente
//       const [rows] = await connection.query(
//         'SELECT withdrawal_info FROM prescriptions WHERE id = ?',
//         [prescriptionId]
//       );

//       if (rows.length === 0) {
//         throw new Error('Receta no encontrada');
//       }

//       const withdrawalInfo = JSON.parse(rows[0].withdrawal_info);

//       // Obtener la fecha actual en formato ISO
//       const withdrawalDate = new Date().toISOString();

//       // Iterar sobre los retiros y actualizar el valor de 'withdrawal' y 'withdrawal_date'
//       const updatedWithdrawals = withdrawalInfo.withdrawals.map((withdrawalItem) => {
//         if (withdrawalItem.withdrawal_number === withdrawalNumber) {
//           return { 
//             ...withdrawalItem, 
//             withdrawn, // Actualiza el campo 'withdrawal' con el valor proporcionado
//             withdrawal_date: withdrawn ? withdrawalDate : null // Si es true, agrega la fecha, si no, la elimina
//           };
//         }
//         return withdrawalItem;
//       });

//       // Convertir la información de retiros actualizada en JSON
//       const updatedWithdrawalInfo = JSON.stringify({ withdrawals: updatedWithdrawals });

//       // Actualizar la información de retiros en la base de datos solo para esa receta
//       await connection.query(
//         'UPDATE prescriptions SET withdrawal_info = ? WHERE id = ?',
//         [updatedWithdrawalInfo, prescriptionId]
//       );
//     } finally {
//       connection.release(); // Liberar la conexión
//     }
//   } catch (error) {
//     console.error('Error al marcar el retiro como realizado:', error);
//     throw error;
//   }
// };

// const getEligiblePrescriptions = async (patientId) => {
//   try {
//     // Simplificar la consulta SQL para verificar los resultados básicos
//     const sql = `
//       SELECT 
//         id AS prescription_id, 
//         patient_id, 
//         medication, 
//         withdrawal_info
//       FROM prescriptions
//       WHERE patient_id = ?
//     `;

//     // Ejecutar la consulta con el patientId
//     const [results] = await pool.execute(sql, [patientId]);

//     // Si no hay resultados, retornar un array vacío
//     if (results.length === 0) {
//       return [];
//     }

//     // Procesar los resultados para obtener el retiro más cercano de cada receta
//     const eligiblePrescriptions = results.map(prescription => {
//       const withdrawalInfo = JSON.parse(prescription.withdrawal_info);

//       // Crear un array con los retiros válidos de la receta
//       const withdrawals = withdrawalInfo.withdrawals.map(w => ({
//         number: w.withdrawal_number,
//         date: w.expiration_date,
//         withdrawn: w.withdrawn,
//       }));

//       // Filtrar retiros válidos
//       const validWithdrawals = withdrawals.filter(w => 
//         w.date && !w.withdrawn && new Date(w.date) >= new Date() && new Date(w.date) <= new Date(new Date().setDate(new Date().getDate() + 30))
//       );
//       console.log('Valid withdrawals:', validWithdrawals);

//       if (validWithdrawals.length > 0) {
//         validWithdrawals.sort((a, b) => new Date(a.date) - new Date(b.date));
//         return {
//           ...prescription,
//           expiration: validWithdrawals[0].date,
//           withdrawal_number: validWithdrawals[0].number
//         };
//       }

//       return null;  // Retornar null si no hay retiros válidos
//     }).filter(Boolean);  // Filtrar los nulls del array

//     return eligiblePrescriptions;
//   } catch (error) {
//     console.error('Error al obtener las prescripciones elegibles:', error);
//     throw error;
//   }
// };

const getEligiblePrescriptions = async (patientId) => {
  try {
    // Consulta SQL para obtener recetas activas para un paciente específico
    const sql = `
      SELECT 
        *
      FROM prescriptions
      WHERE patient_id = ? AND active = 1 AND withdrawn = 0 
    `;

    // Ejecutar la consulta con el patientId
    const [results] = await pool.execute(sql, [patientId]);

    // Si no hay resultados, retornar un array vacío
    if (results.length === 0) {
      return [];
    }

    // Devolver los resultados (prescripciones activas)
    return results;
  } catch (error) {
    console.error('Error al obtener las prescripciones activas:', error);
    throw error;
  }
};


const registerWithdrawal = async (prescriptionId, medications, patientId, /* withdrawalNumber */) => {
  const query = `
    INSERT INTO prescription_withdrawals (prescription_id, medication, patient_id, withdrawal_date)
    VALUES (?, ?, ?, NOW())
  `;
  const values = [prescriptionId, medications, patientId];

  try {
    const [result] = await pool.query(query, values);
    return result;  // Puedes devolver el resultado si es necesario
  } catch (error) {
    console.error('Error inserting withdrawal into database:', error);
    throw error;  // Lanza el error para que el controlador lo maneje
  }
};

const getWithdrawalByPatientId = async (patientId) => {
  const query = `
    SELECT * FROM prescription_withdrawals
    WHERE patient_id = ?
  `;
  const values = [patientId];

  try {
    const [results] = await pool.query(query, values);
    return results;  // Puedes devolver los resultados si es necesario
  } catch (error) {
    console.error('Error retrieving withdrawals by patient ID:', error);
    throw error;  // Lanza el error para que el controlador lo maneje
  }
};

export default {
  createPrescription,
  addPrescription,
  getUpcomingExpirations,
  getPrescriptionsByPatientId,
  markAsNotificationSend,
  getEligiblePrescriptions,
  markAsWithdrawn,
  registerWithdrawal,
  getWithdrawalByPatientId
};
