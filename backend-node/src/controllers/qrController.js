const QrModel = require('../models/QrModel');
const DigitalProfileModel = require('../models/DigitalProfileModel');
const socketManager = require('../services/realtime/socketManager');

const qrController = {
  index: async (req, res, next) => {
    try {
      const qrCodes = await QrModel.getAll();
      return res.json({ success: true, data: qrCodes });
    } catch (err) {
      next(err);
    }
  },

  show: async (req, res, next) => {
    try {
      const { id } = req.params;
      const qr = await QrModel.getById(id);
      if (!qr) return res.status(404).json({ success: false, error: 'QR code not found' });
      return res.json({ success: true, data: qr });
    } catch (err) {
      next(err);
    }
  },

  generate: async (req, res, next) => {
    try {
      const { title, qr_type, payload_data, target_url } = req.body;
      if (!title) {
        return res.status(422).json({ success: false, error: 'Title is required' });
      }

      const qr = await QrModel.create(req.body);
      socketManager.broadcast('qr.created', { qr });
      return res.status(201).json({ success: true, data: qr });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const qr = await QrModel.update(id, req.body);
      socketManager.broadcast('qr.updated', { qr });
      return res.json({ success: true, data: qr });
    } catch (err) {
      next(err);
    }
  },

  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;
      await QrModel.delete(id);
      socketManager.broadcast('qr.deleted', { id: Number(id) });
      return res.json({ success: true, message: 'QR code deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  // Dynamic QR Redirect tracking endpoint: GET /qr/:qrId
  redirect: async (req, res, next) => {
    try {
      const { qrId } = req.params;
      await QrModel.incrementScan(qrId);

      // Record profile analytics
      await DigitalProfileModel.recordAnalyticsEvent({
        event_type: 'qr_scan',
        target_id: qrId,
        device: req.headers['user-agent']?.includes('Mobi') ? 'Mobile' : 'Desktop',
        ip_address: req.ip,
        referrer: req.get('referrer') || 'Direct Scan'
      });

      const qr = await QrModel.getByQrCodeId(qrId);
      const destination = qr?.target_url || qr?.payload_data || 'http://localhost:3000/p/mugai-tech';

      // If payload is a full URL, redirect directly
      if (destination.startsWith('http://') || destination.startsWith('https://')) {
        return res.redirect(destination);
      }

      return res.redirect(`http://localhost:3000/p/mugai-tech`);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = qrController;
