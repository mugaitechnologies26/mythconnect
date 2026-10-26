const db = require('../config/db');

class CustomerModel {
  static async getAll({ search = '', limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT 
        c.id, c.customer_code, c.name, c.company_name, c.email, c.phone,
        c.alternate_phone, c.address, c.city, c.state, c.pincode, c.country,
        c.gstin, c.total_orders, c.total_revenue, c.outstanding_balance,
        c.assigned_to, u.name AS assigned_user_name,
        c.created_at, c.updated_at
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.deleted_at IS NULL
    `;
    const params = [];

    if (search) {
      sql += ` AND (c.name LIKE ? OR c.company_name LIKE ? OR c.phone LIKE ? OR c.email LIKE ? OR c.customer_code LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term, term);
    }

    sql += ` ORDER BY c.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    return db.query(sql, params);
  }

  static async getById(id) {
    const sql = `
      SELECT 
        c.id, c.customer_code, c.name, c.company_name, c.email, c.phone,
        c.alternate_phone, c.address, c.city, c.state, c.pincode, c.country,
        c.gstin, c.total_orders, c.total_revenue, c.outstanding_balance,
        c.assigned_to, u.name AS assigned_user_name,
        c.created_at, c.updated_at
      FROM customers c
      LEFT JOIN users u ON c.assigned_to = u.id
      WHERE c.id = ? AND c.deleted_at IS NULL
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }

  static async create(data) {
    const countRows = await db.query('SELECT COUNT(*) AS total FROM customers');
    const seq = String((countRows[0]?.total || 0) + 1).padStart(3, '0');
    const year = new Date().getFullYear();
    const customer_code = data.customer_code || `CUST-${year}-${seq}`;

    const insertSql = `
      INSERT INTO customers (
        customer_code, name, company_name, email, phone,
        alternate_phone, address, city, state, pincode,
        gstin, total_orders, total_revenue, outstanding_balance,
        assigned_to, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const res = await db.query(insertSql, [
      customer_code,
      data.name,
      data.company_name || null,
      data.email || null,
      data.phone,
      data.alternate_phone || null,
      data.address || null,
      data.city || null,
      data.state || null,
      data.pincode || null,
      data.gstin || null,
      data.total_orders || 0,
      data.total_revenue || 0,
      data.outstanding_balance || 0,
      data.assigned_to || 4,
      data.created_by || 1
    ]);

    return this.getById(res.insertId);
  }

  static async update(id, data) {
    const fields = [
      'name', 'company_name', 'email', 'phone', 'alternate_phone',
      'address', 'city', 'state', 'pincode', 'gstin', 'assigned_to',
      'total_orders', 'total_revenue', 'outstanding_balance'
    ];
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
    await db.query(`UPDATE customers SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, values);
    return this.getById(id);
  }

  static async delete(id) {
    await db.query('UPDATE customers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    return { success: true, id };
  }

  static async getHistory(id) {
    const invoices = await db.query('SELECT * FROM invoices WHERE customer_id = ? ORDER BY id DESC', [id]);
    const quotations = await db.query('SELECT * FROM quotations WHERE customer_id = ? ORDER BY id DESC', [id]);
    const payments = await db.query('SELECT * FROM payments WHERE customer_id = ? ORDER BY id DESC', [id]);
    const leads = await db.query('SELECT * FROM leads WHERE customer_id = ? ORDER BY id DESC', [id]);

    return { invoices, quotations, payments, leads };
  }
}

module.exports = CustomerModel;
