const http = require('http');

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const isPost = ['POST', 'PUT', 'PATCH'].includes(method);
    const bodyStr = isPost && data ? JSON.stringify(data) : '';

    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(isPost && { 'Content-Length': Buffer.byteLength(bodyStr) })
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Starting Comprehensive API & Database Verification Tests...\n');
  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${name} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Health
    const health = await request('GET', '/api/health');
    assert('Health Check', health.status === 200 && health.data.status === 'healthy');

    // 2. KPIs
    const kpis = await request('GET', '/api/dashboard/kpis');
    assert('Dashboard KPIs', kpis.status === 200 && kpis.data.data.totalLeads > 0);

    // 3. Leads Read
    const leads = await request('GET', '/api/leads');
    assert('GET /api/leads', leads.status === 200 && Array.isArray(leads.data.data) && leads.data.data.length >= 10);

    // 4. Lead Create
    const newLeadRes = await request('POST', '/api/leads', {
      name: 'Rohan Deshmukh Test',
      phone: '+919988776655',
      email: 'rohan.test@b2bauto.in',
      company_name: 'Deshmukh Heavy Engineering',
      source_code: 'meta',
      estimated_value: 250000,
      priority: 'urgent',
      city: 'Nagpur',
      state: 'Maharashtra'
    });
    assert('POST /api/leads (Create Lead)', newLeadRes.status === 201 && newLeadRes.data.data.id > 0);
    const createdLeadId = newLeadRes.data.data.id;

    // 5. Lead Read by ID
    const singleLead = await request('GET', `/api/leads/${createdLeadId}`);
    assert('GET /api/leads/:id', singleLead.status === 200 && singleLead.data.data.name === 'Rohan Deshmukh Test');

    // 6. Lead Update Stage
    const stageRes = await request('PATCH', `/api/leads/${createdLeadId}/stage`, { status_code: 'qualified' });
    assert('PATCH /api/leads/:id/stage (Update Stage)', stageRes.status === 200 && stageRes.data.data.status_code === 'qualified');

    // 7. Lead Add Note
    const noteRes = await request('POST', `/api/leads/${createdLeadId}/notes`, { note: 'Client requested technical RFP documentation.' });
    assert('POST /api/leads/:id/notes (Add Note)', noteRes.status === 201 && noteRes.data.data.id > 0);

    // 8. Lead Add Followup
    const followupRes = await request('POST', `/api/leads/${createdLeadId}/followups`, {
      type: 'call',
      notes: 'Follow up on technical RFP scope'
    });
    assert('POST /api/leads/:id/followups (Schedule Followup)', followupRes.status === 201 && followupRes.data.data.id > 0);

    // 9. Lead Convert to Customer
    const convertRes = await request('POST', `/api/leads/${createdLeadId}/convert`);
    assert('POST /api/leads/:id/convert (Convert Lead to Customer)', convertRes.status === 200 && convertRes.data.data.customer_code.startsWith('CUST-'));
    const convertedCustId = convertRes.data.data.id;

    // 10. Customers Read
    const custs = await request('GET', '/api/customers');
    assert('GET /api/customers', custs.status === 200 && custs.data.data.length >= 6);

    // 11. Customer History
    const history = await request('GET', `/api/customers/${convertedCustId}/history`);
    assert('GET /api/customers/:id/history', history.status === 200 && Array.isArray(history.data.data.leads));

    // 12. Quotation Create
    const quoteRes = await request('POST', '/api/quotations', {
      customer_id: convertedCustId,
      lead_id: createdLeadId,
      notes: 'Custom automation pipeline setup',
      items: [
        { description: 'MythConnect CRM Suite License', quantity: 1, unit_price: 85000, discount_percent: 10, tax_rate: 18 },
        { description: 'WhatsApp Business API Onboarding', quantity: 1, unit_price: 25000, discount_percent: 0, tax_rate: 18 }
      ]
    });
    assert('POST /api/quotations (Create Quotation)', quoteRes.status === 201 && quoteRes.data.data.id > 0);
    const quoteId = quoteRes.data.data.id;

    // 13. Convert Quotation to Invoice
    const invRes = await request('POST', `/api/quotations/${quoteId}/convert-to-invoice`);
    assert('POST /api/quotations/:id/convert-to-invoice (Convert to Invoice)', invRes.status === 201 && invRes.data.data.invoice_number.startsWith('INV-'));
    const invoiceId = invRes.data.data.id;

    // 14. Record Payment on Invoice
    const payRes = await request('POST', `/api/invoices/${invoiceId}/payments`, {
      amount: 50000,
      payment_method: 'upi',
      reference_number: 'UPI/TEST/2026102601',
      notes: 'Advance UPI token transfer'
    });
    assert('POST /api/invoices/:id/payments (Record Payment Transaction)', payRes.status === 201 && payRes.data.data.newPaid === 50000);

    // 15. Payments List
    const payments = await request('GET', '/api/payments');
    assert('GET /api/payments', payments.status === 200 && payments.data.data.length >= 6);

    // 16. WhatsApp Conversations & Send Message
    const convs = await request('GET', '/api/whatsapp/conversations');
    assert('GET /api/whatsapp/conversations', convs.status === 200 && convs.data.data.length >= 5);

    const waMsgRes = await request('POST', '/api/whatsapp/messages', {
      phone: '+919988776655',
      content: 'Hello Rohan, your proposal and advance receipt have been processed.'
    });
    assert('POST /api/whatsapp/messages (Send WhatsApp Message)', waMsgRes.status === 201 && waMsgRes.data.data.wamid.startsWith('wamid_'));

    // 17. Meta Simulation Webhook
    const metaSim = await request('POST', '/simulation/meta-lead', {
      name: 'Sunita Mehra Sim',
      phone: '+919820011223',
      company_name: 'Mehra Logistics Pvt Ltd',
      campaign_name: 'Meta Ads Q4 Scaling Promo'
    });
    assert('POST /simulation/meta-lead (Simulate Meta Ad Ingestion)', metaSim.status === 200 && metaSim.data.lead.name === 'Sunita Mehra Sim');

    // 18. WhatsApp Simulation Reply
    const waSim = await request('POST', '/simulation/whatsapp-reply', {
      phone: '+919820011223',
      name: 'Sunita Mehra Sim',
      content: 'Thank you! We received the welcome message and would like to proceed.'
    });
    assert('POST /simulation/whatsapp-reply (Simulate WhatsApp Reply)', waSim.status === 200 && waSim.data.success === true);

    // 19. QR Codes Create
    const qrRes = await request('POST', '/api/qr/generate', {
      title: 'Nagpur Industrial Expo 2026 QR',
      qr_type: 'website',
      target_url: 'https://mythconnect.ai/expo-nagpur'
    });
    assert('POST /api/qr/generate (Generate Smart QR)', qrRes.status === 201 && qrRes.data.data.qr_code_id.startsWith('QR-MCAI-'));

    // 20. Digital Profile & Enquiry
    const dp = await request('GET', '/api/digital-profile');
    assert('GET /api/digital-profile', dp.status === 200 && dp.data.data.business_name === 'Mugai Tech');

    const dpEnquiry = await request('POST', '/api/digital-profile/enquiries', {
      name: 'Devendra Joshi',
      phone: '+919811223344',
      message: 'Interested in enterprise WhatsApp integration.',
      productId: 1,
      productName: 'MythConnect CRM Enterprise Suite'
    });
    assert('POST /api/digital-profile/enquiries (Digital Profile Enquiry Pipeline)', dpEnquiry.status === 201 && dpEnquiry.data.data.name === 'Devendra Joshi');

    // 21. Settings
    const setRes = await request('POST', '/api/settings', {
      company_name: 'Myth Connect.ai Technologies Pvt Ltd',
      support_sla_hours: '2'
    });
    assert('POST /api/settings (Update Settings)', setRes.status === 200 && setRes.data.data.company_name === 'Myth Connect.ai Technologies Pvt Ltd');

    console.log(`\n========================================`);
    console.log(`Test Summary: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Fatal test error:', err);
    process.exit(1);
  }
}

runTests();
