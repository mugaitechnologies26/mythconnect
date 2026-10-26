const db = require('../config/db');
const { toSqlDate } = require('../utils/dateHelper');

class QuotationModel {
  static async getAll({ status = '', customer_id = null, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT 
        q.id, q.quotation_number, q.lead_id, q.customer_id,
        c.name AS customer_name, c.company_name AS customer_company,
        c.email AS customer_email, c.phone AS customer_phone,
        c.address AS customer_address, c.gstin AS customer_gstin,
        q.quotation_date, q.valid_until,
        q.subtotal, q.discount_amount, q.tax_amount, q.grand_total,
        q.status, q.notes, q.terms_and_conditions, q.pdf_url,
        q.created_at, q.updated_at
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (status && status !== 'all') {
      sql += ` AND q.status = ?`;
      params.push(status);
    }

    if (customer_id) {
      sql += ` AND q.customer_id = ?`;
      params.push(customer_id);
    }

    sql += ` ORDER BY q.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const quotes = await db.query(sql, params);

    // Fetch items for all quotes
    for (const q of quotes) {
      q.items = await db.query(
        'SELECT id, quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total FROM quotation_items WHERE quotation_id = ?',
        [q.id]
      );
    }

    return quotes;
  }

  static async getById(id) {
    const sql = `
      SELECT 
        q.id, q.quotation_number, q.lead_id, q.customer_id,
        c.name AS customer_name, c.company_name AS customer_company,
        c.email AS customer_email, c.phone AS customer_phone,
        c.address AS customer_address, c.gstin AS customer_gstin,
        q.quotation_date, q.valid_until,
        q.subtotal, q.discount_amount, q.tax_amount, q.grand_total,
        q.status, q.notes, q.terms_and_conditions, q.pdf_url,
        q.created_at, q.updated_at
      FROM quotations q
      LEFT JOIN customers c ON q.customer_id = c.id
      WHERE q.id = ?
    `;
    const rows = await db.query(sql, [id]);
    if (!rows.length) return null;

    const quote = rows[0];
    quote.items = await db.query(
      'SELECT id, quotation_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total FROM quotation_items WHERE quotation_id = ?',
      [quote.id]
    );

    return quote;
  }

  static async create(data) {
    return db.transaction(async (conn) => {
      const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM quotations');
      const seq = String((countRows[0]?.total || 0) + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      const quotation_number = data.quotation_number || `QT-${year}-${seq}`;

      const items = data.items || [];
      let subtotal = 0;
      let tax_amount = 0;
      let discount_amount = Number(data.discount_amount) || 0;

      for (const it of items) {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unit_price) || 0;
        const disc = Number(it.discount_percent) || 0;
        const taxRate = Number(it.tax_rate) !== undefined ? Number(it.tax_rate) : 18;

        const baseTotal = qty * price * (1 - disc / 100);
        const itemTax = (baseTotal * taxRate) / 100;

        subtotal += baseTotal;
        tax_amount += itemTax;
        it.calculated_total = Number((baseTotal + itemTax).toFixed(2));
      }

      if (data.subtotal) subtotal = Number(data.subtotal);
      if (data.tax_amount) tax_amount = Number(data.tax_amount);
      const grand_total = Number(data.grand_total) || (subtotal - discount_amount + tax_amount);

      const [res] = await conn.query(`
        INSERT INTO quotations (
          quotation_number, lead_id, customer_id, quotation_date, valid_until,
          subtotal, discount_amount, tax_amount, grand_total,
          status, notes, terms_and_conditions, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        quotation_number,
        data.lead_id || null,
        data.customer_id || 1,
        toSqlDate(data.quotation_date) || toSqlDate(new Date()),
        toSqlDate(data.valid_until) || toSqlDate(new Date(Date.now() + 30 * 86400000)),
        subtotal,
        discount_amount,
        tax_amount,
        grand_total,
        data.status || 'draft',
        data.notes || null,
        data.terms_and_conditions || 'Payment terms: 50% advance, 50% upon deployment. Includes 12 months SLA support.',
        data.created_by || 1
      ]);

      const quotationId = res.insertId;

      for (const it of items) {
        await conn.query(`
          INSERT INTO quotation_items (
            quotation_id, product_id, description, quantity,
            unit_price, discount_percent, tax_rate, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          quotationId,
          it.product_id || null,
          it.description || 'Service line item',
          it.quantity || 1,
          it.unit_price || 0,
          it.discount_percent || 0,
          it.tax_rate || 18,
          it.calculated_total || (it.unit_price * (it.quantity || 1))
        ]);
      }

      // If attached to a lead, log activity
      if (data.lead_id) {
        await conn.query(`
          INSERT INTO lead_activities (lead_id, user_id, type, title, description)
          VALUES (?, ?, 'quote_created', 'Quotation Issued', ?)
        `, [data.lead_id, 4, `Quotation #${quotation_number} generated for ₹${grand_total.toLocaleString('en-IN')}.`]);
      }

      return quotationId;
    }).then(id => this.getById(id));
  }

  static async updateStatus(id, status) {
    await db.query('UPDATE quotations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
    return this.getById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM quotations WHERE id = ?', [id]);
    return { success: true, id };
  }

  static async convertToInvoice(quotationId) {
    return db.transaction(async (conn) => {
      const [qRows] = await conn.query('SELECT * FROM quotations WHERE id = ?', [quotationId]);
      if (!qRows.length) throw new Error('Quotation not found');
      const quote = qRows[0];

      const [items] = await conn.query('SELECT * FROM quotation_items WHERE quotation_id = ?', [quotationId]);

      // Generate invoice number
      const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM invoices');
      const seq = String((countRows[0]?.total || 0) + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      const invoice_number = `INV-${year}-${seq}`;

      const invoice_date = new Date().toISOString().split('T')[0];
      const due_date = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

      const [invRes] = await conn.query(`
        INSERT INTO invoices (
          invoice_number, quotation_id, customer_id, invoice_date, due_date,
          subtotal, discount_amount, tax_amount, grand_total,
          paid_amount, balance_amount, payment_status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.00, ?, 'sent', ?, ?)
      `, [
        invoice_number,
        quote.id,
        quote.customer_id,
        invoice_date,
        due_date,
        quote.subtotal,
        quote.discount_amount,
        quote.tax_amount,
        quote.grand_total,
        quote.grand_total,
        `Converted from Quotation #${quote.quotation_number}`,
        1
      ]);

      const invoiceId = invRes.insertId;

      // Copy items to invoice_items
      for (const it of items) {
        await conn.query(`
          INSERT INTO invoice_items (
            invoice_id, product_id, description, quantity,
            unit_price, discount_percent, tax_rate, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoiceId,
          it.product_id,
          it.description,
          it.quantity,
          it.unit_price,
          it.discount_percent,
          it.tax_rate,
          it.total
        ]);
      }

      // Mark quote as accepted
      await conn.query("UPDATE quotations SET status = 'accepted' WHERE id = ?", [quotationId]);

      // Update customer outstanding balance
      await conn.query(`
        UPDATE customers 
        SET outstanding_balance = outstanding_balance + ?,
            total_orders = total_orders + 1
        WHERE id = ?
      `, [quote.grand_total, quote.customer_id]);

      return invoiceId;
    });
  }
}

module.exports = QuotationModel;
