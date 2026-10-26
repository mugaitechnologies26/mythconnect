const whatsappService = require('../whatsapp/whatsappService');
const logger = require('../../utils/logger');

class MessageDispatcher {
  async dispatchOutgoingMessage(messageData) {
    logger.info('DISPATCHER', `Preparing message for dispatch to ${messageData.phone}`);
    return await whatsappService.sendMessage(messageData);
  }

  async dispatchTemplate(templateData) {
    logger.info('DISPATCHER', `Preparing template [${templateData.template}] for ${templateData.phone}`);
    return await whatsappService.sendAutomatedTemplate(templateData);
  }
}

module.exports = new MessageDispatcher();
