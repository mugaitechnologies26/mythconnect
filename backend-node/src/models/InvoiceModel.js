const db = require('../config/db');
const { toSqlDate } = require('../utils/dateHelper');

class InvoiceModel {
  static async getAll({ payment_status = '', customer_id = null, limit = 100, offset = 0 } = {}) {
    let sql = `
      SELECT 
        i.id, i.invoice_number, i.quotation_id, i.customer_id,
        c.name AS customer_name, c.company_name AS customer_company,
        c.email AS customer_email, c.phone AS customer_phone,
        c.gstin AS customer_gstin,
        i.invoice_date, i.due_date,
        i.subtotal, i.discount_amount, i.tax_amount, i.grand_total,
        i.paid_amount, i.balance_amount, i.payment_status,
        i.notes, i.pdf_url, i.created_at, i.updated_at
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (payment_status && payment_status !== 'all') {
      sql += ` AND i.payment_status = ?`;
      params.push(payment_status);
    }

    if (customer_id) {
      sql += ` AND i.customer_id = ?`;
      params.push(customer_id);
    }

    sql += ` ORDER BY i.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit, 10), parseInt(offset, 10));

    const invoices = await db.query(sql, params);

    for (const inv of invoices) {
      inv.items = await db.query(
        'SELECT id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total FROM invoice_items WHERE invoice_id = ?',
        [inv.id]
      );
    }

    return invoices;
  }

  static async getById(id) {
    const sql = `
      SELECT 
        i.id, i.invoice_number, i.quotation_id, i.customer_id,
        c.name AS customer_name, c.company_name AS customer_company,
        c.email AS customer_email, c.phone AS customer_phone,
        c.gstin AS customer_gstin,
        i.invoice_date, i.due_date,
        i.subtotal, i.discount_amount, i.tax_amount, i.grand_total,
        i.paid_amount, i.balance_amount, i.payment_status,
        i.notes, i.pdf_url, i.created_at, i.updated_at
      FROM invoices i
      LEFT JOIN customers c ON i.customer_id = c.id
      WHERE i.id = ?
    `;
    const rows = await db.query(sql, [id]);
    if (!rows.length) return null;

    const invoice = rows[0];
    invoice.items = await db.query(
      'SELECT id, invoice_id, product_id, description, quantity, unit_price, discount_percent, tax_rate, total FROM invoice_items WHERE invoice_id = ?',
      [invoice.id]
    );
    invoice.payments = await db.query(
      'SELECT id, payment_number, amount, payment_date, payment_method, reference_number, notes, created_at FROM payments WHERE invoice_id = ? ORDER BY id DESC',
      [invoice.id]
    );

    return invoice;
  }

  static async create(data) {
    return db.transaction(async (conn) => {
      const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM invoices');
      const seq = String((countRows[0]?.total || 0) + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      const invoice_number = data.invoice_number || `INV-${year}-${seq}`;

      const items = data.items || [];
      let subtotal = Number(data.subtotal) || 0;
      let tax_amount = Number(data.tax_amount) || 0;
      let discount_amount = Number(data.discount_amount) || 0;

      if (!subtotal && items.length > 0) {
        for (const it of items) {
          const qty = Number(it.quantity) || 1;
          const price = Number(it.unit_price) || 0;
          const disc = Number(it.discount_percent) || 0;
          const taxRate = Number(it.tax_rate) || 18;
          const base = qty * price * (1 - disc / 100);
          subtotal += base;
          tax_amount += (base * taxRate) / 100;
        }
      }

      const grand_total = Number(data.grand_total) || (subtotal - discount_amount + tax_amount);
      const paid_amount = Number(data.paid_amount) || 0;
      const balance_amount = Math.max(0, grand_total - paid_amount);
      const payment_status = balance_amount <= 0 ? 'paid' : (paid_amount > 0 ? 'partially_paid' : (data.payment_status || 'sent'));

      const [res] = await conn.query(`
        INSERT INTO invoices (
          invoice_number, quotation_id, customer_id, invoice_date, due_date,
          subtotal, discount_amount, tax_amount, grand_total,
          paid_amount, balance_amount, payment_status, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        invoice_number,
        data.quotation_id || null,
        data.customer_id || 1,
        toSqlDate(data.invoice_date) || toSqlDate(new Date()),
        toSqlDate(data.due_date) || toSqlDate(new Date(Date.now() + 14 * 86400000)),
        subtotal,
        discount_amount,
        tax_amount,
        grand_total,
        paid_amount,
        balance_amount,
        payment_status,
        data.notes || null,
        data.created_by || 1
      ]);

      const invoiceId = res.insertId;

      for (const it of items) {
        await conn.query(`
          INSERT INTO invoice_items (
            invoice_id, product_id, description, quantity,
            unit_price, discount_percent, tax_rate, total
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          invoiceId,
          it.product_id || null,
          it.description || 'Invoice Line Item',
          it.quantity || 1,
          it.unit_price || 0,
          it.discount_percent || 0,
          it.tax_rate || 18,
          it.total || (it.unit_price * (it.quantity || 1))
        ]);
      }

      // Update customer balance & revenue
      await conn.query(`
        UPDATE customers 
        SET outstanding_balance = outstanding_balance + ?,
            total_revenue = total_revenue + ?,
            total_orders = total_orders + 1
        WHERE id = ?
      `, [balance_amount, paid_amount, data.customer_id || 1]);

      return invoiceId;
    }).then(id => this.getById(id));
  }

  static async recordPayment(invoiceId, paymentData) {
    return db.transaction(async (conn) => {
      const [invRows] = await conn.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
      if (!invRows.length) throw new Error('Invoice not found');
      const invoice = invRows[0];

      const amount = Number(paymentData.amount);
      if (amount <= 0) throw new Error('Payment amount must be greater than zero');

      // Generate payment number
      const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM payments');
      const seq = String((countRows[0]?.total || 0) + 1).padStart(3, '0');
      const year = new Date().getFullYear();
      const payment_number = paymentData.payment_number || `PAY-${year}-${seq}`;

      const [payRes] = await conn.query(`
        INSERT INTO payments (
          payment_number, invoice_id, customer_id, amount,
          payment_date, payment_method, reference_number, notes, recorded_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        payment_number,
        invoice.id,
        invoice.customer_id,
        amount,
        toSqlDate(paymentData.payment_date) || toSqlDate(new Date()),
        paymentData.payment_method || 'bank_transfer',
        paymentData.reference_number || null,
        paymentData.notes || null,
        paymentData.recorded_by || 5
      ]);

      // Calculate new paid amount and balance
      const newPaid = Number(invoice.paid_amount) + amount;
      const newBalance = Math.max(0, Number(invoice.grand_total) - newPaid);
      const newStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

      await conn.query(`
        UPDATE invoices 
        SET paid_amount = ?, balance_amount = ?, payment_status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [newPaid, newBalance, newStatus, invoice.id]);

      // Update customer record
      await conn.query(`
        UPDATE customers 
        SET outstanding_balance = GREATEST(0, outstanding_balance - ?),
            total_revenue = total_revenue + ?
        WHERE id = ?
      `, [amount, amount, invoice.customer_id]);

      return {
        paymentId: payRes.insertId,
        payment_number,
        amount,
        newPaid,
        newBalance,
        newStatus
      };
    });
  }

  static async delete(id) {
    await db.query('DELETE FROM invoices WHERE id = ?', [id]);
    return { success: true, id };
  }
}

module.exports = InvoiceModel;
