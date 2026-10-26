const metaService = require('../services/meta/metaService');
const whatsappService = require('../services/whatsapp/whatsappService');
const logger = require('../utils/logger');

const simulationController = {
  // Simulate Meta Lead Ad form submission
  simulateMetaLead: async (req, res) => {
    try {
      const {
        name = 'Vikramaditya Rao',
        phone = '+919876543299',
        email = 'vikram.rao@b2bindia.com',
        company_name = 'Rao TechLogistics Ltd',
        campaign_name = 'Facebook Lead Ads - Diwali B2B Enterprise Growth',
        ad_name = 'Video Ad - Automated CRM Demo',
        city = 'Bengaluru',
        state = 'Karnataka',
        estimated_value = 145000
      } = req.body || {};

      logger.info('SIMULATION', `Simulating Meta Lead submission for ${name}`);

      const lead = await metaService.processLeadData({
        leadgen_id: `meta_lead_${Date.now()}`,
        name,
        phone,
        email,
        company_name,
        campaign_name,
        ad_name,
        city,
        state,
        estimated_value
      });

      return res.status(200).json({
        success: true,
        message: 'Meta Lead simulated and dispatched to pipeline',
        lead
      });
    } catch (err) {
      logger.error('SIMULATION', `Error simulating lead: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
  },

  // Simulate customer replying on WhatsApp
  simulateIncomingWhatsApp: async (req, res) => {
    try {
      const {
        phone = '+919830012345',
        name = 'Amitav Bose',
        content = 'Hi Sneha, I reviewed the quotation. Can we schedule a brief video call tomorrow at 11 AM?'
      } = req.body || {};

      logger.info('SIMULATION', `Simulating incoming WhatsApp message from ${name} (${phone})`);

      const message = await whatsappService.processIncomingMessage({
        id: `wamid_sim_${Date.now()}`,
        from: phone.replace('+', ''),
        type: 'text',
        text: { body: content },
        timestamp: Math.floor(Date.now() / 1000)
      }, [{ profile: { name } }]);

      return res.status(200).json({
        success: true,
        message: 'WhatsApp message simulated and broadcast via WebSocket',
        data: message
      });
    } catch (err) {
      logger.error('SIMULATION', `Error simulating WhatsApp: ${err.message}`);
      return res.status(500).json({ error: err.message });
    }
  }
};

module.exports = simulationController;
