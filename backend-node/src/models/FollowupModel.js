const db = require('../config/db');
const { toSqlDatetime } = require('../utils/dateHelper');

class FollowupModel {
  static async getAll({ status = '', assigned_to = null, lead_id = null, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT 
        lf.id, lf.lead_id, lf.assigned_to, lf.scheduled_at, lf.type,
        lf.status, lf.notes, lf.outcome, lf.completed_at, lf.created_at,
        l.name AS lead_name, l.phone AS lead_phone, l.company_name AS lead_company,
        u.name AS assigned_user_name
      FROM lead_followups lf
      LEFT JOIN leads l ON lf.lead_id = l.id
      LEFT JOIN users u ON lf.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ' AND lf.status = ?';
      params.push(status);
    }

    if (assigned_to) {
      sql += ' AND lf.assigned_to = ?';
      params.push(assigned_to);
    }

    if (lead_id) {
      sql += ' AND lf.lead_id = ?';
      params.push(lead_id);
    }

    sql += ' ORDER BY lf.scheduled_at ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    return db.query(sql, params);
  }

  static async getById(id) {
    const sql = `
      SELECT 
        lf.id, lf.lead_id, lf.assigned_to, lf.scheduled_at, lf.type,
        lf.status, lf.notes, lf.outcome, lf.completed_at, lf.created_at,
        l.name AS lead_name, l.phone AS lead_phone, l.company_name AS lead_company,
        u.name AS assigned_user_name
      FROM lead_followups lf
      LEFT JOIN leads l ON lf.lead_id = l.id
      LEFT JOIN users u ON lf.assigned_to = u.id
      WHERE lf.id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const scheduled_at = toSqlDatetime(data.scheduled_at) || toSqlDatetime(new Date(Date.now() + 2 * 3600000));

    const res = await db.query(`
      INSERT INTO lead_followups (
        lead_id, assigned_to, scheduled_at, type, status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      data.lead_id,
      data.assigned_to || 4,
      scheduled_at,
      data.type || 'call',
      data.status || 'pending',
      data.notes || null,
      data.created_by || 1
    ]);

    // Update next_followup_at on lead
    if (data.lead_id) {
      await db.query('UPDATE leads SET next_followup_at = ? WHERE id = ?', [scheduled_at, data.lead_id]);
    }

    return this.getById(res.insertId);
  }

  static async complete(id, outcome = '') {
    await db.query(`
      UPDATE lead_followups 
      SET status = 'completed', outcome = ?, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [outcome, id]);

    return this.getById(id);
  }

  static async update(id, data) {
    const fields = ['scheduled_at', 'type', 'status', 'notes', 'outcome', 'assigned_to'];
    const updates = [];
    const values = [];

    for (const f of fields) {
      if (data[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(data[f]);
      }
    }

    if (updates.length === 0) return this.getById(id);

    values.push(id);
    await db.query(`UPDATE lead_followups SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM lead_followups WHERE id = ?', [id]);
    return { success: true, id };
  }
}

module.exports = FollowupModel;
