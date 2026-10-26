const db = require('../config/db');

class UserModel {
  static async getAll() {
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.last_login_at,
        r.name AS role, r.display_name AS role_display,
        t.name AS team_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.deleted_at IS NULL
      ORDER BY u.id ASC
    `;
    return db.query(sql);
  }

  static async getById(id) {
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.last_login_at,
        r.name AS role, r.display_name AS role_display,
        t.name AS team_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.id = ? AND u.deleted_at IS NULL
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async getByEmail(email) {
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.password, u.avatar_url, u.is_active,
        r.name AS role, r.display_name AS role_display,
        t.name AS team_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN teams t ON u.team_id = t.id
      WHERE u.email = ? AND u.deleted_at IS NULL
    `;
    const rows = await db.query(sql, [email]);
    return rows[0] || null;
  }
}

module.exports = UserModel;
