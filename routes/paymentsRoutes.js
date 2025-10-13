const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');

// Ruta para guardar un nuevo pago
router.post('/', paymentsController.savePayment);
router.get('/', paymentsController.getPaymentsByDate);
router.delete('/:id', paymentsController.markPaymentAsDeleted);
router.get('/dates', paymentsController.getPaymentDates);
router.get('/download/:date', paymentsController.downloadPaymentsByDate);


module.exports = router;
