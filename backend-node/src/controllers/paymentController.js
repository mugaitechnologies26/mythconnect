const PaymentModel = require('../models/PaymentModel');

const paymentController = {
  index: async (req, res, next) => {
    try {
      const { invoice_id, customer_id, limit, offset } = req.query;
      const payments = await PaymentModel.getAll({ invoice_id, customer_id, limit, offset });
      return res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payment = await PaymentModel.getById(id);
      if (!payment) return res.status(404).json({ success: false, error: 'Payment not found' });
      return res.json({ success: true, data: payment });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = paymentController;
