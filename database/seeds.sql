-- Myth Connect.ai CRM & Sales Platform
-- Production Realistic Indian Business Seed Data

SET FOREIGN_KEY_CHECKS = 0;

-- Roles
INSERT INTO roles (id, name, display_name, description) VALUES
(1, 'super_admin', 'Super Admin', 'Complete control over entire platform, billing, settings and audit logs'),
(2, 'admin', 'Admin', 'Business operations, team management, and global pipeline configuration'),
(3, 'sales_manager', 'Sales Manager', 'Leads distribution, sales pipeline monitoring, and performance reports'),
(4, 'sales_executive', 'Sales Executive', 'Assigned lead outreach, WhatsApp messaging, and quotation generation'),
(5, 'accounts', 'Accounts', 'Invoices, payments collection, tax reports, and client billing');

-- Teams
INSERT INTO teams (id, name, code, description) VALUES
(1, 'Enterprise Sales Team', 'TEAM-ENT', 'High-ticket B2B tech and automation implementations'),
(2, 'Retail & SMB Team', 'TEAM-SMB', 'Mid-market retailers and regional wholesale distributors');

-- Users (Default password hashed: 'Secret123!')
INSERT INTO users (id, name, email, phone, password, role_id, team_id, avatar_url, is_active) VALUES
(1, 'Aravind Swaminathan', 'admin@mythconnect.ai', '+919876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 1, 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 1),
(2, 'Priya Narayanan', 'priya.n@mythconnect.ai', '+919840112233', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 1, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 1),
(3, 'Vikram Malhotra', 'vikram.m@mythconnect.ai', '+919820334455', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 1, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 1),
(4, 'Sneha Kulkarni', 'sneha.k@mythconnect.ai', '+919811556677', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 2, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 1),
(5, 'Rohan Deshmukh', 'rohan.d@mythconnect.ai', '+919833778899', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 1, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 1);

-- Lead Sources
INSERT INTO lead_sources (id, name, code, color) VALUES
(1, 'Meta Lead Ads (Facebook & Instagram)', 'meta', '#1565E8'),
(2, 'WhatsApp Inbound', 'whatsapp', '#00A86B'),
(3, 'Website Form', 'website', '#F5A000'),
(4, 'Direct Referral', 'referral', '#0B1F3A'),
(5, 'Manual / Direct Outreach', 'manual', '#64748B');

-- Lead Statuses (Pipeline Stages)
INSERT INTO lead_statuses (id, name, code, order_index, color, is_won, is_lost) VALUES
(1, 'New', 'new', 1, '#1565E8', 0, 0),
(2, 'Contacted', 'contacted', 2, '#3B82F6', 0, 0),
(3, 'Qualified', 'qualified', 3, '#8B5CF6', 0, 0),
(4, 'Quotation', 'quotation', 4, '#F5A000', 0, 0),
(5, 'Negotiation', 'negotiation', 5, '#EC4899', 0, 0),
(6, 'Won', 'won', 6, '#00A86B', 1, 0),
(7, 'Lost', 'lost', 7, '#EF1D2D', 0, 1);

-- Products & Services
INSERT INTO products (id, item_code, name, type, description, unit, unit_price, tax_rate, hsn_sac) VALUES
(1, 'PROD-MCAI-ENT', 'MythConnect CRM Enterprise Suite', 'service', 'End-to-end Meta & WhatsApp multi-agent omnichannel CRM with workflow automations', 'annual_license', 75000.00, 18.00, '998313'),
(2, 'PROD-WA-BOT', 'WhatsApp Cloud API Interactive Bot', 'service', 'Custom WhatsApp chatbot flow with automated catalog and payment gateway link', 'setup', 25000.00, 18.00, '998314'),
(3, 'PROD-META-SYNC', 'Meta Ads Realtime Lead Sync Connector', 'service', 'Instant Facebook & Instagram webhooks processor with zero-latency CRM push', 'addon', 12000.00, 18.00, '998315'),
(4, 'PROD-QR-DYNAMIC', 'Dynamic Smart QR Management Module', 'service', 'Branded trackable dynamic QR codes with analytics and UTM forwarding', 'annual', 8500.00, 18.00, '998319'),
(5, 'PROD-CONSULT', 'Sales Pipeline & Workflow Optimization', 'service', 'Dedicated sales workflow coaching and agent training (4 sessions)', 'project', 35000.00, 18.00, '998311');

-- Customers (5 Indian B2B companies)
INSERT INTO customers (id, customer_code, name, company_name, email, phone, address, city, state, pincode, gstin, total_orders, total_revenue, outstanding_balance, assigned_to, created_by) VALUES
(1, 'CUST-2026-001', 'Rajesh Sharma', 'Sharma Electricals & Automation Ltd', 'rajesh@sharmaelectricals.in', '+919821045678', '402, Trade Centre, Bandra Kurla Complex', 'Mumbai', 'Maharashtra', '400051', '27AABCS1429B1Z8', 3, 185000.00, 25000.00, 4, 1),
(2, 'CUST-2026-002', 'Anita Ramachandran', 'Kaveri Organic Foods Pvt Ltd', 'anita@kaveriorganics.com', '+919841023456', '88, Mount Road, Anna Salai', 'Chennai', 'Tamil Nadu', '600002', '33AABCK2981M1ZK', 2, 115000.00, 0.00, 4, 2),
(3, 'CUST-2026-003', 'Deepak Aggarwal', 'Aggarwal Sanitary & Tiles', 'deepak@aggarwalsanitary.co.in', '+919810198765', 'Plot 14, Okhla Industrial Area Phase III', 'New Delhi', 'Delhi', '110020', '07AAACA6543D1Z2', 1, 95000.00, 15000.00, 3, 1),
(4, 'CUST-2026-004', 'Karthik Balasubramanian', 'Zenith Diagnostic Labs', 'karthik@zenithlabs.in', '+919940387654', '24, 100 Feet Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038', '29AABCZ9982E1ZS', 2, 142000.00, 32000.00, 4, 2),
(5, 'CUST-2026-005', 'Meera Venkatesh', 'Emerald Jewels & Lifestyle', 'meera@emeraldjewels.com', '+919845012398', '12, MG Road, Somajiguda', 'Hyderabad', 'Telangana', '500082', '36AABCE1122F1ZU', 1, 88500.00, 0.00, 3, 1);

-- Customer Contacts
INSERT INTO customer_contacts (id, customer_id, name, designation, phone, email, is_primary) VALUES
(1, 1, 'Sunil Sharma', 'General Manager - Procurement', '+919821045679', 'sunil@sharmaelectricals.in', 1),
(2, 2, 'R. Sundaram', 'Chief Marketing Officer', '+919841023457', 'sundaram@kaveriorganics.com', 1),
(3, 3, 'Gaurav Aggarwal', 'Operations Director', '+919810198766', 'gaurav@aggarwalsanitary.co.in', 1),
(4, 4, 'Dr. Aruna Rao', 'Managing Partner', '+919940387655', 'aruna@zenithlabs.in', 1),
(5, 5, 'K. Sridhar', 'Finance Controller', '+919845012399', 'accounts@emeraldjewels.com', 1);

-- Leads (10 Realistic Leads across stages)
INSERT INTO leads (id, lead_code, name, phone, email, company_name, lead_source_id, lead_status_id, assigned_to, estimated_value, priority, city, state, meta_lead_id, meta_campaign_name, meta_ad_name, customer_id, created_at, next_followup_at) VALUES
(1, 'LEAD-2026-101', 'Amitav Bose', '+919830012345', 'amitav@boseinfra.com', 'Bose Infrastructure Pvt Ltd', 1, 1, 4, 125000.00, 'high', 'Kolkata', 'West Bengal', 'meta_ld_98127391', 'B2B Q4 Growth Campaign', 'WhatsApp CRM Carousel Ad', NULL, NOW() - INTERVAL 2 HOUR, NOW() + INTERVAL 2 HOUR),
(2, 'LEAD-2026-102', 'Siddharth Nair', '+919847055443', 'siddharth@nairtextiles.in', 'Nair Loom & Textiles', 1, 2, 4, 75000.00, 'medium', 'Kochi', 'Kerala', 'meta_ld_87123612', 'South Region WhatsApp CRM Promo', 'Instant Lead Gen Form', NULL, NOW() - INTERVAL 5 HOUR, NOW() + INTERVAL 4 HOUR),
(3, 'LEAD-2026-103', 'Bhavna Chawla', '+919818822334', 'bhavna@chawlacosmetics.com', 'Chawla Luxury Skincare', 2, 3, 3, 95000.00, 'urgent', 'Gurugram', 'Haryana', NULL, NULL, NULL, NULL, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 1 DAY),
(4, 'LEAD-2026-104', 'Manoj Kumar Tiwari', '+919450099881', 'manoj@tiwarilogistics.in', 'Tiwari Express Cargo', 1, 4, 4, 150000.00, 'high', 'Lucknow', 'Uttar Pradesh', 'meta_ld_76123498', 'Meta IG Story Lead Form', 'Instagram Video Ad V2', NULL, NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 6 HOUR),
(5, 'LEAD-2026-105', 'Nandita Sengupta', '+919831144556', 'nandita@senguptadesigns.com', 'Sengupta Architecture Studio', 3, 5, 3, 85000.00, 'high', 'Pune', 'Maharashtra', NULL, NULL, NULL, NULL, NOW() - INTERVAL 3 DAY, NOW() + INTERVAL 1 DAY),
(6, 'LEAD-2026-106', 'Rajesh Sharma', '+919821045678', 'rajesh@sharmaelectricals.in', 'Sharma Electricals & Automation Ltd', 1, 6, 4, 185000.00, 'high', 'Mumbai', 'Maharashtra', 'meta_ld_65412398', 'Enterprise WhatsApp Automation', 'Lead Ad High Intent', 1, NOW() - INTERVAL 10 DAY, NULL),
(7, 'LEAD-2026-107', 'Anita Ramachandran', '+919841023456', 'anita@kaveriorganics.com', 'Kaveri Organic Foods Pvt Ltd', 4, 6, 4, 115000.00, 'medium', 'Chennai', 'Tamil Nadu', NULL, NULL, NULL, 2, NOW() - INTERVAL 14 DAY, NULL),
(8, 'LEAD-2026-108', 'Girish Parikh', '+919825066778', 'girish@parikhpolymers.com', 'Parikh Polymers & Pipes', 1, 7, 3, 60000.00, 'low', 'Ahmedabad', 'Gujarat', 'meta_ld_54321987', 'Industrial CRM Lead Ad', 'Facebook Feed Banner', NULL, NOW() - INTERVAL 7 DAY, NULL),
(9, 'LEAD-2026-109', 'Suresh Patel', '+919879944321', 'suresh@patelagritech.com', 'Patel AgriTech Innovations', 2, 2, 4, 110000.00, 'high', 'Surat', 'Gujarat', NULL, NULL, NULL, NULL, NOW() - INTERVAL 6 HOUR, NOW() + INTERVAL 3 HOUR),
(10, 'LEAD-2026-110', 'Pooja Iyer', '+919940177665', 'pooja@iyerconsulting.in', 'Iyer HR Solutions & Payroll', 5, 3, 3, 65000.00, 'medium', 'Coimbatore', 'Tamil Nadu', NULL, NULL, NULL, NULL, NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 2 DAY);

-- Lead Activities
INSERT INTO lead_activities (lead_id, user_id, type, title, description, created_at) VALUES
(1, 4, 'lead_created', 'Meta Lead Form Ingested', 'Captured from Facebook Campaign: B2B Q4 Growth Campaign with phone: +919830012345', NOW() - INTERVAL 2 HOUR),
(1, 4, 'whatsapp_sent', 'Automated Welcome WhatsApp Message Dispatched', 'Template: myth_lead_welcome sent via WhatsApp Cloud API', NOW() - INTERVAL 118 MINUTE),
(2, 4, 'lead_created', 'Meta Lead Ads Ingestion', 'Captured via Instagram Lead Form. Assigned to Sneha Kulkarni.', NOW() - INTERVAL 5 HOUR),
(2, 4, 'call_made', 'Initial Qualification Phone Call', 'Spoke with Siddharth. He needs WhatsApp CRM for 6 showrooms in Kerala.', NOW() - INTERVAL 3 HOUR),
(4, 4, 'quote_sent', 'Quotation QT-2026-004 Generated & Sent', 'Total quote: ₹1,50,000 for WhatsApp API + Realtime Lead Sync.', NOW() - INTERVAL 1 DAY),
(6, 4, 'deal_won', 'Lead Converted to Customer', 'Deal closed for ₹1,85,000. Converted into Customer ID CUST-2026-001.', NOW() - INTERVAL 8 DAY);

-- Lead Follow-ups (10 Followups across states)
INSERT INTO lead_followups (id, lead_id, assigned_to, scheduled_at, type, status, notes) VALUES
(1, 1, 4, NOW() + INTERVAL 2 HOUR, 'whatsapp', 'pending', 'Send personalized case study on WhatsApp and schedule live demo.'),
(2, 2, 4, NOW() + INTERVAL 4 HOUR, 'call', 'pending', 'Call back Siddharth to confirm user seats requirement.'),
(3, 3, 3, NOW() + INTERVAL 1 DAY, 'meeting', 'pending', 'Zoom product demo with Bhavna and skincare marketing team.'),
(4, 4, 4, NOW() - INTERVAL 2 HOUR, 'call', 'pending', 'OVERDUE: Follow up on Quotation QT-2026-004 terms with Manoj Tiwari.'),
(5, 5, 3, NOW() + INTERVAL 1 DAY, 'call', 'pending', 'Review revised pricing and multi-user discount options.'),
(6, 9, 4, NOW() + INTERVAL 3 HOUR, 'whatsapp', 'pending', 'Send API integration documentation for AgriTech portal.'),
(7, 10, 3, NOW() + INTERVAL 2 DAY, 'meeting', 'pending', 'In-person meeting at Coimbatore branch for contract signing.'),
(8, 6, 4, NOW() - INTERVAL 5 DAY, 'call', 'completed', 'Completed initial onboarding call with Sunil Sharma.'),
(9, 7, 4, NOW() - INTERVAL 8 DAY, 'meeting', 'completed', 'Completed final contract review with Anita Ramachandran.'),
(10, 8, 3, NOW() - INTERVAL 3 DAY, 'call', 'cancelled', 'Client opted for regional vendor with local on-premise installation.');

-- WhatsApp Templates
INSERT INTO whatsapp_templates (id, name, category, language, template_id, status, header_type, body_text, footer_text, variables) VALUES
(1, 'myth_lead_welcome', 'MARKETING', 'en', 'TMPL_MYTH_WELCOME_01', 'APPROVED', 'NONE', 'Hi {{1}}, thank you for reaching out to Myth Connect.ai! 🚀\n\nOur sales specialist {{2}} has received your request and will contact you shortly.\n\nIn the meantime, you can explore our live product overview here: https://mythconnect.ai/tour', 'Myth Connect.ai • Intelligent CRM', '["name", "agent_name"]'),
(2, 'quotation_dispatched', 'UTILITY', 'en', 'TMPL_MYTH_QUOTE_02', 'APPROVED', 'DOCUMENT', 'Dear {{1}},\n\nYour requested quotation #{{2}} from Myth Connect.ai has been generated for a total amount of ₹{{3}}.\n\nClick below to view and download your formal quote. It is valid until {{4}}.\n\nLet us know if you have any questions!', 'Reply to this chat to connect with sales', '["name", "quote_number", "amount", "valid_until"]'),
(3, 'followup_gentle_reminder', 'MARKETING', 'en', 'TMPL_MYTH_FOLLOWUP_03', 'APPROVED', 'NONE', 'Hello {{1}}, just following up on our conversation regarding {{2}}.\n\nDo you have 5 minutes today for a quick call to address any questions you might have?\n\nLooking forward to assisting you!', 'Myth Connect.ai Sales Team', '["name", "topic"]'),
(4, 'invoice_payment_receipt', 'UTILITY', 'en', 'TMPL_MYTH_PAY_04', 'APPROVED', 'DOCUMENT', 'Dear {{1}},\n\nWe have received your payment of ₹{{2}} against invoice #{{3}} via {{4}}.\n\nThank you for choosing Myth Connect.ai! Your official GST invoice receipt is attached.', 'Accounting Dept • Myth Connect.ai', '["name", "amount", "invoice_no", "payment_method"]'),
(5, 'urgent_followup_alert', 'UTILITY', 'en', 'TMPL_MYTH_ALERT_05', 'APPROVED', 'NONE', 'Attention: Your scheduled follow-up consultation with {{1}} is in 30 minutes.\n\nMeeting Link: {{2}}', 'Myth Connect.ai Calendar', '["agent_name", "link"]');

-- WhatsApp Automation Rules
INSERT INTO whatsapp_automation_rules (id, name, trigger_event, template_id, delay_minutes, is_active) VALUES
(1, 'Instant Welcome Message on Meta Lead Capture', 'new_meta_lead', 1, 0, 1),
(2, 'Auto WhatsApp Quote Notification', 'quotation_sent', 2, 0, 1),
(3, 'Follow-up Nudge 24h Before Expiry', 'followup_reminder', 3, 1440, 1),
(4, 'Automated Payment Confirmation Receipt', 'payment_reminder', 4, 0, 1);

-- WhatsApp Conversations (5 Realistic Active Chats)
INSERT INTO whatsapp_conversations (id, phone, name, lead_id, customer_id, assigned_to, last_message, last_message_at, unread_count) VALUES
(1, '+919830012345', 'Amitav Bose', 1, NULL, 4, 'Thanks Sneha! Yes, our marketing manager will join the call today.', NOW() - INTERVAL 12 MINUTE, 1),
(2, '+919847055443', 'Siddharth Nair', 2, NULL, 4, 'Can your CRM automatically tag leads arriving from our Instagram Story ads?', NOW() - INTERVAL 45 MINUTE, 0),
(3, '+919818822334', 'Bhavna Chawla', 3, NULL, 3, 'Can you send the product deck along with GST compliance details?', NOW() - INTERVAL 2 HOUR, 2),
(4, '+919821045678', 'Rajesh Sharma', 6, 1, 4, 'Payment of ₹50,000 transferred via NEFT. Reference sent via email.', NOW() - INTERVAL 4 HOUR, 0),
(5, '+919879944321', 'Suresh Patel', 9, NULL, 4, 'Received the link. Looking forward to testing the dynamic QR codes.', NOW() - INTERVAL 6 HOUR, 0);

-- WhatsApp Messages
INSERT INTO whatsapp_messages (id, conversation_id, wamid, sender_type, sender_id, message_type, content, status, created_at) VALUES
(1, 1, 'wamid_meta_001', 'system', NULL, 'template', 'Hi Amitav Bose, thank you for reaching out to Myth Connect.ai! 🚀 Our sales specialist Sneha Kulkarni has received your request and will contact you shortly.', 'read', NOW() - INTERVAL 118 MINUTE),
(2, 1, 'wamid_agent_002', 'agent', 4, 'text', 'Hello Amitav! I am Sneha from Myth Connect.ai. I noticed you are interested in Meta lead automation. Are you available for a 10-minute briefing at 3:00 PM?', 'read', NOW() - INTERVAL 60 MINUTE),
(3, 1, 'wamid_cust_003', 'customer', NULL, 'text', 'Thanks Sneha! Yes, our marketing manager will join the call today.', 'delivered', NOW() - INTERVAL 12 MINUTE),
(4, 2, 'wamid_meta_004', 'system', NULL, 'template', 'Hi Siddharth Nair, thank you for reaching out to Myth Connect.ai! 🚀', 'read', NOW() - INTERVAL 4 HOUR),
(5, 2, 'wamid_cust_005', 'customer', NULL, 'text', 'Can your CRM automatically tag leads arriving from our Instagram Story ads?', 'read', NOW() - INTERVAL 45 MINUTE),
(6, 2, 'wamid_agent_006', 'agent', 4, 'text', 'Yes absolutely Siddharth! Every Instagram Lead Ad form maps directly into customized tags and auto-routes to your showrooms.', 'sent', NOW() - INTERVAL 40 MINUTE);

-- Quotations (5 Realistic Quotations)
INSERT INTO quotations (id, quotation_number, lead_id, customer_id, quotation_date, valid_until, subtotal, discount_amount, tax_amount, grand_total, status, notes, terms_and_conditions) VALUES
(1, 'QT-2026-001', 6, 1, '2026-10-05', '2026-11-05', 160000.00, 10000.00, 27000.00, 177000.00, 'accepted', 'Annual license for Sharma Electricals headquarters & warehouse branches.', 'Payment terms: 50% advance, 50% upon deployment. Includes 12 months SLA support.'),
(2, 'QT-2026-002', 7, 2, '2026-10-08', '2026-11-08', 100000.00, 5000.00, 17100.00, 112100.00, 'accepted', 'Omnichannel WhatsApp bot and lead sync integration.', 'Standard 1 year cloud hosting and Meta API maintenance included.'),
(3, 'QT-2026-003', NULL, 3, '2026-10-12', '2026-11-12', 85000.00, 0.00, 15300.00, 100300.00, 'sent', 'CRM multi-agent setup for Delhi sanitary showrooms.', 'Valid for 30 days from generation date.'),
(4, 'QT-2026-004', 4, 1, '2026-10-18', '2026-11-18', 125000.00, 12500.00, 20250.00, 132750.00, 'sent', 'Special festive enterprise package with priority WhatsApp verified sender.', 'GST 18% applicable as per Indian tax laws.'),
(5, 'QT-2026-005', 5, 2, '2026-10-20', '2026-11-20', 75000.00, 0.00, 13500.00, 88500.00, 'draft', 'Preliminary quotation for studio lead routing and automated PDF generation.', 'Draft stage, pending final user approval.');

-- Quotation Items
INSERT INTO quotation_items (quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total) VALUES
(1, 1, 'MythConnect CRM Enterprise Suite (10 Users)', 1.00, 75000.00, 0.00, 18.00, 88500.00),
(1, 2, 'WhatsApp Cloud API Interactive Bot Flow', 2.00, 25000.00, 10.00, 18.00, 53100.00),
(1, 5, 'Sales Pipeline & Workflow Optimization Training', 1.00, 35000.00, 0.00, 18.00, 41300.00),
(2, 1, 'MythConnect CRM Professional Suite (5 Users)', 1.00, 75000.00, 0.00, 18.00, 88500.00),
(2, 3, 'Meta Ads Realtime Lead Sync Connector', 1.00, 12000.00, 0.00, 18.00, 14160.00),
(4, 1, 'MythConnect CRM Enterprise Suite', 1.00, 75000.00, 10.00, 18.00, 79650.00),
(4, 2, 'WhatsApp Cloud API Interactive Bot', 2.00, 25000.00, 10.00, 18.00, 53100.00);

-- Invoices (5 Realistic Invoices)
INSERT INTO invoices (id, invoice_number, quotation_id, customer_id, invoice_date, due_date, subtotal, discount_amount, tax_amount, grand_total, paid_amount, balance_amount, payment_status, notes) VALUES
(1, 'INV-2026-001', 1, 1, '2026-10-06', '2026-10-20', 160000.00, 10000.00, 27000.00, 177000.00, 152000.00, 25000.00, 'partially_paid', 'Advance 50% plus milestone 1 paid. Final balance ₹25,000 due upon final signoff.'),
(2, 'INV-2026-002', 2, 2, '2026-10-09', '2026-10-23', 100000.00, 5000.00, 17100.00, 112100.00, 112100.00, 0.00, 'paid', 'Fully settled via HDFC Bank NEFT.'),
(3, 'INV-2026-003', NULL, 3, '2026-10-10', '2026-10-24', 80000.00, 0.00, 14400.00, 94400.00, 79400.00, 15000.00, 'partially_paid', 'Part payment received via UPI.'),
(4, 'INV-2026-004', NULL, 4, '2026-10-01', '2026-10-15', 120000.00, 0.00, 21600.00, 141600.00, 109600.00, 32000.00, 'overdue', 'OVERDUE: Payment overdue by 7 days. Automated payment reminder sent on WhatsApp.'),
(5, 'INV-2026-005', NULL, 5, '2026-10-15', '2026-10-29', 75000.00, 0.00, 13500.00, 88500.00, 88500.00, 0.00, 'paid', 'Paid in full via ICICI Corporate Gateway.');

-- Invoice Items
INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total) VALUES
(1, 1, 'MythConnect CRM Enterprise Suite', 1.00, 75000.00, 0.00, 18.00, 88500.00),
(1, 2, 'WhatsApp Cloud API Interactive Bot Flow', 2.00, 25000.00, 10.00, 18.00, 53100.00),
(2, 1, 'MythConnect CRM Professional Suite', 1.00, 75000.00, 0.00, 18.00, 88500.00),
(2, 3, 'Meta Ads Realtime Lead Sync Connector', 1.00, 12000.00, 0.00, 18.00, 14160.00);

-- Payments
INSERT INTO payments (payment_number, invoice_id, customer_id, amount, payment_date, payment_method, reference_number, notes, recorded_by) VALUES
('PAY-2026-001', 1, 1, 88500.00, '2026-10-06', 'bank_transfer', 'NEFT-HDFC-9912034', '50% Initial Project Advance', 5),
('PAY-2026-002', 1, 1, 63500.00, '2026-10-14', 'bank_transfer', 'NEFT-HDFC-9934120', 'Milestone 1 Deployment signoff', 5),
('PAY-2026-003', 2, 2, 112100.00, '2026-10-09', 'bank_transfer', 'RTGS-ICICI-881293', 'Full Settlement for CRM + Meta Sync', 5),
('PAY-2026-004', 3, 3, 79400.00, '2026-10-11', 'upi', 'UPI/291823901/sbi', 'Showrooms initial rollout advance', 5),
('PAY-2026-005', 5, 5, 88500.00, '2026-10-16', 'card', 'TXN_RAZORPAY_881923', 'Online Credit Card Payment', 5);

-- QR Codes
INSERT INTO qr_codes (id, qr_code_id, title, qr_type, payload_data, target_url, scan_count, download_count, foreground_color, background_color) VALUES
(1, 'QR-MCAI-WA01', 'Direct WhatsApp Sales Chat - Head Office', 'whatsapp', 'https://wa.me/919876543210?text=Hi%20MythConnect,%20I%20am%20interested%20in%20a%20CRM%20demo', 'https://wa.me/919876543210', 432, 85, '#0B1F3A', '#FFFFFF'),
(2, 'QR-MCAI-UPI01', 'Official UPI Billing QR (Myth Connect HDFC)', 'upi', 'upi://pay?pa=mythconnect@hdfcbank&pn=MythConnectAI&cu=INR', NULL, 189, 42, '#1565E8', '#FFFFFF'),
(3, 'QR-MCAI-FORM01', 'Meta Lead Ads Exhibition Booth Form', 'lead_form', 'https://mythconnect.ai/leads/booth-delhi-2026', 'https://mythconnect.ai/leads/booth-delhi-2026', 764, 120, '#00A86B', '#FFFFFF'),
(4, 'QR-MCAI-WEB01', 'Company Website & SaaS Documentation', 'website', 'https://mythconnect.ai/enterprise', 'https://mythconnect.ai/enterprise', 1250, 210, '#0B1F3A', '#FFFFFF');

-- Notifications
INSERT INTO notifications (user_id, type, title, message, action_url, is_read) VALUES
(4, 'meta_lead_created', '🔥 New Meta Lead Ingested', 'Amitav Bose (+919830012345) submitted Facebook Lead Form: B2B Q4 Growth Campaign.', '/leads/1', 0),
(4, 'whatsapp_message_received', '💬 New WhatsApp Reply from Amitav Bose', '"Thanks Sneha! Yes, our marketing manager will join the call today."', '/whatsapp?lead=1', 0),
(4, 'followup_due', '⏰ Follow-up Due in 30 Minutes', 'Scheduled call with Siddharth Nair regarding WhatsApp showrooms rollout.', '/followups', 0),
(3, 'followup_overdue', '⚠️ Overdue Follow-up Alert', 'Quotation follow-up with Manoj Tiwari is overdue by 2 hours.', '/followups', 0),
(5, 'payment_received', '💰 ₹63,500 Payment Recorded', 'Received from Sharma Electricals against Invoice #INV-2026-001.', '/invoices/1', 1);

-- Settings
INSERT INTO settings (`key`, `value`, `group`, is_secret) VALUES
('company_name', 'Myth Connect.ai Technologies Pvt Ltd', 'company', 0),
('company_tagline', 'CONNECT | CONVERT | AUTOMATE | SALES', 'company', 0),
('company_email', 'contact@mythconnect.ai', 'company', 0),
('company_phone', '+91 (080) 4567 8900', 'company', 0),
('company_address', 'Level 5, Myth Towers, Outer Ring Road, Bellandur, Bengaluru, KA 560103', 'company', 0),
('company_gstin', '29AABCM9981K1ZP', 'company', 0),
('currency_symbol', '₹', 'general', 0),
('currency_code', 'INR', 'general', 0),
('meta_app_id', '109823487192834', 'meta', 0),
('meta_page_id', '104829104812394', 'meta', 0),
('meta_webhook_verified', 'true', 'meta', 0),
('whatsapp_phone_number_id', '108492019482910', 'whatsapp', 0),
('whatsapp_business_account_id', '391048201948201', 'whatsapp', 0),
('whatsapp_webhook_verified', 'true', 'whatsapp', 0),
('whatsapp_auto_reply_enabled', 'true', 'whatsapp', 0);

SET FOREIGN_KEY_CHECKS = 1;
