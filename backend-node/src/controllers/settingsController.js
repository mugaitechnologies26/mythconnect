const SettingsModel = require('../models/SettingsModel');

const settingsController = {
  index: async (req, res, next) => {
    try {
      const settings = await SettingsModel.getAll();
      return res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const settings = await SettingsModel.batchUpdate(req.body);
      return res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = settingsController;
