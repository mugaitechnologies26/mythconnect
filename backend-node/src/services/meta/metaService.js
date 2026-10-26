const logger = require('../../utils/logger');
const jobQueue = require('../queues/jobQueue');
const socketManager = require('../realtime/socketManager');
const LeadModel = require('../../models/LeadModel');
const FollowupModel = require('../../models/FollowupModel');

class MetaService {
  constructor() {
    this.setupQueueListeners();
  }

  setupQueueListeners() {
    jobQueue.on('process_meta_lead', async (leadData) => {
      await this.processLeadData(leadData);
    });
  }

  // Parses Meta Leadgen Webhook entry
  async handleWebhookPayload(body) {
    if (body.object !== 'page') {
      logger.warn('META', `Unsupported object type: ${body.object}`);
      return false;
    }

    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        if (change.field === 'leadgen') {
          const value = change.value;
          const leadgenId = value.leadgen_id;
          const formId = value.form_id;
          const pageId = value.page_id;
          const createdTime = value.created_time || Math.floor(Date.now() / 1000);

          logger.info('META', `Encountered leadgen event: Lead ID #${leadgenId} on Form #${formId}`);

          jobQueue.add('process_meta_lead', {
            leadgen_id: leadgenId,
            form_id: formId,
            page_id: pageId,
            created_time: createdTime,
            raw_payload: change
          });
        }
      }
    }
    return true;
  }

  // Ingests lead into MySQL database and dispatches automations
  async processLeadData(rawLead) {
    logger.info('META', `Processing Leadgen Data for ID: ${rawLead.leadgen_id || rawLead.name}`);

    const leadData = {
      name: rawLead.name || 'Rahul Varma',
      phone: rawLead.phone || '+919876543299',
      email: rawLead.email || 'rahul.varma@leadmail.in',
      company_name: rawLead.company_name || 'Varma Precision Tools Ltd',
      source_code: 'meta',
      lead_source_id: 1,
      lead_status_id: 1,
      assigned_to: 4, // Sneha Kulkarni
      estimated_value: rawLead.estimated_value || 85000,
      priority: 'high',
      city: rawLead.city || 'Bengaluru',
      state: rawLead.state || 'Karnataka',
      meta_lead_id: rawLead.leadgen_id || `meta_lead_${Date.now()}`,
      meta_form_id: rawLead.form_id || 'form_fb_crm_2026',
      meta_page_id: rawLead.page_id || 'page_mythconnect_official',
      meta_campaign_name: rawLead.campaign_name || 'Facebook Lead Ads - Q4 High Intent',
      meta_ad_name: rawLead.ad_name || 'Carousel - Meta to WhatsApp Flow',
      next_followup_at: new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 19).replace('T', ' ')
    };

    // Save to MySQL Database
    const savedLead = await LeadModel.create(leadData);

    // Schedule 2-hour pending followup in MySQL
    await FollowupModel.create({
      lead_id: savedLead.id,
      assigned_to: 4,
      scheduled_at: leadData.next_followup_at,
      type: 'whatsapp',
      status: 'pending',
      notes: `Automated 2-hour follow-up for Meta lead ${savedLead.name}. Campaign: ${savedLead.meta_campaign_name}`
    });

    // Broadcast realtime WebSocket event to all connected CRM clients
    socketManager.broadcast('lead.new', {
      lead: savedLead,
      message: `🔥 New Meta lead captured from ${savedLead.meta_campaign_name}`
    });

    // Broadcast notification
    socketManager.broadcast('notification.new', {
      type: 'meta_lead_created',
      title: '🔥 New Meta Lead Captured',
      message: `${savedLead.name} (${savedLead.phone}) submitted Lead Form: ${savedLead.meta_campaign_name}`,
      action_url: `/leads`
    });

    // Auto-trigger WhatsApp welcome cadence
    jobQueue.add('send_whatsapp_automation', {
      phone: savedLead.phone,
      name: savedLead.name,
      trigger: 'new_meta_lead',
      template: 'myth_lead_welcome',
      variables: [savedLead.name, 'Sneha Kulkarni'],
      lead_id: savedLead.id
    }, { delay: 1500 });

    logger.success('META', `Lead #${savedLead.lead_code} successfully saved to MySQL and queued for WhatsApp automation`);
    return savedLead;
  }
}

module.exports = new MetaService();
