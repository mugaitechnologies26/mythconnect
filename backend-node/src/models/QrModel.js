const db = require('../config/db');

class QrModel {
  static async getAll() {
    return db.query(`
      SELECT 
        q.id, q.qr_code_id, q.title, q.qr_type, q.payload_data,
        q.target_url, q.scan_count, q.download_count,
        q.foreground_color, q.background_color, q.logo_enabled,
        q.created_at, q.updated_at
      FROM qr_codes q
      ORDER BY q.id DESC
    `);
  }

  static async getById(id) {
    const rows = await db.query('SELECT * FROM qr_codes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async getByQrCodeId(qrCodeId) {
    const rows = await db.query('SELECT * FROM qr_codes WHERE qr_code_id = ?', [qrCodeId]);
    return rows[0] || null;
  }

  static async create(data) {
    const qr_code_id = data.qr_code_id || `QR-MCAI-${Date.now().toString().slice(-6)}`;
    const res = await db.query(`
      INSERT INTO qr_codes (
        qr_code_id, title, qr_type, payload_data, target_url,
        scan_count, download_count, foreground_color, background_color,
        logo_enabled, created_by
      ) VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)
    `, [
      qr_code_id,
      data.title,
      data.qr_type || 'custom_url',
      data.payload_data || data.target_url || '',
      data.target_url || data.payload_data || null,
      data.foreground_color || '#0B1F3A',
      data.background_color || '#FFFFFF',
      data.logo_enabled !== undefined ? data.logo_enabled : 1,
      data.created_by || 1
    ]);

    return this.getById(res.insertId);
  }

  static async update(id, data) {
    const fields = ['title', 'qr_type', 'payload_data', 'target_url', 'foreground_color', 'background_color', 'logo_enabled'];
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
    await db.query(`UPDATE qr_codes SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return this.getById(id);
  }

  static async incrementScan(qrCodeIdOrId) {
    await db.query(`
      UPDATE qr_codes 
      SET scan_count = scan_count + 1 
      WHERE id = ? OR qr_code_id = ?
    `, [qrCodeIdOrId, qrCodeIdOrId]);
  }

  static async delete(id) {
    await db.query('DELETE FROM qr_codes WHERE id = ?', [id]);
    return { success: true, id };
  }
}

module.exports = QrModel;
