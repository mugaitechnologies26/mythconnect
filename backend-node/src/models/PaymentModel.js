const db = require('../config/db');

class PaymentModel {
  static async getAll({ invoice_id = null, customer_id = null, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT 
        p.id, p.payment_number, p.invoice_id, p.customer_id,
        p.amount, p.payment_date, p.payment_method, p.reference_number,
        p.notes, p.created_at,
        i.invoice_number,
        c.name AS customer_name, c.company_name AS customer_company,
        u.name AS recorded_by_name
      FROM payments p
      LEFT JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.recorded_by = u.id
      WHERE 1=1
    `;
    const params = [];

    if (invoice_id) {
      sql += ' AND p.invoice_id = ?';
      params.push(invoice_id);
    }

    if (customer_id) {
      sql += ' AND p.customer_id = ?';
      params.push(customer_id);
    }

    sql += ' ORDER BY p.id DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    return db.query(sql, params);
  }

  static async getById(id) {
    const sql = `
      SELECT 
        p.id, p.payment_number, p.invoice_id, p.customer_id,
        p.amount, p.payment_date, p.payment_method, p.reference_number,
        p.notes, p.created_at,
        i.invoice_number,
        c.name AS customer_name, c.company_name AS customer_company,
        u.name AS recorded_by_name
      FROM payments p
      LEFT JOIN invoices i ON p.invoice_id = i.id
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN users u ON p.recorded_by = u.id
      WHERE p.id = ?
    `;
    const rows = await db.query(sql, [id]);
    return rows[0] || null;
  }
}

module.exports = PaymentModel;
