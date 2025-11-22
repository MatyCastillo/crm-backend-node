import pool from '../config/dbConfig.js';
import moment from 'moment-timezone';
import logger from '../utils/logger.js'; // Asegúrate de que la ruta al archivo de logger sea correcta

const createPayment = async (method, amount, date, branchId, user) => {
   // Determinar el turno basado en la hora del pago
   try {
   const dateHour = new Date(date)   
   const shift = dateHour.getUTCHours() < 15 ? 'morning' : 'afternoon';
 
   const query = 'INSERT INTO payments (method, amount, date, branch_id, user, shift) VALUES (?, ?, ?, ?, ?, ?)';
   const values = [method, amount, date, branchId, user, shift];
 
     const [results] = await pool.query(query, values);
     return results;
   } catch (err) {
     logger.error(`Error creating payment: method=${method}, amount=${amount}, date=${date}, branchId=${branchId}, user=${user}- ${err.message}`);
     throw new Error('Error creating payment. Please try again later.');
   }
};

const getPaymentsByDate = async (date, branch) => {
  try {
    // Obtener la hora actual en la zona horaria de Argentina
    const hour = moment.tz(new Date(), 'America/Argentina/Buenos_Aires').hour();

    // Construir la consulta SQL considerando el turno
    const query = `
      SELECT * FROM payments 
      WHERE DATE(date) = ? 
      AND deleted = 0 
      AND branch_id = ?
      AND (shift != 'morning' OR ? <= 15)
    `;

    const [rows] = await pool.query(query, [date, branch, hour]);
    return rows;
  } catch (err) {
    logger.error(`Error fetching payments for date: ${date}, branch: ${branch} - ${err.message}`);
    throw new Error('Error fetching payments. Please try again later.');
  }
};

const getAllPaymentsByDate = async (date) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM payments WHERE date = ? ",
      [date]
    );
    return rows;
  } catch (err) {
    logger.error(`Error fetching payments for date: ${date} - ${err.message}`);
    throw new Error('Error fetching payments. Please try again later.');
  }
};

const markPaymentAsDeleted = async (id) => {
  try {
    const [result] = await pool.query(
      "UPDATE payments SET deleted = 1 WHERE id = ?",
      [id]
    );
    return result;
  } catch (err) {
    logger.error(`Error marking payment as deleted: id=${id} - ${err.message}`);
    throw new Error('Error marking payment as deleted. Please try again later.');
  }
};

const getUniquePaymentDates = async () => {
  const query = `
    SELECT DISTINCT DATE(date) as date
    FROM payments
    WHERE deleted = 0
    ORDER BY date DESC
  `;

  try {
    const [rows] = await pool.execute(query);
    return rows;
  } catch (err) {
    logger.error(`Error fetching unique payment dates: ${err.message}`);
    throw new Error('Error fetching unique payment dates. Please try again later.');
  }
};

export default {
  createPayment,
  getAllPaymentsByDate,
  getPaymentsByDate,
  markPaymentAsDeleted,
  getUniquePaymentDates
};
