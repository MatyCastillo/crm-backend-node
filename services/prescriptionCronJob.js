const cron = require('node-cron');
const { sendNotification } = require('./notificationService');
const db = require('../db/db'); // Conexión a la base de datos

// Ejecutar el cron job todos los días a las 8:00 AM
cron.schedule('0 8 * * *', async () => {
  const today = new Date();
  const notificationDays = 10;
  
  // Calcular la fecha límite para notificar
  const notificationDate = new Date();
  notificationDate.setDate(today.getDate() + notificationDays);

  try {
    // Buscar las recetas que vencerán en los próximos 10 días
    const [upcomingExpirations] = await db.query(
      `SELECT * FROM prescriptions WHERE DATE_ADD(created_at, INTERVAL validity_days DAY) = ?`,
      [notificationDate]
    );

    // Enviar notificaciones por cada receta próxima a vencer
    upcomingExpirations.forEach((prescription) => {
      sendNotification(prescription.patient_id, prescription.id);
    });
  } catch (error) {
    console.error('Error ejecutando el cron job de recetas:', error);
  }
});
