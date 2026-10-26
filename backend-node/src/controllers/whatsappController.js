const WhatsAppModel = require('../models/WhatsAppModel');
const whatsappService = require('../services/whatsapp/whatsappService');

const whatsappController = {
  conversations: async (req, res, next) => {
    try {
      const conversations = await WhatsAppModel.getConversations();
      return res.json({ success: true, data: conversations });
    } catch (err) {
      next(err);
    }
  },

  messages: async (req, res, next) => {
    try {
      const { conversationId } = req.params;
      if (conversationId) {
        const messages = await WhatsAppModel.getMessages(conversationId);
        return res.json({ success: true, data: messages });
      }
      const allMessages = await WhatsAppModel.getAllMessages();
      return res.json({ success: true, data: allMessages });
    } catch (err) {
      next(err);
    }
  },

  sendMessage: async (req, res, next) => {
    try {
      const { phone, content, messageType, conversation_id } = req.body;
      if (!phone || !content) {
        return res.status(422).json({ success: false, error: 'Phone and content are required' });
      }

      const message = await whatsappService.sendMessage({
        phone,
        content,
        messageType,
        conversationId: conversation_id
      });

      return res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  },

  templates: async (req, res, next) => {
    try {
      const templates = await WhatsAppModel.getTemplates();
      return res.json({ success: true, data: templates });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = whatsappController;
