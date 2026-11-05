import { User, RoleRecord } from '../types';
import { ScreenType } from '../store/useAppStore';

export interface MenuItemDef {
  key: ScreenType;
  label: string;
  category: 'CORE' | 'SALES' | 'FINANCE' | 'SYSTEM';
  description: string;
  menuPermission: string;
  fallbackPermissions: string[];
}

export const MENU_DEFINITIONS: MenuItemDef[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    category: 'CORE',
    description: 'Executive overview, business KPIs, and recent activity',
    menuPermission: 'menu.dashboard',
    fallbackPermissions: [],
  },
  {
    key: 'leads',
    label: 'Leads',
    category: 'SALES',
    description: 'Meta lead ads, website forms, and omnichannel pipeline',
    menuPermission: 'menu.leads',
    fallbackPermissions: ['leads.view', 'leads.create'],
  },
  {
    key: 'whatsapp',
    label: 'WhatsApp CRM',
    category: 'SALES',
    description: 'Live WhatsApp cloud inbox, chat broadcasts, and templates',
    menuPermission: 'menu.whatsapp',
    fallbackPermissions: ['whatsapp.view', 'whatsapp.send'],
  },
  {
    key: 'followups',
    label: 'Follow-ups',
    category: 'SALES',
    description: 'Scheduled reminders, calls, and customer follow-up actions',
    menuPermission: 'menu.followups',
    fallbackPermissions: ['followups.manage', 'pipeline.view', 'leads.view'],
  },
  {
    key: 'customers',
    label: 'Customers',
    category: 'SALES',
    description: 'Verified accounts, order history, and contact directory',
    menuPermission: 'menu.customers',
    fallbackPermissions: ['customers.view', 'customers.manage'],
  },
  {
    key: 'pipeline',
    label: 'Sales Pipeline',
    category: 'SALES',
    description: 'Visual Kanban deal stages, conversion funnel, and revenue',
    menuPermission: 'menu.pipeline',
    fallbackPermissions: ['pipeline.view', 'pipeline.manage'],
  },
  {
    key: 'digital_profile',
    label: 'Digital Profile',
    category: 'SALES',
    description: 'Smart vCard, digital shop catalog, and lead collection',
    menuPermission: 'menu.digital_profile',
    fallbackPermissions: ['profile.view', 'profile.manage'],
  },
  {
    key: 'quotations',
    label: 'Quotations',
    category: 'FINANCE',
    description: 'Client proposals, estimates, and 18% GST invoices',
    menuPermission: 'menu.quotations',
    fallbackPermissions: ['quotations.view', 'quotations.create'],
  },
  {
    key: 'invoices',
    label: 'Invoices',
    category: 'FINANCE',
    description: 'Tax invoices, converted orders, and PDF downloads',
    menuPermission: 'menu.invoices',
    fallbackPermissions: ['invoices.view', 'invoices.create'],
  },
  {
    key: 'billing',
    label: 'Billing & Payments',
    category: 'FINANCE',
    description: 'Payment receipts, ledger balance, and collection records',
    menuPermission: 'menu.billing',
    fallbackPermissions: ['invoices.payments', 'invoices.view'],
  },
  {
    key: 'qr',
    label: 'QR Manager',
    category: 'SALES',
    description: 'Dynamic branded QR codes, redirect targets, and scan metrics',
    menuPermission: 'menu.qr',
    fallbackPermissions: ['qr.view', 'qr.manage'],
  },
  {
    key: 'reports',
    label: 'Reports',
    category: 'CORE',
    description: 'Revenue performance, lead sources ROI, and leaderboards',
    menuPermission: 'menu.reports',
    fallbackPermissions: ['reports.view', 'reports.export'],
  },
  {
    key: 'roles',
    label: 'User Roles',
    category: 'SYSTEM',
    description: 'RBAC permissions, menu access control, and user role setup',
    menuPermission: 'menu.roles',
    fallbackPermissions: ['roles.manage'],
  },
  {
    key: 'team',
    label: 'Team',
    category: 'SYSTEM',
    description: 'Team directory, member invitations, and department assignment',
    menuPermission: 'menu.team',
    fallbackPermissions: ['team.view', 'team.manage'],
  },
  {
    key: 'integrations',
    label: 'Integrations',
    category: 'SYSTEM',
    description: 'Meta Ads Webhooks, WhatsApp Cloud API, and automation rules',
    menuPermission: 'menu.integrations',
    fallbackPermissions: ['settings.manage'],
  },
  {
    key: 'settings',
    label: 'Settings',
    category: 'SYSTEM',
    description: 'Company legal profile, GSTIN, currency, and address',
    menuPermission: 'menu.settings',
    fallbackPermissions: ['settings.manage'],
  },
];

/**
 * Check if a role record has access to a given menu screen
 */
export const isRoleMenuAccessible = (screen: ScreenType, role: RoleRecord | undefined | null): boolean => {
  if (!role) return false;

  // Super Admin & Admin have unrestricted access to all menus
  if (role.name === 'super_admin' || role.name === 'admin') {
    return true;
  }

  // Dashboard is accessible to all roles
  if (screen === 'dashboard') {
    return true;
  }

  // Detail screen relies on parent list permission
  if (screen === 'lead_detail') {
    return isRoleMenuAccessible('leads', role);
  }

  const def = MENU_DEFINITIONS.find(m => m.key === screen);
  if (!def) return true;

  const perms = role.permissions || [];

  // 1. Direct explicit menu permission match
  if (perms.includes(def.menuPermission)) {
    return true;
  }

  // 2. Functional permission match (e.g., 'leads.view' grants access to 'leads' menu)
  if (def.fallbackPermissions.some(fp => perms.includes(fp))) {
    return true;
  }

  return false;
};

/**
 * Check if the active logged-in user has access to a given screen
 */
export const hasMenuAccess = (
  screen: ScreenType, 
  user: User | null, 
  roles: RoleRecord[]
): boolean => {
  if (!user) return false;

  // Super Admin & Admin bypass all restrictions
  if (user.role === 'super_admin' || user.role === 'admin') {
    return true;
  }

  // Universal dashboard access
  if (screen === 'dashboard') {
    return true;
  }

  // Detail screens
  if (screen === 'lead_detail') {
    return hasMenuAccess('leads', user, roles);
  }

  const userRole = roles.find(r => r.name === user.role);
  if (!userRole) {
    // Default fallback if role metadata is loading: sales managers / executives have basic sales menus
    if (['sales_manager', 'sales_executive'].includes(user.role)) {
      return ['dashboard', 'leads', 'whatsapp', 'followups', 'customers', 'pipeline', 'quotations'].includes(screen);
    }
    if (user.role === 'accounts') {
      return ['dashboard', 'customers', 'quotations', 'invoices', 'billing', 'reports'].includes(screen);
    }
    return false;
  }

  return isRoleMenuAccessible(screen, userRole);
};

/**
 * Get list of all accessible screen keys for a role
 */
export const getRoleAccessibleScreens = (role: RoleRecord | undefined | null): ScreenType[] => {
  if (!role) return ['dashboard'];
  return MENU_DEFINITIONS
    .filter(m => isRoleMenuAccessible(m.key, role))
    .map(m => m.key);
};
