const templates = {
  myth_lead_welcome: {
    name: 'myth_lead_welcome',
    category: 'MARKETING',
    language: 'en',
    body: 'Hi {{1}}, thank you for reaching out to Myth Connect.ai! 🚀\n\nOur sales specialist {{2}} has received your request and will contact you shortly.\n\nIn the meantime, you can explore our live product overview here: https://mythconnect.ai/tour',
    footer: 'Myth Connect.ai • Intelligent CRM'
  },
  quotation_dispatched: {
    name: 'quotation_dispatched',
    category: 'UTILITY',
    language: 'en',
    body: 'Dear {{1}},\n\nYour requested quotation #{{2}} from Myth Connect.ai has been generated for a total amount of ₹{{3}}.\n\nClick below to view and download your formal quote. It is valid until {{4}}.\n\nLet us know if you have any questions!',
    footer: 'Reply to this chat to connect with sales'
  },
  followup_gentle_reminder: {
    name: 'followup_gentle_reminder',
    category: 'MARKETING',
    language: 'en',
    body: 'Hello {{1}}, just following up on our conversation regarding {{2}}.\n\nDo you have 5 minutes today for a quick call to address any questions you might have?\n\nLooking forward to assisting you!',
    footer: 'Myth Connect.ai Sales Team'
  },
  invoice_payment_receipt: {
    name: 'invoice_payment_receipt',
    category: 'UTILITY',
    language: 'en',
    body: 'Dear {{1}},\n\nWe have received your payment of ₹{{2}} against invoice #{{3}} via {{4}}.\n\nThank you for choosing Myth Connect.ai! Your official GST invoice receipt is attached.',
    footer: 'Accounting Dept • Myth Connect.ai'
  }
};

function renderTemplate(templateName, variables = []) {
  const tmpl = templates[templateName];
  if (!tmpl) {
    throw new Error(`WhatsApp Template '${templateName}' not found`);
  }

  let renderedBody = tmpl.body;
  variables.forEach((val, idx) => {
    const placeholder = new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g');
    renderedBody = renderedBody.replace(placeholder, val);
  });

  return {
    template: tmpl.name,
    category: tmpl.category,
    language: tmpl.language,
    renderedText: renderedBody,
    footer: tmpl.footer
  };
}

module.exports = {
  templates,
  renderTemplate
};
