const DigitalProfileModel = require('../models/DigitalProfileModel');
const socketManager = require('../services/realtime/socketManager');
const whatsappService = require('../services/whatsapp/whatsappService');

const digitalProfileController = {
  getProfile: async (req, res, next) => {
    try {
      const slug = req.query.slug || 'mugai-tech';
      const profile = await DigitalProfileModel.getProfile(slug);
      return res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const profile = await DigitalProfileModel.updateProfile(1, req.body);
      socketManager.broadcast('digital_profile.updated', { profile });
      return res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  trackEvent: async (req, res, next) => {
    try {
      const { event_type, target_id, device } = req.body;
      const result = await DigitalProfileModel.recordAnalyticsEvent({
        event_type,
        target_id,
        device: device || (req.headers['user-agent']?.includes('Mobi') ? 'Mobile' : 'Desktop'),
        ip_address: req.ip,
        referrer: req.get('referrer') || 'Direct'
      });
      return res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  submitEnquiry: async (req, res, next) => {
    try {
      const { name, phone, email, message, productId, productName, quantity } = req.body;
      if (!name || !phone) {
        return res.status(422).json({ success: false, error: 'Name and phone are required' });
      }

      const lead = await DigitalProfileModel.createEnquiry(req.body);

      // Broadcast realtime WebSocket events
      socketManager.broadcast('lead.new', { lead });
      socketManager.broadcast('notification.new', {
        title: productId ? `🛍️ New Product Enquiry: ${productName || 'Shop'}` : `📱 New Digital Profile Enquiry`,
        message: `${name} (${phone}) requested information on WhatsApp.`,
        action_url: 'leads'
      });

      // Automated WhatsApp response
      try {
        await whatsappService.sendMessage({
          phone,
          content: `Hello ${name}! Thank you for reaching out to Mugai Tech. Our sales team has received your enquiry${productName ? ` for "${productName}"` : ''} and will connect with you shortly.`
        });
      } catch (err) {}

      return res.status(201).json({ success: true, data: lead });
    } catch (err) {
      next(err);
    }
  },

  getProducts: async (req, res, next) => {
    try {
      const products = await DigitalProfileModel.getProducts();
      return res.json({ success: true, data: products });
    } catch (err) {
      next(err);
    }
  },

  createProduct: async (req, res, next) => {
    try {
      const product = await DigitalProfileModel.createProduct(req.body);
      return res.status(201).json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  updateProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      const product = await DigitalProfileModel.updateProduct(id, req.body);
      return res.json({ success: true, data: product });
    } catch (err) {
      next(err);
    }
  },

  deleteProduct: async (req, res, next) => {
    try {
      const { id } = req.params;
      await DigitalProfileModel.deleteProduct(id);
      return res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = digitalProfileController;
