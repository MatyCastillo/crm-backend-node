const paymentModel = require('../models/paymentModel');
const excel = require('exceljs');

const savePayment = async (req, res) => {
  const { method, amount, date, branchId,user } = req.body;

  try {
    const results = await paymentModel.createPayment(method, amount, date, branchId, user);
    res.status(201).json({
      message: 'Payment saved successfully',
      data: results,
    });
  } catch (err) {
    res.status(500).json({
      message: 'Error saving payment',
      error: err
    });
  }
};
const getPaymentsByDate = async (req, res) => {
  const { date, branch } = req.query;
  try {
    const payments = await paymentModel.getPaymentsByDate(date, branch);
    res.status(200).json({ message: "Pagos obtenidos exitosamente", data: payments });
  } catch (error) {
    console.error("Error al obtener los pagos:", error);
    res.status(500).json({ message: "Error al obtener los pagos" });
  }
};

const markPaymentAsDeleted = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await paymentModel.markPaymentAsDeleted(id);

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Pago marcado como eliminado" });
    } else {
      res.status(404).json({ message: "Pago no encontrado" });
    }
  } catch (error) {
    console.error("Error al marcar el pago como eliminado:", error);
    res.status(500).json({ message: "Error al marcar el pago como eliminado" });
  }
};

const getPaymentDates = async (req, res) => {
  try {
    const dates = await paymentModel.getUniquePaymentDates();
    res.status(200).json(dates);
  } catch (error) {
    console.error('Error fetching payment dates:', error);
    res.status(500).json({ message: 'Error fetching payment dates' });
  }
};

const downloadPaymentsByDate = async (req, res) => {
  const { date } = req.params;
  try {
    const rows = await paymentModel.getAllPaymentsByDate(new Date(date).toISOString().split('T')[0]);

    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Pagos');

    worksheet.columns = [
      { header: 'Método', key: 'method', width: 20 },
      { header: 'Monto', key: 'amount', width: 20 },
      { header: 'Sucursal', key: 'branch_id', width: 10 },
      { header: 'Turno', key: 'shift', width: 10 },
      { header: 'Eliminado', key: 'deleted', width: 10 },
    ];

    worksheet.getRow(1).font = { bold: true };


    rows.forEach(row => {
      worksheet.addRow({
        ...row,
        deleted: row.deleted ? 'si' : 'no',
        shift: row.shift === "morning" ? 'Mañana' : 'Tarde',
      });
    });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=pagos_${date}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al descargar pagos:', error);
    res.status(500).json({ message: 'Error al descargar pagos' });
  }
};

module.exports = { savePayment,getPaymentsByDate,markPaymentAsDeleted, getPaymentDates,downloadPaymentsByDate };
