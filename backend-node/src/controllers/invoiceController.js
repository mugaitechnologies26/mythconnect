const InvoiceModel = require('../models/InvoiceModel');
const whatsappService = require('../services/whatsapp/whatsappService');
const socketManager = require('../services/realtime/socketManager');

const invoiceController = {
  index: async (req, res, next) => {
    try {
      const { payment_status, customer_id, limit, offset } = req.query;
      const invoices = await InvoiceModel.getAll({ payment_status, customer_id, limit, offset });
      return res.json({ success: true, data: invoices });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const invoice = await InvoiceModel.getById(id);
      if (!invoice) return res.status(404).json({ success: false, error: 'Invoice not found' });
      return res.json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  },

  store: async (req, res, next) => {
    try {
      const invoice = await InvoiceModel.create(req.body);
      socketManager.broadcast('invoice.created', { invoice });
      return res.status(201).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  },

  recordPayment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const paymentResult = await InvoiceModel.recordPayment(id, req.body);
      const updatedInvoice = await InvoiceModel.getById(id);

      socketManager.broadcast('invoice.paid', {
        invoice: updatedInvoice,
        payment: paymentResult
      });

      socketManager.broadcast('notification.new', {
        type: 'payment_received',
        title: `💰 Payment Recorded: ₹${Number(paymentResult.amount).toLocaleString('en-IN')}`,
        message: `Payment received against Invoice #${updatedInvoice.invoice_number} via ${req.body.payment_method || 'bank_transfer'}.`,
        action_url: 'invoices'
      });

      // Send WhatsApp receipt if customer has phone
      if (updatedInvoice.customer_phone) {
        whatsappService.sendAutomatedTemplate({
          phone: updatedInvoice.customer_phone,
          name: updatedInvoice.customer_name,
          trigger: 'payment_reminder',
          template: 'invoice_payment_receipt',
          variables: [
            updatedInvoice.customer_name,
            String(paymentResult.amount),
            updatedInvoice.invoice_number,
            req.body.payment_method || 'Bank Transfer'
          ]
        }).catch(() => {});
      }

      return res.status(201).json({ success: true, data: paymentResult, invoice: updatedInvoice });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      await InvoiceModel.delete(id);
      socketManager.broadcast('invoice.deleted', { id: Number(id) });
      return res.json({ success: true, message: 'Invoice deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = invoiceController;
