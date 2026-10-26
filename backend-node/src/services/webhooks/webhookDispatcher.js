const metaService = require('../meta/metaService');
const whatsappService = require('../whatsapp/whatsappService');
const idempotencyStore = require('./idempotencyStore');
const config = require('../../config');
const logger = require('../../utils/logger');

class WebhookDispatcher {
  // Meta Lead Ads Verification (GET)
  verifyMetaChallenge(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.meta.verifyToken) {
      logger.success('WEBHOOK', 'Meta webhook verification successful');
      return res.status(200).send(challenge);
    }

    logger.warn('WEBHOOK', 'Meta webhook verification failed: Token mismatch');
    return res.status(403).json({ error: 'Verification token mismatch' });
  }

  // WhatsApp Cloud API Verification (GET)
  verifyWhatsAppChallenge(req, res) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
      logger.success('WEBHOOK', 'WhatsApp webhook verification successful');
      return res.status(200).send(challenge);
    }

    logger.warn('WEBHOOK', 'WhatsApp webhook verification failed: Token mismatch');
    return res.status(403).json({ error: 'Verification token mismatch' });
  }

  // Ingest Meta POST
  async handleMetaWebhook(req, res) {
    try {
      const body = req.body;
      const eventKey = `meta_${body.entry?.[0]?.id || Date.now()}_${body.entry?.[0]?.time || ''}`;

      if (idempotencyStore.isProcessed(eventKey)) {
        logger.info('WEBHOOK', `Duplicate Meta event ignored: ${eventKey}`);
        return res.status(200).json({ status: 'duplicate_ignored' });
      }

      idempotencyStore.markProcessed(eventKey);
      await metaService.handleWebhookPayload(body);
      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err) {
      logger.error('WEBHOOK', `Error processing Meta webhook: ${err.message}`);
      return res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  }

  // Ingest WhatsApp POST
  async handleWhatsAppWebhook(req, res) {
    try {
      const body = req.body;
      const msgId = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id;
      const statusId = body.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.id;
      const eventKey = msgId ? `wa_msg_${msgId}` : (statusId ? `wa_stat_${statusId}` : `wa_ev_${Date.now()}`);

      if (idempotencyStore.isProcessed(eventKey)) {
        logger.info('WEBHOOK', `Duplicate WhatsApp event ignored: ${eventKey}`);
        return res.status(200).json({ status: 'duplicate_ignored' });
      }

      idempotencyStore.markProcessed(eventKey);
      await whatsappService.handleWebhookPayload(body);
      return res.status(200).json({ status: 'EVENT_RECEIVED' });
    } catch (err) {
      logger.error('WEBHOOK', `Error processing WhatsApp webhook: ${err.message}`);
      return res.status(500).json({ error: 'Internal server error processing webhook' });
    }
  }
}

module.exports = new WebhookDispatcher();
