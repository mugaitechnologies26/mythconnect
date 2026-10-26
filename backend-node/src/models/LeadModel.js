const db = require('../config/db');
const { toSqlDatetime } = require('../utils/dateHelper');

class LeadModel {
  static async getAll({ search = '', source = '', status = '', limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT 
        l.id, l.lead_code, l.name, l.phone, l.email, l.company_name,
        l.lead_source_id AS source_id, ls.name AS source_name, ls.code AS source_code, ls.color AS source_color,
        l.lead_status_id AS status_id, lst.name AS status_name, lst.code AS status_code, lst.color AS status_color,
        l.assigned_to, u.name AS assigned_user_name,
        l.estimated_value, l.priority, l.city, l.state,
        l.meta_lead_id, l.meta_campaign_name, l.meta_ad_name,
        l.customer_id, l.last_contacted_at, l.next_followup_at, l.converted_at,
        l.created_at, l.updated_at
      FROM leads l
      LEFT JOIN lead_sources ls ON l.lead_source_id = ls.id
      LEFT JOIN lead_statuses lst ON l.lead_status_id = lst.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.deleted_at IS NULL
    `;
    const params = [];

    if (search) {
      sql += ` AND (l.name LIKE ? OR l.phone LIKE ? OR l.email LIKE ? OR l.company_name LIKE ? OR l.lead_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    if (source && source !== 'all') {
      sql += ` AND ls.code = ?`;
      params.push(source);
    }

    if (status && status !== 'all') {
      sql += ` AND lst.code = ?`;
      params.push(status);
    }

    sql += ` ORDER BY l.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    return db.query(sql, params);
  }

  static async getById(id) {
    const sql = `
      SELECT 
        l.id, l.lead_code, l.name, l.phone, l.email, l.company_name,
        l.lead_source_id AS source_id, ls.name AS source_name, ls.code AS source_code, ls.color AS source_color,
        l.lead_status_id AS status_id, lst.name AS status_name, lst.code AS status_code, lst.color AS status_color,
        l.assigned_to, u.name AS assigned_user_name,
        l.estimated_value, l.priority, l.city, l.state,
        l.meta_lead_id, l.meta_campaign_name, l.meta_ad_name,
        l.customer_id, l.last_contacted_at, l.next_followup_at, l.converted_at,
        l.created_at, l.updated_at
      FROM leads l
      LEFT JOIN lead_sources ls ON l.lead_source_id = ls.id
      LEFT JOIN lead_statuses lst ON l.lead_status_id = lst.id
      LEFT JOIN users u ON l.assigned_to = u.id
      WHERE l.id = ? AND l.deleted_at IS NULL
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    // Generate sequential lead code: LEAD-YYYY-XXX
    const countRows = await db.query('SELECT COUNT(*) AS total FROM leads');
    const seq = (countRows[0]?.total || 0) + 101;
    const year = new Date().getFullYear();
    const lead_code = data.lead_code || `LEAD-${year}-${seq}`;

    // Resolve source_id
    let source_id = data.lead_source_id || data.source_id;
    if (!source_id && data.source_code) {
      const srcRows = await db.query('SELECT id FROM lead_sources WHERE code = ? LIMIT 1', [data.source_code]);
      source_id = srcRows[0]?.id;
    }
    source_id = source_id || 1; // Default to Meta Lead Ads

    // Resolve status_id
    let status_id = data.lead_status_id || data.status_id;
    if (!status_id && data.status_code) {
      const stRows = await db.query('SELECT id FROM lead_statuses WHERE code = ? LIMIT 1', [data.status_code]);
      status_id = stRows[0]?.id;
    }
    status_id = status_id || 1; // Default to 'New'

    // Avoid duplicate insertions if meta_lead_id already exists
    if (data.meta_lead_id) {
      const existing = await db.query('SELECT id FROM leads WHERE meta_lead_id = ? LIMIT 1', [data.meta_lead_id]);
      if (existing && existing.length > 0) {
        return this.getById(existing[0].id);
      }
    }

    const assigned_to = data.assigned_to || 4; // Default to Sneha Kulkarni
    const next_followup_at = toSqlDatetime(data.next_followup_at);

    const insertSql = `
      INSERT INTO leads (
        lead_code, name, phone, email, company_name,
        lead_source_id, lead_status_id, assigned_to,
        estimated_value, priority, city, state,
        meta_lead_id, meta_campaign_name, meta_ad_name,
        customer_id, next_followup_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await db.query(insertSql, [
      lead_code,
      data.name,
      data.phone,
      data.email || null,
      data.company_name || null,
      source_id,
      status_id,
      assigned_to,
      data.estimated_value || 0,
      data.priority || 'medium',
      data.city || null,
      data.state || null,
      data.meta_lead_id || null,
      data.meta_campaign_name || data.campaign_name || null,
      data.meta_ad_name || data.ad_name || null,
      data.customer_id || null,
      next_followup_at,
      data.created_by || 1
    ]);

    const newId = result.insertId;

    // Log lead creation activity
    await db.query(`
      INSERT INTO lead_activities (lead_id, user_id, type, title, description)
      VALUES (?, ?, 'lead_created', 'Lead Registered', ?)
    `, [newId, assigned_to, `Lead ${lead_code} registered for ${data.name}.`]);

    return this.getById(newId);
  }

  static async update(id, patch) {
    const allowedFields = [
      'name', 'phone', 'email', 'company_name', 'estimated_value',
      'priority', 'city', 'state', 'assigned_to', 'next_followup_at',
      'last_contacted_at', 'customer_id'
    ];

    const updates = [];
    const values = [];

    for (const key of allowedFields) {
      if (patch[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(patch[key]);
      }
    }

    if (patch.lead_source_id !== undefined || patch.source_id !== undefined) {
      updates.push('lead_source_id = ?');
      values.push(patch.lead_source_id || patch.source_id);
    }

    if (patch.lead_status_id !== undefined || patch.status_id !== undefined) {
      updates.push('lead_status_id = ?');
      values.push(patch.lead_status_id || patch.status_id);
    }

    if (updates.length === 0) return this.getById(id);

    values.push(id);
    const sql = `UPDATE leads SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    await db.query(sql, values);

    return this.getById(id);
  }

  static async updateStage(id, status_code_or_id) {
    let statusId;
    if (typeof status_code_or_id === 'number' || !isNaN(status_code_or_id)) {
      statusId = Number(status_code_or_id);
    } else {
      const rows = await db.query('SELECT id FROM lead_statuses WHERE code = ? LIMIT 1', [status_code_or_id]);
      if (!rows.length) throw new Error(`Unknown status code: ${status_code_or_id}`);
      statusId = rows[0].id;
    }

    await db.query(`
      UPDATE leads 
      SET lead_status_id = ?, 
          last_contacted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [statusId, id]);

    // Record activity
    const statusRow = await db.query('SELECT name FROM lead_statuses WHERE id = ?', [statusId]);
    const statusName = statusRow[0]?.name || status_code_or_id;

    await db.query(`
      INSERT INTO lead_activities (lead_id, user_id, type, title, description)
      VALUES (?, 4, 'status_change', 'Pipeline Stage Updated', ?)
    `, [id, `Stage changed to "${statusName}".`]);

    return this.getById(id);
  }

  static async delete(id) {
    // Soft delete
    await db.query('UPDATE leads SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return { success: true, id };
  }

  static async addNote(leadId, userId, note) {
    const res = await db.query(
      'INSERT INTO lead_notes (lead_id, user_id, note) VALUES (?, ?, ?)',
      [leadId, userId || 1, note]
    );
    return { id: res.insertId, lead_id: leadId, note, created_at: new Date().toISOString() };
  }

  static async getNotes(leadId) {
    return db.query(`
      SELECT ln.id, ln.lead_id, ln.user_id, ln.note, ln.created_at, u.name AS user_name
      FROM lead_notes ln
      LEFT JOIN users u ON ln.user_id = u.id
      WHERE ln.lead_id = ?
      ORDER BY ln.id DESC
    `, [leadId]);
  }

  static async getActivities(leadId) {
    return db.query(`
      SELECT la.id, la.lead_id, la.user_id, la.type, la.title, la.description, la.created_at, u.name AS user_name
      FROM lead_activities la
      LEFT JOIN users u ON la.user_id = u.id
      WHERE la.lead_id = ?
      ORDER BY la.id DESC
    `, [leadId]);
  }

  static async convertToCustomer(leadId) {
    return db.transaction(async (conn) => {
      const [leadRows] = await conn.query('SELECT * FROM leads WHERE id = ?', [leadId]);
      if (!leadRows.length) throw new Error('Lead not found');
      const lead = leadRows[0];

      // Check if already converted
      if (lead.customer_id) {
        const [existing] = await conn.query('SELECT * FROM customers WHERE id = ?', [lead.customer_id]);
        return existing[0];
      }

      // Generate customer code
      const [cRows] = await conn.query('SELECT COUNT(*) AS total FROM customers');
      const seq = String((cRows[0]?.total || 0) + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      const customer_code = `CUST-${year}-${seq}`;

      const [cResult] = await conn.query(`
        INSERT INTO customers (
          customer_code, name, company_name, email, phone,
          city, state, total_orders, total_revenue, outstanding_balance,
          assigned_to, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, 0.00, ?, ?)
      `, [
        customer_code,
        lead.name,
        lead.company_name || `${lead.name} Enterprises`,
        lead.email || null,
        lead.phone,
        lead.city || 'Mumbai',
        lead.state || 'Maharashtra',
        lead.estimated_value || 0,
        lead.assigned_to || 4,
        1
      ]);

      const customerId = cResult.insertId;

      // Update lead to 'won' status and link customer_id
      const [wonStatus] = await conn.query("SELECT id FROM lead_statuses WHERE code = 'won' LIMIT 1");
      const wonStatusId = wonStatus[0]?.id || 6;

      await conn.query(`
        UPDATE leads 
        SET customer_id = ?, lead_status_id = ?, converted_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `, [customerId, wonStatusId, leadId]);

      // Record activity
      await conn.query(`
        INSERT INTO lead_activities (lead_id, user_id, type, title, description)
        VALUES (?, ?, 'deal_won', 'Converted to Customer', ?)
      `, [leadId, lead.assigned_to || 4, `Successfully converted into customer account #${customer_code}.`]);

      const [newCust] = await conn.query('SELECT * FROM customers WHERE id = ?', [customerId]);
      return newCust[0];
    });
  }
}

module.exports = LeadModel;
