const webhookDispatcher = require('../services/webhooks/webhookDispatcher');
const { validateMetaRequest } = require('../services/meta/signatureValidator');
const logger = require('../utils/logger');

const webhookController = {
  getMetaWebhook: (req, res) => {
    return webhookDispatcher.verifyMetaChallenge(req, res);
  },

  postMetaWebhook: async (req, res) => {
    // Validate signature in production
    if (process.env.NODE_ENV === 'production') {
      const isValid = validateMetaRequest(req);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid HMAC signature' });
      }
    }
    return await webhookDispatcher.handleMetaWebhook(req, res);
  },

  getWhatsAppWebhook: (req, res) => {
    return webhookDispatcher.verifyWhatsAppChallenge(req, res);
  },

  postWhatsAppWebhook: async (req, res) => {
    return await webhookDispatcher.handleWhatsAppWebhook(req, res);
  }
};

module.exports = webhookController;
