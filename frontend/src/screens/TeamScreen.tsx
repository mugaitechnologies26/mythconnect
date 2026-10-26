import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ShieldCheck, UserCheck, Mail, Phone, Plus } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const TeamScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { users, showSnackbar } = useAppStore();

  const members = users.map(u => ({
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role_display || u.role,
    team: u.team_name || 'General',
    status: u.is_active ? 'Active' : 'Inactive'
  }));

  return (
    <View style={styles.container}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Team & Access Control</Text>
          <Text style={styles.pageSubtitle}>
            Role-based permissions (RBAC) across sales, operations, and finance teams
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => showSnackbar('Invite sent to new team member!', 'success')}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Invite Member</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>NAME & TEAM</Text>
            <Text style={[styles.th, { flex: 1.5 }]}>EMAIL & CONTACT</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>ASSIGNED ROLE</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
          </View>

          {members.map((m, i) => (
            <View key={i} style={styles.tableRow}>
              <View style={[styles.td, { flex: 2 }]}>
                <Text style={styles.nameText}>{m.name}</Text>
                <Text style={styles.teamText}>{m.team}</Text>
              </View>

              <View style={[styles.td, { flex: 1.5 }]}>
                <Text style={styles.emailText}>{m.email}</Text>
                <Text style={styles.phoneText}>{m.phone}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2 }]}>
                <View style={styles.roleBadge}>
                  <Text style={styles.roleBadgeText}>{m.role}</Text>
                </View>
              </View>

              <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>{m.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.bg,
  },
  header: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  pageSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    paddingBottom: 80,
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  th: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  td: {
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  teamText: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  emailText: {
    fontSize: 12.5,
    color: BrandColors.textPrimary,
  },
  phoneText: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.blueLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  statusPill: {
    backgroundColor: BrandColors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.green,
  },
});
