const db = require('../config/db');

class ReportModel {
  static async getKPIs() {
    const leadStats = await db.query(`
      SELECT 
        COUNT(*) AS totalLeads,
        SUM(CASE WHEN lead_status_id = 1 THEN 1 ELSE 0 END) AS newLeads,
        SUM(CASE WHEN lead_status_id = 6 THEN 1 ELSE 0 END) AS convertedLeads
      FROM leads 
      WHERE deleted_at IS NULL
    `);

    const followupStats = await db.query(`
      SELECT COUNT(*) AS followupsToday 
      FROM lead_followups 
      WHERE DATE(scheduled_at) = CURDATE() AND status = 'pending'
    `);

    const quoteStats = await db.query(`
      SELECT COUNT(*) AS pendingQuotations 
      FROM quotations 
      WHERE status IN ('draft', 'sent')
    `);

    const invoiceStats = await db.query(`
      SELECT 
        COALESCE(SUM(paid_amount), 0) AS revenue,
        COALESCE(SUM(balance_amount), 0) AS pendingPayments
      FROM invoices
    `);

    const totalLeads = Number(leadStats[0]?.totalLeads || 0);
    const convertedLeads = Number(leadStats[0]?.convertedLeads || 0);
    const conversionRate = totalLeads > 0 ? Number(((convertedLeads / totalLeads) * 100).toFixed(1)) : 0;

    return {
      totalLeads,
      newLeads: Number(leadStats[0]?.newLeads || 0),
      followupsToday: Number(followupStats[0]?.followupsToday || 0),
      convertedLeads,
      conversionRate,
      revenue: Number(invoiceStats[0]?.revenue || 0),
      pendingQuotations: Number(quoteStats[0]?.pendingQuotations || 0),
      pendingPayments: Number(invoiceStats[0]?.pendingPayments || 0)
    };
  }

  static async getSources() {
    return db.query(`
      SELECT 
        ls.name AS source_name,
        ls.code AS source_code,
        ls.color,
        COUNT(l.id) AS lead_count,
        COALESCE(SUM(l.estimated_value), 0) AS total_value
      FROM lead_sources ls
      LEFT JOIN leads l ON ls.id = l.lead_source_id AND l.deleted_at IS NULL
      GROUP BY ls.id, ls.name, ls.code, ls.color
      ORDER BY lead_count DESC
    `);
  }

  static async getFunnel() {
    return db.query(`
      SELECT 
        lst.name AS stage_name,
        lst.code AS stage_code,
        lst.color,
        lst.order_index,
        COUNT(l.id) AS lead_count,
        COALESCE(SUM(l.estimated_value), 0) AS total_value
      FROM lead_statuses lst
      LEFT JOIN leads l ON lst.id = l.lead_status_id AND l.deleted_at IS NULL
      GROUP BY lst.id, lst.name, lst.code, lst.color, lst.order_index
      ORDER BY lst.order_index ASC
    `);
  }

  static async getSalespeople() {
    return db.query(`
      SELECT 
        u.id, u.name, u.email, u.avatar_url,
        COUNT(l.id) AS assigned_leads,
        SUM(CASE WHEN l.lead_status_id = 6 THEN 1 ELSE 0 END) AS won_deals,
        COALESCE(SUM(CASE WHEN l.lead_status_id = 6 THEN l.estimated_value ELSE 0 END), 0) AS won_revenue
      FROM users u
      LEFT JOIN leads l ON u.id = l.assigned_to AND l.deleted_at IS NULL
      WHERE u.role_id IN (3, 4) AND u.deleted_at IS NULL
      GROUP BY u.id, u.name, u.email, u.avatar_url
      ORDER BY won_revenue DESC
    `);
  }
}

module.exports = ReportModel;
