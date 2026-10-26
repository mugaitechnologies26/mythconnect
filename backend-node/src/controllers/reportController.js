const ReportModel = require('../models/ReportModel');

const reportController = {
  kpis: async (req, res, next) => {
    try {
      const kpis = await ReportModel.getKPIs();
      return res.json({ success: true, data: kpis });
    } catch (err) {
      next(err);
    }
  },

  sources: async (req, res, next) => {
    try {
      const sources = await ReportModel.getSources();
      return res.json({ success: true, data: sources });
    } catch (err) {
      next(err);
    }
  },

  funnel: async (req, res, next) => {
    try {
      const funnel = await ReportModel.getFunnel();
      return res.json({ success: true, data: funnel });
    } catch (err) {
      next(err);
    }
  },

  salespeople: async (req, res, next) => {
    try {
      const salespeople = await ReportModel.getSalespeople();
      return res.json({ success: true, data: salespeople });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = reportController;
