const CustomerModel = require('../models/CustomerModel');
const socketManager = require('../services/realtime/socketManager');

const customerController = {
  index: async (req, res, next) => {
    try {
      const { search, limit, offset } = req.query;
      const customers = await CustomerModel.getAll({ search, limit, offset });
      return res.json({ success: true, data: customers });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.getById(id);
      if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });
      return res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  store: async (req, res, next) => {
    try {
      const { name, phone } = req.body;
      if (!name || !phone) {
        return res.status(422).json({ success: false, error: 'Name and phone are required' });
      }

      const customer = await CustomerModel.create(req.body);
      socketManager.broadcast('customer.created', { customer });
      return res.status(201).json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await CustomerModel.update(id, req.body);
      if (!customer) return res.status(404).json({ success: false, error: 'Customer not found' });

      socketManager.broadcast('customer.updated', { customer });
      return res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      await CustomerModel.delete(id);
      socketManager.broadcast('customer.deleted', { id: Number(id) });
      return res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  history: async (req, res, next) => {
    try {
      const { id } = req.params;
      const history = await CustomerModel.getHistory(id);
      return res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = customerController;
