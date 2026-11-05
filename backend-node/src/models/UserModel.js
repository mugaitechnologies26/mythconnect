const db = require('../config/db');

class UserModel {
  static async getAll() {
    const sql = `
      SELECT 
        u.id, u.name, u.email, u.phone, u.avatar_url, u.is_active, u.last_login_at,
        u.role_id, u.team_id,
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
        u.role_id, u.team_id,
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
        u.role_id, u.team_id,
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

  static async create(data) {
    // Resolve role_id
    let role_id = data.role_id;
    if (!role_id && data.role) {
      const roleRows = await db.query('SELECT id FROM roles WHERE name = ? OR display_name = ? LIMIT 1', [data.role, data.role]);
      if (roleRows && roleRows.length > 0) {
        role_id = roleRows[0].id;
      }
    }
    if (!role_id) role_id = 4; // Default to Sales Executive

    // Resolve team_id
    let team_id = data.team_id || null;
    if (!team_id && data.team_name) {
      const teamRows = await db.query('SELECT id FROM teams WHERE name = ? LIMIT 1', [data.team_name]);
      if (teamRows && teamRows.length > 0) {
        team_id = teamRows[0].id;
      } else {
        const code = 'TEAM-' + data.team_name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
        const insertTeam = await db.query('INSERT INTO teams (name, code) VALUES (?, ?)', [data.team_name, code]);
        team_id = insertTeam.insertId;
      }
    }

    const defaultAvatar = data.avatar_url || `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500000)}?w=150`;
    const password = data.password || 'Secret123!';
    const isActive = data.is_active !== undefined ? (data.is_active ? 1 : 0) : 1;

    const res = await db.query(`
      INSERT INTO users (
        name, email, phone, password, role_id, team_id, avatar_url, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name,
      data.email,
      data.phone || '+919800000000',
      password,
      role_id,
      team_id,
      defaultAvatar,
      isActive
    ]);

    return this.getById(res.insertId);
  }

  static async update(id, data) {
    let role_id = data.role_id;
    if (!role_id && data.role) {
      const roleRows = await db.query('SELECT id FROM roles WHERE name = ? OR display_name = ? LIMIT 1', [data.role, data.role]);
      if (roleRows && roleRows.length > 0) {
        role_id = roleRows[0].id;
      }
    }

    let team_id = data.team_id;
    if (!team_id && data.team_name) {
      const teamRows = await db.query('SELECT id FROM teams WHERE name = ? LIMIT 1', [data.team_name]);
      if (teamRows && teamRows.length > 0) {
        team_id = teamRows[0].id;
      } else if (data.team_name.trim()) {
        const code = 'TEAM-' + data.team_name.replace(/[^A-Za-z0-9]/g, '').slice(0, 6).toUpperCase();
        const insertTeam = await db.query('INSERT INTO teams (name, code) VALUES (?, ?)', [data.team_name, code]);
        team_id = insertTeam.insertId;
      }
    }

    const fields = [];
    const params = [];

    if (data.name !== undefined) { fields.push('name = ?'); params.push(data.name); }
    if (data.email !== undefined) { fields.push('email = ?'); params.push(data.email); }
    if (data.phone !== undefined) { fields.push('phone = ?'); params.push(data.phone); }
    if (role_id !== undefined) { fields.push('role_id = ?'); params.push(role_id); }
    if (team_id !== undefined) { fields.push('team_id = ?'); params.push(team_id); }
    if (data.avatar_url !== undefined) { fields.push('avatar_url = ?'); params.push(data.avatar_url); }
    if (data.is_active !== undefined) { fields.push('is_active = ?'); params.push(data.is_active ? 1 : 0); }
    if (data.password) { fields.push('password = ?'); params.push(data.password); }

    if (fields.length > 0) {
      params.push(id);
      await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);
    }

    return this.getById(id);
  }

  static async delete(id) {
    await db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
    return { success: true };
  }

  static async getTeams() {
    return db.query('SELECT id, name, code, description FROM teams ORDER BY name ASC');
  }
}

module.exports = UserModel;
