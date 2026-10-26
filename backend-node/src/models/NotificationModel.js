const db = require('../config/db');

class NotificationModel {
  static async getAll({ user_id = null, limit = 50 } = {}) {
    let sql = 'SELECT id, user_id, type, title, message, action_url, is_read, created_at FROM notifications WHERE 1=1';
    const params = [];

    if (user_id) {
      sql += ' AND user_id = ?';
      params.push(user_id);
    }

    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    const rows = await db.query(sql, params);
    return rows.map(r => ({
      ...r,
      is_read: Boolean(r.is_read)
    }));
  }

  static async markAsRead(id) {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ?', [id]);
    const rows = await db.query('SELECT * FROM notifications WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async markAllAsRead(userId = null) {
    if (userId) {
      await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
    } else {
      await db.query('UPDATE notifications SET is_read = 1');
    }
    return { success: true };
  }

  static async create(data) {
    const res = await db.query(`
      INSERT INTO notifications (
        user_id, type, title, message, action_url, is_read
      ) VALUES (?, ?, ?, ?, ?, 0)
    `, [
      data.user_id || 4,
      data.type || 'system_alert',
      data.title,
      data.message,
      data.action_url || null
    ]);

    const rows = await db.query('SELECT * FROM notifications WHERE id = ?', [res.insertId]);
    return rows[0];
  }
}

module.exports = NotificationModel;
