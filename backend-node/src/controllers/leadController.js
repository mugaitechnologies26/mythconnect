const LeadModel = require('../models/LeadModel');
const FollowupModel = require('../models/FollowupModel');
const socketManager = require('../services/realtime/socketManager');

const leadController = {
  index: async (req, res, next) => {
    try {
      const { search, source, status, limit, offset } = req.query;
      const leads = await LeadModel.getAll({ search, source, status, limit, offset });
      return res.json({ success: true, data: leads });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const lead = await LeadModel.getById(id);
      if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

      lead.activities = await LeadModel.getActivities(id);
      lead.notes = await LeadModel.getNotes(id);
      lead.followups = await FollowupModel.getAll({ lead_id: id });

      return res.json({ success: true, data: lead });
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

      const lead = await LeadModel.create(req.body);

      // Broadcast realtime event
      socketManager.broadcast('lead.new', { lead });
      socketManager.broadcast('notification.new', {
        title: `🔥 New Lead: ${lead.name}`,
        message: `${lead.name} (${lead.phone}) registered into CRM.`,
        action_url: 'leads'
      });

      return res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const lead = await LeadModel.update(id, req.body);
      if (!lead) return res.status(404).json({ success: false, error: 'Lead not found' });

      socketManager.broadcast('lead.updated', { lead });
      return res.json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  },

  updateStage: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status_code, status_id } = req.body;
      const target = status_id || status_code;

      if (!target) {
        return res.status(422).json({ success: false, error: 'status_code or status_id is required' });
      }

      const lead = await LeadModel.updateStage(id, target);
      socketManager.broadcast('lead.stage_changed', { lead });

      return res.json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      await LeadModel.delete(id);
      socketManager.broadcast('lead.deleted', { id: Number(id) });
      return res.json({ success: true, message: 'Lead deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  storeFollowup: async (req, res, next) => {
    try {
      const { id } = req.params;
      const followup = await FollowupModel.create({ ...req.body, lead_id: id });
      return res.status(201).json({ success: true, data: followup });
    } catch (err) {
      next(err);
    }
  },

  storeNote: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { note, user_id } = req.body;
      if (!note) return res.status(422).json({ success: false, error: 'Note text is required' });

      const createdNote = await LeadModel.addNote(id, user_id || 1, note);
      return res.status(201).json({ success: true, data: createdNote });
    } catch (err) {
      next(err);
    }
  },

  convertToCustomer: async (req, res, next) => {
    try {
      const { id } = req.params;
      const customer = await LeadModel.convertToCustomer(id);
      socketManager.broadcast('lead.converted', { lead_id: Number(id), customer });
      return res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = leadController;
