const QuotationModel = require('../models/QuotationModel');
const InvoiceModel = require('../models/InvoiceModel');
const whatsappService = require('../services/whatsapp/whatsappService');
const socketManager = require('../services/realtime/socketManager');

const quotationController = {
  index: async (req, res, next) => {
    try {
      const { status, customer_id, limit, offset } = req.query;
      const quotations = await QuotationModel.getAll({ status, customer_id, limit, offset });
      return res.json({ success: true, data: quotations });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quotation = await QuotationModel.getById(id);
      if (!quotation) return res.status(404).json({ success: false, error: 'Quotation not found' });
      return res.json({ success: true, data: quotation });
    } catch (err) {
      next(err);
    }
  },

  store: async (req, res, next) => {
    try {
      const quotation = await QuotationModel.create(req.body);
      socketManager.broadcast('quotation.created', { quotation });
      return res.status(201).json({ success: true, data: quotation });
    } catch (err) {
      next(err);
    }
  },

  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const quotation = await QuotationModel.updateStatus(id, status);
      socketManager.broadcast('quotation.updated', { quotation });
      return res.json({ success: true, data: quotation });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      await QuotationModel.delete(id);
      socketManager.broadcast('quotation.deleted', { id: Number(id) });
      return res.json({ success: true, message: 'Quotation deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  convertToInvoice: async (req, res, next) => {
    try {
      const { id } = req.params;
      const invoiceId = await QuotationModel.convertToInvoice(id);
      const invoice = await InvoiceModel.getById(invoiceId);
      const updatedQuote = await QuotationModel.getById(id);

      socketManager.broadcast('invoice.created', { invoice });
      socketManager.broadcast('quotation.updated', { quotation: updatedQuote });

      return res.status(201).json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  },

  sendQuotation: async (req, res, next) => {
    try {
      const { id } = req.params;
      const quote = await QuotationModel.getById(id);
      if (!quote) return res.status(404).json({ success: false, error: 'Quotation not found' });

      // Update status to sent
      await QuotationModel.updateStatus(id, 'sent');

      // Dispatch WhatsApp notification to customer
      if (quote.customer_phone) {
        await whatsappService.sendAutomatedTemplate({
          phone: quote.customer_phone,
          name: quote.customer_name,
          trigger: 'quotation_sent',
          template: 'quotation_dispatched',
          variables: [quote.customer_name, quote.quotation_number, String(quote.grand_total), quote.valid_until]
        });
      }

      return res.json({ success: true, message: 'Quotation sent successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = quotationController;
