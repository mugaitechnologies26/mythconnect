const db = require('../config/db');

class WhatsAppModel {
  static async getConversations() {
    const sql = `
      SELECT 
        wc.id, wc.phone, wc.name, wc.lead_id, wc.customer_id,
        wc.assigned_to, wc.last_message, wc.last_message_at,
        wc.unread_count, wc.is_archived, wc.created_at,
        l.lead_code,
        c.customer_code
      FROM whatsapp_conversations wc
      LEFT JOIN leads l ON wc.lead_id = l.id
      LEFT JOIN customers c ON wc.customer_id = c.id
      WHERE wc.is_archived = 0
      ORDER BY wc.last_message_at DESC
    `;
    return db.query(sql);
  }

  static async getConversationById(id) {
    const sql = `
      SELECT 
        wc.id, wc.phone, wc.name, wc.lead_id, wc.customer_id,
        wc.assigned_to, wc.last_message, wc.last_message_at,
        wc.unread_count, wc.is_archived, wc.created_at
      FROM whatsapp_conversations wc
      WHERE wc.id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async getConversationByPhone(phone) {
    const sql = `
      SELECT 
        wc.id, wc.phone, wc.name, wc.lead_id, wc.customer_id,
        wc.assigned_to, wc.last_message, wc.last_message_at,
        wc.unread_count, wc.is_archived, wc.created_at
      FROM whatsapp_conversations wc
      WHERE wc.phone = ?
    `;
    const rows = await db.query(sql, [phone]);
    return rows[0] || null;
  }

  static async getAllMessages() {
    const sql = `
      SELECT 
        wm.id, wm.conversation_id, wm.wamid, wm.sender_type,
        wm.sender_id, wm.message_type, wm.content, wm.media_url,
        wm.status, wm.created_at, wm.delivered_at, wm.read_at,
        u.name AS sender_name
      FROM whatsapp_messages wm
      LEFT JOIN users u ON wm.sender_id = u.id
      ORDER BY wm.id ASC
    `;
    return db.query(sql);
  }

  static async getMessages(conversationId) {
    const sql = `
      SELECT 
        wm.id, wm.conversation_id, wm.wamid, wm.sender_type,
        wm.sender_id, wm.message_type, wm.content, wm.media_url,
        wm.status, wm.created_at, wm.delivered_at, wm.read_at,
        u.name AS sender_name
      FROM whatsapp_messages wm
      LEFT JOIN users u ON wm.sender_id = u.id
      WHERE wm.conversation_id = ?
      ORDER BY wm.id ASC
    `;
    return db.query(sql, [conversationId]);
  }

  static async createConversation(data) {
    const res = await db.query(`
      INSERT INTO whatsapp_conversations (
        phone, name, lead_id, customer_id, assigned_to,
        last_message, last_message_at, unread_count
      ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)
    `, [
      data.phone,
      data.name,
      data.lead_id || null,
      data.customer_id || null,
      data.assigned_to || 4,
      data.last_message || null,
      data.unread_count || 0
    ]);
    return this.getConversationById(res.insertId);
  }

  static async saveMessage(data) {
    const res = await db.query(`
      INSERT INTO whatsapp_messages (
        conversation_id, wamid, sender_type, sender_id,
        message_type, content, media_url, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.conversation_id,
      data.wamid || `wamid_${Date.now()}`,
      data.sender_type || 'agent',
      data.sender_id || null,
      data.message_type || 'text',
      data.content,
      data.media_url || null,
      data.status || 'sent'
    ]);

    // Update conversation last message & time
    const unreadIncrement = data.sender_type === 'customer' ? 1 : 0;
    await db.query(`
      UPDATE whatsapp_conversations
      SET last_message = ?, last_message_at = CURRENT_TIMESTAMP, unread_count = unread_count + ?
      WHERE id = ?
    `, [data.content, unreadIncrement, data.conversation_id]);

    const rows = await db.query('SELECT * FROM whatsapp_messages WHERE id = ?', [res.insertId]);
    return rows[0];
  }

  static async updateMessageStatus(wamid, status) {
    let timeField = '';
    if (status === 'delivered') timeField = ', delivered_at = CURRENT_TIMESTAMP';
    if (status === 'read') timeField = ', read_at = CURRENT_TIMESTAMP';

    await db.query(`
      UPDATE whatsapp_messages 
      SET status = ? ${timeField}
      WHERE wamid = ?
    `, [status, wamid]);
  }

  static async getTemplates() {
    return db.query('SELECT * FROM whatsapp_templates WHERE status = "APPROVED"');
  }
}

module.exports = WhatsAppModel;
