const NotificationModel = require('../models/NotificationModel');

const notificationController = {
  getAll: async (req, res, next) => {
    try {
      const { user_id, limit } = req.query;
      const notifications = await NotificationModel.getAll({ user_id, limit: limit || 50 });
      return res.json({ success: true, data: notifications });
    } catch (err) {
      next(err);
    }
  },

  markAsRead: async (req, res, next) => {
    try {
      const { id } = req.params;
      const notification = await NotificationModel.markAsRead(id);
      return res.json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  },

  markAllAsRead: async (req, res, next) => {
    try {
      const { user_id } = req.body;
      const result = await NotificationModel.markAllAsRead(user_id);
      return res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const notification = await NotificationModel.create(req.body);
      return res.status(201).json({ success: true, data: notification });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = notificationController;
