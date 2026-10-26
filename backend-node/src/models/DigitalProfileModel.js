const db = require('../config/db');

class DigitalProfileModel {
  static async ensureDefaultProfile() {
    const rows = await db.query('SELECT * FROM digital_profiles LIMIT 1');
    if (rows.length > 0) return rows[0];

    // Seed default profile
    const insertSql = `
      INSERT INTO digital_profiles (
        id, user_id, slug, status, business_name, person_name,
        designation, business_category, short_description, about,
        profile_photo_url, business_logo_url, cover_banner_url,
        phone, whatsapp, email, website, address, city, state, country, pincode,
        google_maps_url, google_review_url, smart_qr_id,
        views_count, unique_visitors, qr_scans_count, enquiries_count
      ) VALUES (
        1, 1, 'mugai-tech', 'published', 'Mugai Tech', 'Rajiv Mehra',
        'Managing Director & CTO', 'IT Solutions, Web & Mobile App Development',
        'Empowering enterprises with next-gen digital business cards, cloud CRM software, and omnichannel automation.',
        'Mugai Tech is an award-winning technology powerhouse specialized in architecting enterprise web & mobile platforms, high-conversion WhatsApp CRM automation, and next-gen smart digital business cards.',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200',
        '+919876543210', '+919876543210', 'contact@mugaitech.com', 'https://mugaitech.com',
        'Plot 402, Trade Centre, BKC, Bandra East', 'Mumbai', 'Maharashtra', 'India', '400051',
        'https://maps.google.com/?q=Bandra+Kurla+Complex+Mumbai',
        'https://search.google.com/local/writereview?placeid=ChIJwe1EZjDG5zsRaY_0xW6',
        'QR-DP-MUGAI01', 2480, 1820, 640, 86
      )
    `;
    await db.query(insertSql);

    // Seed business hours
    const days = [
      ['Monday', 0, '09:30', '19:00'],
      ['Tuesday', 0, '09:30', '19:00'],
      ['Wednesday', 0, '09:30', '19:00'],
      ['Thursday', 0, '09:30', '19:00'],
      ['Friday', 0, '09:30', '19:00'],
      ['Saturday', 0, '10:00', '17:00'],
      ['Sunday', 1, '00:00', '00:00']
    ];
    for (const [day, isClosed, open, close] of days) {
      await db.query(
        'INSERT INTO digital_profile_hours (profile_id, day_of_week, is_closed, open_time, close_time) VALUES (1, ?, ?, ?, ?)',
        [day, isClosed, open, close]
      );
    }

    // Seed social links
    const socials = [
      ['whatsapp', 'https://wa.me/919876543210', 'WhatsApp Official', 1],
      ['linkedin', 'https://linkedin.com/company/mugai-tech', 'LinkedIn Company', 2],
      ['instagram', 'https://instagram.com/mugaitech', 'Instagram @mugaitech', 3],
      ['facebook', 'https://facebook.com/mugaitech', 'Facebook Page', 4],
      ['youtube', 'https://youtube.com/@mugaitech', 'YouTube Channel', 5],
      ['website', 'https://mugaitech.com', 'Corporate Portal', 6]
    ];
    for (const [platform, url, displayName, order] of socials) {
      await db.query(
        'INSERT INTO digital_profile_social_links (profile_id, platform, url, display_name, display_order) VALUES (1, ?, ?, ?, ?)',
        [platform, url, displayName, order]
      );
    }

    // Seed services
    const services = [
      ['Enterprise Web Application Development', 'Bespoke high-scale web platforms engineered with modern frameworks, cloud architectures, and microservices.', 75000, 'Globe', 'Get Quote', 1],
      ['Mobile App Development (iOS & Android)', 'Native and cross-platform mobile apps featuring real-time synchronization, offline support, and intuitive UX.', 95000, 'Smartphone', 'Enquire', 2],
      ['WhatsApp Automation & CRM Setup', 'Official WhatsApp Business Cloud API integration with AI chat agents, dynamic pipelines, and broadcast messaging.', 25000, 'MessageSquare', 'Book Demo', 3],
      ['Digital Marketing & Lead Generation', 'Targeted Meta and Google Ads campaigns with automated webhook synchronization and high-converting landing pages.', 35000, 'TrendingUp', 'Start Now', 4]
    ];
    for (const [title, desc, price, icon, cta, order] of services) {
      await db.query(
        'INSERT INTO digital_profile_services (profile_id, title, description, starting_price, icon_name, cta_text, display_order) VALUES (1, ?, ?, ?, ?, ?, ?)',
        [title, desc, price, icon, cta, order]
      );
    }

    const seeded = await db.query('SELECT * FROM digital_profiles WHERE id = 1');
    return seeded[0];
  }

  static async getProfile(slug = 'mugai-tech') {
    await this.ensureDefaultProfile();
    const rows = await db.query('SELECT * FROM digital_profiles WHERE slug = ? OR id = 1 LIMIT 1', [slug]);
    if (!rows.length) return null;

    const profile = rows[0];
    profile.business_hours = await db.query('SELECT day_of_week AS day, is_closed, open_time, close_time FROM digital_profile_hours WHERE profile_id = ?', [profile.id]);
    profile.social_links = await db.query('SELECT id, platform, url, display_name, is_active AS enabled, display_order FROM digital_profile_social_links WHERE profile_id = ? ORDER BY display_order ASC', [profile.id]);
    profile.services = await db.query('SELECT id, title, description, starting_price, icon_name, cta_text, is_active AS enabled FROM digital_profile_services WHERE profile_id = ? ORDER BY display_order ASC', [profile.id]);
    profile.catalogues = await db.query('SELECT id, title, description, file_url, cover_image, file_size, is_active AS enabled FROM digital_profile_catalogues WHERE profile_id = ?', [profile.id]);

    return profile;
  }

  static async updateProfile(id, patch) {
    await this.ensureDefaultProfile();
    const allowed = [
      'business_name', 'person_name', 'designation', 'business_category',
      'short_description', 'about', 'phone', 'whatsapp', 'email', 'website',
      'address', 'city', 'state', 'pincode', 'google_maps_url', 'google_review_url',
      'status', 'theme', 'primary_color', 'secondary_color', 'views_count',
      'unique_visitors', 'qr_scans_count', 'enquiries_count'
    ];

    const updates = [];
    const values = [];

    for (const k of allowed) {
      if (patch[k] !== undefined) {
        updates.push(`${k} = ?`);
        values.push(patch[k]);
      }
    }

    if (updates.length > 0) {
      values.push(id || 1);
      await db.query(`UPDATE digital_profiles SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    }

    return this.getProfile();
  }

  static async recordAnalyticsEvent(eventData) {
    const { profile_id = 1, event_type, target_id, device, browser, os, ip_address, referrer } = eventData;

    await db.query(`
      INSERT INTO digital_profile_analytics (
        profile_id, event_type, target_id, device, browser, os, ip_address, referrer
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      profile_id,
      event_type,
      target_id || null,
      device || 'Desktop',
      browser || null,
      os || null,
      ip_address || null,
      referrer || null
    ]);

    // Aggregate counters
    if (event_type === 'view') {
      await db.query('UPDATE digital_profiles SET views_count = views_count + 1, unique_visitors = unique_visitors + 1 WHERE id = ?', [profile_id]);
    } else if (event_type === 'qr_scan') {
      await db.query('UPDATE digital_profiles SET qr_scans_count = qr_scans_count + 1 WHERE id = ?', [profile_id]);
    }

    return { success: true };
  }

  static async createEnquiry(data) {
    const profile = await this.getProfile();
    const isProduct = Boolean(data.productId);
    const productName = data.productName || (isProduct ? `Product #${data.productId}` : null);

    // Increment profile enquiry counter
    await db.query('UPDATE digital_profiles SET enquiries_count = enquiries_count + 1 WHERE id = ?', [profile.id]);

    // Insert lead
    const countRows = await db.query('SELECT COUNT(*) AS total FROM leads');
    const seq = (countRows[0]?.total || 0) + 101;
    const year = new Date().getFullYear();
    const lead_code = `LEAD-${year}-${seq}`;

    const leadName = data.name;
    const phone = data.phone;
    const email = data.email || `${leadName.toLowerCase().replace(/\s+/g, '')}@example.com`;
    const company = isProduct ? `${leadName} (Enquiry: ${productName})` : `${leadName} (Digital Profile Visitor)`;
    const estValue = isProduct ? 75000 : 45000;

    const res = await db.query(`
      INSERT INTO leads (
        lead_code, name, phone, email, company_name,
        lead_source_id, lead_status_id, assigned_to,
        estimated_value, priority, city, state,
        created_by
      ) VALUES (?, ?, ?, ?, ?, 1, 1, 4, ?, 'high', 'Mumbai', 'Maharashtra', 1)
    `, [lead_code, leadName, phone, email, company, estValue]);

    const leadId = res.insertId;

    // Schedule 2-hour followup
    const scheduledAt = new Date(Date.now() + 2 * 3600000).toISOString().slice(0, 19).replace('T', ' ');
    const notes = isProduct
      ? `Product enquiry from Digital Profile for "${productName}". Qty: ${data.quantity || 1}. Message: "${data.message || ''}".`
      : `General business inquiry from Digital Profile. Message: "${data.message || ''}".`;

    await db.query(`
      INSERT INTO lead_followups (lead_id, assigned_to, scheduled_at, type, status, notes, created_by)
      VALUES (?, 4, ?, 'whatsapp', 'pending', ?, 1)
    `, [leadId, scheduledAt, notes]);

    // Log activity
    await db.query(`
      INSERT INTO lead_activities (lead_id, user_id, type, title, description)
      VALUES (?, 4, 'lead_created', 'Digital Profile Enquiry', ?)
    `, [leadId, notes]);

    const leadRow = await db.query('SELECT * FROM leads WHERE id = ?', [leadId]);
    return leadRow[0];
  }

  static async getProducts() {
    return db.query('SELECT * FROM products WHERE is_active = 1 ORDER BY id ASC');
  }

  static async createProduct(data) {
    const countRows = await db.query('SELECT COUNT(*) AS total FROM products');
    const seq = (countRows[0]?.total || 0) + 1;
    const item_code = data.item_code || `PROD-NEW-${seq}`;

    const res = await db.query(`
      INSERT INTO products (
        item_code, name, type, description, unit,
        unit_price, tax_rate, hsn_sac, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      item_code,
      data.name,
      data.type || 'service',
      data.description || null,
      data.unit || 'unit',
      data.unit_price || 0,
      data.tax_rate !== undefined ? data.tax_rate : 18,
      data.hsn_sac || null
    ]);

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [res.insertId]);
    return rows[0];
  }

  static async updateProduct(id, data) {
    const fields = ['name', 'type', 'description', 'unit', 'unit_price', 'tax_rate', 'hsn_sac', 'is_active'];
    const updates = [];
    const values = [];

    for (const f of fields) {
      if (data[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(data[f]);
      }
    }

    if (updates.length > 0) {
      values.push(id);
      await db.query(`UPDATE products SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    }

    const rows = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return rows[0];
  }

  static async deleteProduct(id) {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return { success: true, id };
  }
}

module.exports = DigitalProfileModel;
