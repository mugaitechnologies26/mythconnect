import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Menu, Search, Bell, Sparkles, CheckCircle2, ChevronDown, Check } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { BrandLogo } from './BrandLogo';
import { RoleType } from '../types';

export const AppHeader: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    currentUser, 
    switchUserRole,
    notifications, 
    markAllNotificationsRead, 
    setSearchOpen,
    setMetaSimModalOpen,
    setMobileDrawerOpen
  } = useAppStore();

  const [isNotifOpen, setNotifOpen] = useState(false);
  const [isRoleMenuOpen, setRoleMenuOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const roles: { key: RoleType; label: string }[] = [
    { key: 'super_admin', label: 'Super Admin' },
    { key: 'admin', label: 'Admin' },
    { key: 'sales_manager', label: 'Sales Manager' },
    { key: 'sales_executive', label: 'Sales Executive' },
    { key: 'accounts', label: 'Accounts' },
  ];

  return (
    <View style={styles.header}>
      {/* Left side: Hamburger for mobile / Brand logo on small screens */}
      <View style={styles.leftGroup}>
        {isMobile && (
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => setMobileDrawerOpen(true)}
            activeOpacity={0.7}
          >
            <Menu size={22} color={BrandColors.darkNavy} />
          </TouchableOpacity>
        )}
        
        {isMobile && (
          <BrandLogo size="sm" showTagline={false} />
        )}

        {/* Global Search Button / Trigger */}
        {!isMobile && (
          <TouchableOpacity 
            style={styles.searchBar} 
            onPress={() => setSearchOpen(true)}
            activeOpacity={0.8}
          >
            <Search size={16} color={BrandColors.textSecondary} />
            <Text style={styles.searchPlaceholder}>Search leads, customers, invoices...</Text>
            <View style={styles.kbdBadge}>
              <Text style={styles.kbdText}>Ctrl K</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Right side actions */}
      <View style={styles.rightGroup}>
        {/* Simulate Meta Lead Trigger Button */}
        <TouchableOpacity 
          style={styles.simulateBtn}
          onPress={() => setMetaSimModalOpen(true)}
          activeOpacity={0.8}
        >
          <Sparkles size={16} color="#FFFFFF" />
          {!isMobile && (
            <Text style={styles.simulateBtnText}>Simulate Meta Lead</Text>
          )}
        </TouchableOpacity>

        {/* Realtime Engine Status Indicator */}
        {!isMobile && (
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Realtime Sync</Text>
          </View>
        )}

        {/* Mobile Search Icon */}
        {isMobile && (
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setSearchOpen(true)}
            activeOpacity={0.7}
          >
            <Search size={20} color={BrandColors.textSecondary} />
          </TouchableOpacity>
        )}

        {/* Notification Bell */}
        <View style={styles.relativeBox}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setNotifOpen(!isNotifOpen)}
            activeOpacity={0.7}
          >
            <Bell size={20} color={BrandColors.textSecondary} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notification Popover Dropdown */}
          {isNotifOpen && (
            <View style={styles.notifDropdown}>
              <View style={styles.notifHeader}>
                <Text style={styles.notifTitle}>Notifications</Text>
                {unreadCount > 0 && (
                  <TouchableOpacity onPress={markAllNotificationsRead}>
                    <Text style={styles.markReadText}>Mark all as read</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.notifList}>
                {notifications.slice(0, 5).map((n) => (
                  <View key={n.id} style={[styles.notifItem, !n.is_read && styles.notifItemUnread]}>
                    <View style={styles.notifRow}>
                      <Text style={styles.notifItemTitle}>{n.title}</Text>
                      {!n.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage} numberOfLines={2}>{n.message}</Text>
                    <Text style={styles.notifTime}>Just now</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Role Switcher Pill */}
        <View style={styles.relativeBox}>
          <TouchableOpacity 
            style={styles.rolePicker}
            onPress={() => setRoleMenuOpen(!isRoleMenuOpen)}
            activeOpacity={0.8}
          >
            <View style={styles.roleDot} />
            <Text style={styles.roleText}>{currentUser?.role_display}</Text>
            <ChevronDown size={14} color={BrandColors.textSecondary} />
          </TouchableOpacity>

          {isRoleMenuOpen && (
            <View style={styles.roleDropdown}>
              <Text style={styles.roleDropdownHeader}>SWITCH ROLE (TESTING)</Text>
              {roles.map(r => (
                <TouchableOpacity
                  key={r.key}
                  style={styles.roleOption}
                  onPress={() => {
                    switchUserRole(r.key);
                    setRoleMenuOpen(false);
                  }}
                >
                  <Text style={[
                    styles.roleOptionText,
                    currentUser?.role === r.key && styles.roleOptionActive
                  ]}>
                    {r.label}
                  </Text>
                  {currentUser?.role === r.key && (
                    <Check size={14} color={BrandColors.blue} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    width: 320,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 13,
    color: BrandColors.textMuted,
    flex: 1,
  },
  kbdBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  kbdText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  simulateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  simulateBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BrandColors.green,
  },
  liveText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BrandColors.green,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: BrandColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: BrandColors.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  relativeBox: {
    position: 'relative',
  },
  notifDropdown: {
    position: 'absolute',
    top: 46,
    right: 0,
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  notifHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  notifTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  markReadText: {
    fontSize: 12,
    color: BrandColors.blue,
    fontWeight: '600',
  },
  notifList: {
    maxHeight: 350,
  },
  notifItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  notifItemUnread: {
    backgroundColor: BrandColors.blueLight,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  unreadDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.blue,
  },
  notifMessage: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  notifTime: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
    marginTop: 4,
  },
  rolePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 6,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BrandColors.blue,
  },
  roleText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.darkNavy,
  },
  roleDropdown: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 6,
    zIndex: 100,
  },
  roleDropdownHeader: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textMuted,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  roleOptionText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
  },
  roleOptionActive: {
    fontWeight: '700',
    color: BrandColors.blue,
  },
});
