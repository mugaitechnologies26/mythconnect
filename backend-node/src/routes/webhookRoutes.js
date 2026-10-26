const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Meta Lead Ads Webhook
router.get('/meta', webhookController.getMetaWebhook);
router.post('/meta', webhookController.postMetaWebhook);

// WhatsApp Cloud API Webhook
router.get('/whatsapp', webhookController.getWhatsAppWebhook);
router.post('/whatsapp', webhookController.postWhatsAppWebhook);

module.exports = router;
