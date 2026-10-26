import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { 
  LayoutDashboard, Users, MessageSquare, Clock, UserCheck, 
  GitPullRequest, FileText, Receipt, QrCode, BarChart3, 
  ShieldCheck, Sliders, ChevronLeft, ChevronRight, LogOut, CreditCard,
  Contact
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { BrandColors } from '../theme';
import { useAppStore, ScreenType } from '../store/useAppStore';

interface NavItem {
  key: ScreenType;
  label: string;
  icon: any;
  badge?: number | string;
  badgeColor?: string;
}

export const AppSidebar: React.FC = () => {
  const { 
    activeScreen, 
    setActiveScreen, 
    isSidebarCollapsed, 
    toggleSidebar, 
    currentUser, 
    logout,
    followups,
    conversations,
    leads
  } = useAppStore();

  const unreadWhatsApp = conversations.reduce((acc, c) => acc + c.unread_count, 0);
  const pendingFollowups = followups.filter(f => f.status === 'pending').length;
  const newLeads = leads.filter(l => l.status_code === 'new').length;

  const navItems: NavItem[] = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'leads', label: 'Leads', icon: Users, badge: newLeads > 0 ? newLeads : undefined, badgeColor: BrandColors.blue },
    { key: 'whatsapp', label: 'WhatsApp CRM', icon: MessageSquare, badge: unreadWhatsApp > 0 ? unreadWhatsApp : undefined, badgeColor: BrandColors.green },
    { key: 'followups', label: 'Follow-ups', icon: Clock, badge: pendingFollowups > 0 ? pendingFollowups : undefined, badgeColor: BrandColors.orange },
    { key: 'customers', label: 'Customers', icon: UserCheck },
    { key: 'pipeline', label: 'Sales Pipeline', icon: GitPullRequest },
    { key: 'digital_profile', label: 'Digital Profile', icon: Contact, badge: 'Live', badgeColor: BrandColors.green },
    { key: 'quotations', label: 'Quotations', icon: FileText },
    { key: 'invoices', label: 'Invoices', icon: Receipt },
    { key: 'billing', label: 'Billing & Payments', icon: CreditCard },
    { key: 'qr', label: 'QR Manager', icon: QrCode },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'team', label: 'Team', icon: ShieldCheck },
    { key: 'integrations', label: 'Integrations', icon: Sliders },
    { key: 'settings', label: 'Settings', icon: Sliders },
  ];

  return (
    <View style={[
      styles.sidebar, 
      isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
    ]}>
      {/* Top Header & Logo */}
      <View style={styles.header}>
        <BrandLogo size={isSidebarCollapsed ? 'compact' : 'md'} showTagline={false} />
        <TouchableOpacity 
          style={styles.collapseBtn} 
          onPress={toggleSidebar}
          activeOpacity={0.7}
        >
          {isSidebarCollapsed ? (
            <ChevronRight size={18} color={BrandColors.textSecondary} />
          ) : (
            <ChevronLeft size={18} color={BrandColors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Navigation Links */}
      <ScrollView style={styles.navList} showsVerticalScrollIndicator={false}>
        <View style={styles.navGroup}>
          {!isSidebarCollapsed && (
            <Text style={styles.groupTitle}>PLATFORM</Text>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.navItem,
                  isActive && styles.navItemActive,
                  isSidebarCollapsed && styles.navItemCollapsed
                ]}
                onPress={() => setActiveScreen(item.key)}
                activeOpacity={0.8}
              >
                <View style={styles.navItemContent}>
                  <Icon 
                    size={19} 
                    color={isActive ? BrandColors.blue : BrandColors.textSecondary} 
                  />
                  {!isSidebarCollapsed && (
                    <Text style={[
                      styles.navLabel,
                      isActive && styles.navLabelActive
                    ]}>
                      {item.label}
                    </Text>
                  )}
                </View>

                {!isSidebarCollapsed && item.badge !== undefined && (
                  <View style={[styles.badge, { backgroundColor: item.badgeColor || BrandColors.blue }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* User Profile Card at Bottom */}
      <View style={styles.footer}>
        <View style={[styles.userCard, isSidebarCollapsed && styles.userCardCollapsed]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {currentUser?.name.charAt(0) || 'U'}
            </Text>
          </View>
          {!isSidebarCollapsed && (
            <View style={styles.userInfo}>
              <Text style={styles.userName} numberOfLines={1}>{currentUser?.name}</Text>
              <Text style={styles.userRole} numberOfLines={1}>{currentUser?.role_display}</Text>
            </View>
          )}
          {!isSidebarCollapsed && (
            <TouchableOpacity 
              style={styles.logoutBtn} 
              onPress={logout}
              activeOpacity={0.7}
              title="Logout"
            >
              <LogOut size={16} color={BrandColors.red} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: BrandColors.border,
    display: 'flex',
    flexDirection: 'column',
    zIndex: 20,
    transition: 'width 0.2s ease',
  } as any,
  sidebarExpanded: {
    width: 250,
  },
  sidebarCollapsed: {
    width: 72,
  },
  header: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  collapseBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    backgroundColor: BrandColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navList: {
    flex: 1,
    paddingTop: 12,
  },
  navGroup: {
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  groupTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 3,
  },
  navItemCollapsed: {
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  navItemActive: {
    backgroundColor: BrandColors.blueLight,
  },
  navItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navLabel: {
    fontSize: 13.5,
    fontWeight: '500',
    color: BrandColors.textPrimary,
  },
  navLabelActive: {
    fontWeight: '600',
    color: BrandColors.blue,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    backgroundColor: '#FAFCFE',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 6,
    borderRadius: 8,
  },
  userCardCollapsed: {
    justifyContent: 'center',
    padding: 2,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BrandColors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  userRole: {
    fontSize: 11,
    color: BrandColors.textSecondary,
  },
  logoutBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
