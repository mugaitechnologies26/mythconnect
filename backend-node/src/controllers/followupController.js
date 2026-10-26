const FollowupModel = require('../models/FollowupModel');
const socketManager = require('../services/realtime/socketManager');

const followupController = {
  index: async (req, res, next) => {
    try {
      const { status, assigned_to, lead_id, limit, offset } = req.query;
      const followups = await FollowupModel.getAll({ status, assigned_to, lead_id, limit, offset });
      return res.json({ success: true, data: followups });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const followup = await FollowupModel.getById(id);
      if (!followup) return res.status(404).json({ success: false, error: 'Followup not found' });
      return res.json({ success: true, data: followup });
    } catch (err) {
      next(err);
    }
  },

  store: async (req, res, next) => {
    try {
      const followup = await FollowupModel.create(req.body);
      socketManager.broadcast('followup.created', { followup });
      return res.status(201).json({ success: true, data: followup });
    } catch (err) {
      next(err);
    }
  },

  complete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { outcome } = req.body;
      const followup = await FollowupModel.complete(id, outcome || 'Completed successfully');
      socketManager.broadcast('followup.completed', { followup });
      return res.json({ success: true, data: followup });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const followup = await FollowupModel.update(id, req.body);
      socketManager.broadcast('followup.updated', { followup });
      return res.json({ success: true, data: followup });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      await FollowupModel.delete(id);
      socketManager.broadcast('followup.deleted', { id: Number(id) });
      return res.json({ success: true, message: 'Followup deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = followupController;
