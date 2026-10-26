const db = require('../config/db');

class SettingsModel {
  static async getAll() {
    const rows = await db.query('SELECT `key`, `value`, `group`, is_secret FROM settings');
    const settingsMap = {};
    for (const r of rows) {
      settingsMap[r.key] = r.value;
    }
    return settingsMap;
  }

  static async update(key, value) {
    await db.query(`
      INSERT INTO settings (\`key\`, \`value\`, \`group\`)
      VALUES (?, ?, 'general')
      ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`), updated_at = CURRENT_TIMESTAMP
    `, [key, String(value)]);
    return { key, value };
  }

  static async batchUpdate(settingsObj) {
    for (const [key, val] of Object.entries(settingsObj)) {
      await this.update(key, val);
    }
    return this.getAll();
  }
}

module.exports = SettingsModel;
