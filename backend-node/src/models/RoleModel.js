const db = require('../config/db');
const logger = require('../utils/logger');

const DEFAULT_PERMISSIONS = [
  // Leads Module
  { name: 'leads.view', category: 'Leads & Enquiries', description: 'View leads and inquiry pipeline' },
  { name: 'leads.create', category: 'Leads & Enquiries', description: 'Create and ingest new leads' },
  { name: 'leads.edit', category: 'Leads & Enquiries', description: 'Edit lead details, stages and assignees' },
  { name: 'leads.delete', category: 'Leads & Enquiries', description: 'Delete or archive leads' },
  { name: 'leads.export', category: 'Leads & Enquiries', description: 'Export leads data to CSV / Excel' },

  // WhatsApp CRM Module
  { name: 'whatsapp.view', category: 'WhatsApp CRM', description: 'View WhatsApp chats and conversations' },
  { name: 'whatsapp.send', category: 'WhatsApp CRM', description: 'Send live messages and reply to chats' },
  { name: 'whatsapp.templates', category: 'WhatsApp CRM', description: 'Create and manage WhatsApp HSM templates' },
  { name: 'whatsapp.automation', category: 'WhatsApp CRM', description: 'Configure automated WhatsApp triggers' },

  // Sales Pipeline & Follow-ups
  { name: 'pipeline.view', category: 'Sales Pipeline', description: 'View Kanban sales stages and deals' },
  { name: 'pipeline.manage', category: 'Sales Pipeline', description: 'Move deals, mark Won / Lost' },
  { name: 'followups.manage', category: 'Sales Pipeline', description: 'Schedule and complete customer follow-ups' },

  // Customers & Accounts
  { name: 'customers.view', category: 'Customers', description: 'View customer accounts and order history' },
  { name: 'customers.manage', category: 'Customers', description: 'Create, edit and manage customer accounts' },

  // Quotations & Proposals
  { name: 'quotations.view', category: 'Quotations', description: 'View quotations and proposals' },
  { name: 'quotations.create', category: 'Quotations', description: 'Generate and send quotations with GST' },
  { name: 'quotations.manage', category: 'Quotations', description: 'Edit, revise, or delete quotations' },

  // Invoices & Billing
  { name: 'invoices.view', category: 'Invoices & Billing', description: 'View tax invoices and payment status' },
  { name: 'invoices.create', category: 'Invoices & Billing', description: 'Convert quotes to invoices & generate PDFs' },
  { name: 'invoices.payments', category: 'Invoices & Billing', description: 'Record customer payments and issue receipts' },

  // Dynamic QR Codes
  { name: 'qr.view', category: 'Dynamic QR', description: 'View dynamic QR codes and scan analytics' },
  { name: 'qr.manage', category: 'Dynamic QR', description: 'Generate, edit, and redirect smart QR codes' },

  // Digital Profile & Shop
  { name: 'profile.view', category: 'Digital Profile', description: 'View digital profile, catalog and products' },
  { name: 'profile.manage', category: 'Digital Profile', description: 'Edit branding, catalog items, and publish profile' },

  // Reports & Analytics
  { name: 'reports.view', category: 'Reports & Analytics', description: 'View revenue charts and sales analytics' },
  { name: 'reports.export', category: 'Reports & Analytics', description: 'Download business and pipeline reports' },

  // Team & User Roles
  { name: 'team.view', category: 'Team & Access', description: 'View team members and directory' },
  { name: 'team.manage', category: 'Team & Access', description: 'Invite, edit, or deactivate team members' },
  { name: 'roles.manage', category: 'Team & Access', description: 'Create and configure user roles & permissions' },

  // System & Settings
  { name: 'settings.manage', category: 'System Settings', description: 'Configure integrations, company info, and API keys' },

  // Sidebar Menu Access Permissions
  { name: 'menu.dashboard', category: 'Sidebar Menus', description: 'Access to Dashboard Overview menu' },
  { name: 'menu.leads', category: 'Sidebar Menus', description: 'Access to Leads & Enquiries menu' },
  { name: 'menu.whatsapp', category: 'Sidebar Menus', description: 'Access to WhatsApp Live CRM menu' },
  { name: 'menu.followups', category: 'Sidebar Menus', description: 'Access to Scheduled Follow-ups menu' },
  { name: 'menu.customers', category: 'Sidebar Menus', description: 'Access to Customer Accounts menu' },
  { name: 'menu.pipeline', category: 'Sidebar Menus', description: 'Access to Sales Pipeline (Kanban) menu' },
  { name: 'menu.digital_profile', category: 'Sidebar Menus', description: 'Access to Digital Profile & Mini Shop menu' },
  { name: 'menu.quotations', category: 'Sidebar Menus', description: 'Access to Quotations & Proposals menu' },
  { name: 'menu.invoices', category: 'Sidebar Menus', description: 'Access to Invoices & Billing menu' },
  { name: 'menu.billing', category: 'Sidebar Menus', description: 'Access to Payment Ledger menu' },
  { name: 'menu.qr', category: 'Sidebar Menus', description: 'Access to Dynamic QR Codes menu' },
  { name: 'menu.reports', category: 'Sidebar Menus', description: 'Access to Analytics & Reports menu' },
  { name: 'menu.roles', category: 'Sidebar Menus', description: 'Access to User Roles & Permissions menu' },
  { name: 'menu.team', category: 'Sidebar Menus', description: 'Access to Team Directory menu' },
  { name: 'menu.integrations', category: 'Sidebar Menus', description: 'Access to Meta & WhatsApp Integrations menu' },
  { name: 'menu.settings', category: 'Sidebar Menus', description: 'Access to Company Settings menu' },
];

const SYSTEM_ROLES = ['super_admin', 'admin', 'sales_manager', 'sales_executive', 'accounts'];

class RoleModel {
  /**
   * Seed default permissions and initial role mappings if empty or missing
   */
  static async ensurePermissionsSeed() {
    try {
      // Ensure all default permissions exist in permissions table
      for (const p of DEFAULT_PERMISSIONS) {
        await db.query(
          'INSERT IGNORE INTO permissions (name, category, description) VALUES (?, ?, ?)',
          [p.name, p.category, p.description]
        );
      }

      // Fetch all permissions with IDs
      const allPerms = await db.query('SELECT id, name FROM permissions');
      const permMap = {};
      allPerms.forEach(p => { permMap[p.name] = p.id; });

      // Define default mappings
      const rolePerms = {
        super_admin: allPerms.map(p => p.id),
        admin: allPerms.map(p => p.id),
        sales_manager: allPerms.filter(p => 
          p.name.startsWith('leads.') || 
          p.name.startsWith('whatsapp.') || 
          p.name.startsWith('pipeline.') || 
          p.name.startsWith('followups.') || 
          p.name.startsWith('customers.') || 
          p.name.startsWith('quotations.') || 
          p.name.startsWith('reports.') || 
          p.name === 'team.view' ||
          ['menu.dashboard', 'menu.leads', 'menu.whatsapp', 'menu.followups', 
           'menu.customers', 'menu.pipeline', 'menu.quotations', 'menu.reports', 'menu.team'].includes(p.name)
        ).map(p => p.id),
        sales_executive: allPerms.filter(p => 
          ['leads.view', 'leads.create', 'leads.edit', 'whatsapp.view', 'whatsapp.send', 
           'pipeline.view', 'pipeline.manage', 'followups.manage', 'customers.view', 
           'quotations.view', 'quotations.create', 'profile.view',
           'menu.dashboard', 'menu.leads', 'menu.whatsapp', 'menu.followups', 
           'menu.customers', 'menu.pipeline', 'menu.digital_profile', 'menu.quotations'].includes(p.name)
        ).map(p => p.id),
        accounts: allPerms.filter(p => 
          ['customers.view', 'quotations.view', 'invoices.view', 'invoices.create', 
           'invoices.payments', 'reports.view',
           'menu.dashboard', 'menu.customers', 'menu.quotations', 'menu.invoices', 'menu.billing', 'menu.reports'].includes(p.name)
        ).map(p => p.id)
      };

      for (const [roleName, pIds] of Object.entries(rolePerms)) {
        const roles = await db.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [roleName]);
        if (roles.length > 0) {
          const roleId = roles[0].id;
          for (const pid of pIds) {
            await db.query(
              'INSERT IGNORE INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)',
              [roleId, pid]
            );
          }
        }
      }
    } catch (err) {
      logger.warn('ROLES', `Permission seed notice: ${err.message}`);
    }
  }

  /**
   * Get all roles with user count and permissions
   */
  static async getAll() {
    await this.ensurePermissionsSeed();

    const rolesSql = `
      SELECT 
        r.id, 
        r.name, 
        r.display_name, 
        r.description, 
        r.created_at, 
        r.updated_at,
        (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id AND u.deleted_at IS NULL) AS user_count
      FROM roles r
      ORDER BY r.id ASC
    `;
    const roles = await db.query(rolesSql);

    // Fetch permissions for all roles
    const rhpSql = `
      SELECT rhp.role_id, p.name AS permission_name, p.category
      FROM role_has_permissions rhp
      JOIN permissions p ON rhp.permission_id = p.id
    `;
    const rhpRows = await db.query(rhpSql);

    const permsByRole = {};
    for (const row of rhpRows) {
      if (!permsByRole[row.role_id]) permsByRole[row.role_id] = [];
      permsByRole[row.role_id].push(row.permission_name);
    }

    return roles.map(r => ({
      ...r,
      user_count: Number(r.user_count || 0),
      is_system: SYSTEM_ROLES.includes(r.name) || r.id <= 5,
      permissions: permsByRole[r.id] || []
    }));
  }

  /**
   * Get a single role by ID
   */
  static async getById(id) {
    const roles = await db.query(
      `SELECT r.id, r.name, r.display_name, r.description, r.created_at, r.updated_at,
        (SELECT COUNT(*) FROM users u WHERE u.role_id = r.id AND u.deleted_at IS NULL) AS user_count
       FROM roles r WHERE r.id = ? LIMIT 1`,
      [id]
    );
    if (!roles || roles.length === 0) return null;
    const role = roles[0];

    const perms = await db.query(
      `SELECT p.name FROM role_has_permissions rhp
       JOIN permissions p ON rhp.permission_id = p.id
       WHERE rhp.role_id = ?`,
      [id]
    );

    return {
      ...role,
      user_count: Number(role.user_count || 0),
      is_system: SYSTEM_ROLES.includes(role.name) || role.id <= 5,
      permissions: perms.map(p => p.name)
    };
  }

  /**
   * Get a single role by name or display_name
   */
  static async getByName(name) {
    if (!name) return null;
    const roles = await db.query(
      `SELECT id FROM roles WHERE name = ? OR display_name = ? LIMIT 1`,
      [name, name]
    );
    if (!roles || roles.length === 0) return null;
    return this.getById(roles[0].id);
  }

  /**
   * Get all permissions grouped by category
   */
  static async getPermissions() {
    await this.ensurePermissionsSeed();
    const rows = await db.query('SELECT id, name, category, description FROM permissions ORDER BY category ASC, id ASC');

    const grouped = {};
    rows.forEach(p => {
      if (!grouped[p.category]) {
        grouped[p.category] = [];
      }
      grouped[p.category].push({
        id: p.id,
        name: p.name,
        category: p.category,
        description: p.description
      });
    });

    return Object.keys(grouped).map(cat => ({
      category: cat,
      permissions: grouped[cat]
    }));
  }

  /**
   * Create a new role
   */
  static async create({ name, display_name, description = '', permissions = [] }) {
    if (!display_name || !display_name.trim()) {
      throw new Error('Role display name is required');
    }

    // Auto-generate slug name if not provided
    let roleCode = name ? name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_') : '';
    if (!roleCode) {
      roleCode = display_name.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    }

    // Ensure uniqueness
    const existing = await db.query('SELECT id FROM roles WHERE name = ? LIMIT 1', [roleCode]);
    if (existing.length > 0) {
      roleCode = `${roleCode}_${Date.now().toString().slice(-4)}`;
    }

    const insertResult = await db.query(
      'INSERT INTO roles (name, display_name, description) VALUES (?, ?, ?)',
      [roleCode, display_name.trim(), description.trim()]
    );
    const newRoleId = insertResult.insertId;

    // Attach permissions
    if (Array.isArray(permissions) && permissions.length > 0) {
      await this.syncPermissions(newRoleId, permissions);
    }

    return this.getById(newRoleId);
  }

  /**
   * Update an existing role
   */
  static async update(id, { display_name, description, permissions }) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Role not found');
    }

    const updates = [];
    const params = [];

    if (display_name !== undefined) {
      updates.push('display_name = ?');
      params.push(display_name.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }

    if (updates.length > 0) {
      params.push(id);
      await db.query(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    // Sync permissions if provided
    if (Array.isArray(permissions)) {
      await this.syncPermissions(id, permissions);
    }

    return this.getById(id);
  }

  /**
   * Sync permissions for a role
   */
  static async syncPermissions(roleId, permissionNamesOrIds) {
    // Clear existing permissions for this role
    await db.query('DELETE FROM role_has_permissions WHERE role_id = ?', [roleId]);

    if (!permissionNamesOrIds || permissionNamesOrIds.length === 0) return;

    // Look up permission IDs by names or direct IDs
    const allPerms = await db.query('SELECT id, name FROM permissions');
    const permMap = {};
    allPerms.forEach(p => {
      permMap[p.name] = p.id;
      permMap[p.id] = p.id;
    });

    const targetIds = new Set();
    for (const item of permissionNamesOrIds) {
      if (permMap[item]) {
        targetIds.add(permMap[item]);
      }
    }

    for (const pId of targetIds) {
      await db.query(
        'INSERT IGNORE INTO role_has_permissions (role_id, permission_id) VALUES (?, ?)',
        [roleId, pId]
      );
    }
  }

  /**
   * Delete a custom role
   */
  static async delete(id) {
    const role = await this.getById(id);
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.is_system) {
      throw new Error('Default system roles (Super Admin, Admin, Sales Manager, etc.) cannot be deleted');
    }

    if (role.user_count > 0) {
      throw new Error(`Cannot delete role: ${role.user_count} active user(s) currently assigned. Please reassign them first.`);
    }

    // Delete permissions relationships (also handled by foreign key cascade)
    await db.query('DELETE FROM role_has_permissions WHERE role_id = ?', [id]);
    await db.query('DELETE FROM roles WHERE id = ?', [id]);

    return { success: true, message: `Role "${role.display_name}" deleted successfully` };
  }
}

module.exports = RoleModel;

