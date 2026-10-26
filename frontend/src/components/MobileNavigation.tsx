import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LayoutDashboard, Users, MessageSquare, GitPullRequest, Menu } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore, ScreenType } from '../store/useAppStore';

export const MobileNavigation: React.FC = () => {
  const { activeScreen, setActiveScreen, setMobileDrawerOpen, conversations, leads } = useAppStore();

  const unreadCount = conversations.reduce((acc, c) => acc + c.unread_count, 0);
  const newLeadsCount = leads.filter(l => l.status_code === 'new').length;

  const items = [
    { key: 'dashboard' as ScreenType, label: 'Home', icon: LayoutDashboard },
    { key: 'leads' as ScreenType, label: 'Leads', icon: Users, badge: newLeadsCount > 0 ? newLeadsCount : undefined },
    { key: 'whatsapp' as ScreenType, label: 'WhatsApp', icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : undefined },
    { key: 'pipeline' as ScreenType, label: 'Pipeline', icon: GitPullRequest },
  ];

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeScreen === item.key;

        return (
          <TouchableOpacity
            key={item.key}
            style={styles.navBtn}
            onPress={() => setActiveScreen(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <Icon 
                size={22} 
                color={isActive ? BrandColors.blue : BrandColors.textSecondary} 
              />
              {item.badge !== undefined && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </View>
            <Text style={[
              styles.navLabel, 
              { color: isActive ? BrandColors.blue : BrandColors.textSecondary }
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* More / Menu Drawer Trigger */}
      <TouchableOpacity
        style={styles.navBtn}
        onPress={() => setMobileDrawerOpen(true)}
        activeOpacity={0.7}
      >
        <Menu size={22} color={BrandColors.textSecondary} />
        <Text style={[styles.navLabel, { color: BrandColors.textSecondary }]}>More</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  navBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  iconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: BrandColors.red,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  navLabel: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 3,
  },
});
