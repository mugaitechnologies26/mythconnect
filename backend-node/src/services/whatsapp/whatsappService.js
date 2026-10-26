const logger = require('../../utils/logger');
const { renderTemplate } = require('./templateEngine');
const jobQueue = require('../queues/jobQueue');
const socketManager = require('../realtime/socketManager');
const WhatsAppModel = require('../../models/WhatsAppModel');

class WhatsAppService {
  constructor() {
    this.setupQueueListeners();
  }

  setupQueueListeners() {
    jobQueue.on('send_whatsapp_automation', async (payload) => {
      await this.sendAutomatedTemplate(payload);
    });

    jobQueue.on('simulate_delivery_receipts', async (payload) => {
      await this.simulateMessageLifecycle(payload);
    });
  }

  // Handle incoming WhatsApp Webhook payload from Meta Cloud API
  async handleWebhookPayload(body) {
    if (body.object !== 'whatsapp_business_account') {
      return false;
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'messages') {
          const value = change.value;
          
          if (value.messages && value.messages.length > 0) {
            for (const msg of value.messages) {
              await this.processIncomingMessage(msg, value.contacts);
            }
          }

          if (value.statuses && value.statuses.length > 0) {
            for (const status of value.statuses) {
              await this.processStatusUpdate(status);
            }
          }
        }
      }
    }
    return true;
  }

  async processIncomingMessage(msg, contacts = []) {
    const contactName = contacts && contacts[0] ? contacts[0].profile?.name : 'Customer';
    const senderPhone = `+${String(msg.from).replace(/^\+/, '')}`;
    const textContent = msg.text ? msg.text.body : (msg.type === 'image' ? '[Photo]' : (msg.content || '[Attachment]'));

    // Find or create conversation in MySQL
    let conv = await WhatsAppModel.getConversationByPhone(senderPhone);
    if (!conv) {
      conv = await WhatsAppModel.createConversation({
        phone: senderPhone,
        name: contactName,
        last_message: textContent,
        unread_count: 1
      });
    }

    // Save message in MySQL
    const savedMsg = await WhatsAppModel.saveMessage({
      conversation_id: conv.id,
      wamid: msg.id || `wamid_${Date.now()}`,
      sender_type: 'customer',
      sender_id: null,
      message_type: msg.type || 'text',
      content: textContent,
      status: 'delivered'
    });

    logger.info('WHATSAPP', `Incoming message from ${contactName} (${senderPhone}): ${textContent}`);

    // Broadcast to CRM frontend live chat
    socketManager.broadcast('whatsapp.message', {
      message: {
        ...savedMsg,
        phone: senderPhone,
        sender_name: contactName
      }
    });

    socketManager.broadcast('notification.new', {
      type: 'whatsapp_message_received',
      title: `💬 WhatsApp from ${contactName}`,
      message: textContent,
      action_url: `/whatsapp?phone=${encodeURIComponent(senderPhone)}`
    });

    return savedMsg;
  }

  async processStatusUpdate(status) {
    logger.info('WHATSAPP', `Status update for msg #${status.id}: ${status.status} (${status.recipient_id})`);

    // Update in MySQL
    await WhatsAppModel.updateMessageStatus(status.id, status.status);

    socketManager.broadcast('whatsapp.status', {
      wamid: status.id,
      recipient_id: status.recipient_id,
      status: status.status,
      timestamp: status.timestamp ? new Date(status.timestamp * 1000).toISOString() : new Date().toISOString()
    });
  }

  // Send an outgoing WhatsApp message (Agent manual send)
  async sendMessage({ phone, content, messageType = 'text', mediaUrl = null, conversationId = null }) {
    const cleanPhone = `+${String(phone).replace(/^\+/, '')}`;
    let convId = conversationId;

    if (!convId) {
      let conv = await WhatsAppModel.getConversationByPhone(cleanPhone);
      if (!conv) {
        conv = await WhatsAppModel.createConversation({
          phone: cleanPhone,
          name: 'Contact',
          last_message: content,
          unread_count: 0
        });
      }
      convId = conv.id;
    }

    const wamid = `wamid_out_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Save to MySQL
    const savedMsg = await WhatsAppModel.saveMessage({
      conversation_id: convId,
      wamid,
      sender_type: 'agent',
      sender_id: 4, // Sneha Kulkarni
      message_type: messageType,
      content,
      media_url: mediaUrl,
      status: 'sent'
    });

    logger.info('WHATSAPP', `Dispatching message to ${cleanPhone}: ${content.substring(0, 40)}...`);

    // Broadcast via WebSocket
    socketManager.broadcast('whatsapp.message', {
      message: {
        ...savedMsg,
        phone: cleanPhone
      }
    });

    // Queue realistic delivery & read status transitions
    jobQueue.add('simulate_delivery_receipts', { wamid, phone: cleanPhone }, { delay: 1000 });

    return savedMsg;
  }

  // Send automated WhatsApp template
  async sendAutomatedTemplate({ phone, name, trigger, template, variables, lead_id = null }) {
    try {
      const rendered = renderTemplate(template, variables);
      const cleanPhone = `+${String(phone).replace(/^\+/, '')}`;

      let conv = await WhatsAppModel.getConversationByPhone(cleanPhone);
      if (!conv) {
        conv = await WhatsAppModel.createConversation({
          phone: cleanPhone,
          name,
          lead_id,
          last_message: rendered.renderedText,
          unread_count: 0
        });
      }

      const wamid = `wamid_auto_${Date.now()}`;

      const savedMsg = await WhatsAppModel.saveMessage({
        conversation_id: conv.id,
        wamid,
        sender_type: 'system',
        message_type: 'template',
        content: rendered.renderedText,
        status: 'sent'
      });

      logger.success('WHATSAPP', `Auto-template [${template}] sent to ${name} (${cleanPhone}) on event [${trigger}]`);

      socketManager.broadcast('whatsapp.message', {
        message: {
          ...savedMsg,
          phone: cleanPhone,
          template_name: template
        }
      });

      jobQueue.add('simulate_delivery_receipts', { wamid, phone: cleanPhone }, { delay: 1200 });

      return savedMsg;
    } catch (err) {
      logger.error('WHATSAPP', `Failed sending template: ${err.message}`);
    }
  }

  async simulateMessageLifecycle({ wamid, phone }) {
    setTimeout(async () => {
      await WhatsAppModel.updateMessageStatus(wamid, 'delivered');
      socketManager.broadcast('whatsapp.status', {
        wamid,
        recipient_id: phone,
        status: 'delivered',
        timestamp: new Date().toISOString()
      });

      setTimeout(async () => {
        await WhatsAppModel.updateMessageStatus(wamid, 'read');
        socketManager.broadcast('whatsapp.status', {
          wamid,
          recipient_id: phone,
          status: 'read',
          timestamp: new Date().toISOString()
        });
      }, 2000);
    }, 1000);
  }
}

module.exports = new WhatsAppService();
