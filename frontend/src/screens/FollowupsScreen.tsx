import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { 
  Clock, Plus, Phone, MessageSquare, Video, Mail, 
  CheckCircle2, AlertCircle, Calendar, User, X, Check
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Followup, FollowupType } from '../types';

export const FollowupsScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { followups, completeFollowup, addFollowup, showSnackbar, navigateToLeadDetail } = useAppStore();

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'overdue' | 'completed'>('today');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // New Followup Form
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('+91');
  const [type, setType] = useState<FollowupType>('call');
  const [notes, setNotes] = useState('');

  // Classify followups
  const overdueFollowups = followups.filter(f => f.status === 'pending' && f.notes.includes('OVERDUE'));
  const todayFollowups = followups.filter(f => f.status === 'pending' && !f.notes.includes('OVERDUE'));
  const completedFollowups = followups.filter(f => f.status === 'completed');
  const upcomingFollowups = followups.filter(f => f.status === 'pending' && f.notes.toLowerCase().includes('demo'));

  const displayedList = 
    activeTab === 'overdue' ? overdueFollowups :
    activeTab === 'today' ? todayFollowups :
    activeTab === 'completed' ? completedFollowups : upcomingFollowups;

  const handleCreateFollowup = () => {
    if (!leadName.trim()) {
      showSnackbar('Please enter lead name', 'error');
      return;
    }

    addFollowup({
      lead_id: 1,
      lead_name: leadName,
      lead_phone: leadPhone,
      lead_company: `${leadName} Enterprise`,
      assigned_to: 4,
      assigned_user_name: 'Sneha Kulkarni',
      scheduled_at: new Date().toISOString(),
      type,
      status: 'pending',
      notes: notes || 'Standard sales cadence follow-up'
    });

    setAddModalOpen(false);
    setLeadName('');
    setNotes('');
    showSnackbar('Follow-up scheduled successfully!', 'success');
  };

  const getTypeIcon = (t: FollowupType) => {
    switch (t) {
      case 'call': return <Phone size={16} color={BrandColors.blue} />;
      case 'whatsapp': return <MessageSquare size={16} color={BrandColors.green} />;
      case 'meeting': return <Video size={16} color="#8B5CF6" />;
      case 'email': return <Mail size={16} color={BrandColors.orange} />;
      default: return <Clock size={16} color={BrandColors.textSecondary} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Page Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Follow-up Management</Text>
          <Text style={styles.pageSubtitle}>
            Track scheduled calls, WhatsApp nudges, and client demo meetings
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setAddModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Schedule Follow-up</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabBar}>
        {[
          { key: 'today', label: `Today's (${todayFollowups.length})` },
          { key: 'overdue', label: `Overdue (${overdueFollowups.length})`, alert: overdueFollowups.length > 0 },
          { key: 'upcoming', label: `Upcoming (${upcomingFollowups.length})` },
          { key: 'completed', label: `Completed (${completedFollowups.length})` },
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Text style={[
              styles.tabText, 
              activeTab === tab.key && styles.tabTextActive,
              tab.alert && styles.tabTextAlert
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Follow-up Cards List */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        {displayedList.length === 0 ? (
          <View style={styles.emptyCard}>
            <CheckCircle2 size={42} color={BrandColors.green} />
            <Text style={styles.emptyTitle}>All caught up!</Text>
            <Text style={styles.emptyDesc}>No follow-ups currently pending in this category</Text>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {displayedList.map(f => {
              const isOverdue = f.notes.includes('OVERDUE');
              return (
                <View key={f.id} style={[styles.followupCard, isOverdue && styles.overdueCard]}>
                  <View style={styles.cardTop}>
                    <View style={styles.typeBadge}>
                      {getTypeIcon(f.type)}
                      <Text style={styles.typeBadgeText}>{f.type.toUpperCase()}</Text>
                    </View>

                    {isOverdue ? (
                      <View style={styles.overdueBadge}>
                        <AlertCircle size={12} color={BrandColors.red} />
                        <Text style={styles.overdueBadgeText}>OVERDUE</Text>
                      </View>
                    ) : f.status === 'completed' ? (
                      <View style={styles.completedBadge}>
                        <Check size={12} color={BrandColors.green} />
                        <Text style={styles.completedBadgeText}>COMPLETED</Text>
                      </View>
                    ) : (
                      <Text style={styles.dueTimeText}>Scheduled Today</Text>
                    )}
                  </View>

                  <TouchableOpacity onPress={() => navigateToLeadDetail(f.lead_id)}>
                    <Text style={styles.leadName}>{f.lead_name}</Text>
                    <Text style={styles.companyName}>{f.lead_company}</Text>
                  </TouchableOpacity>

                  <Text style={styles.notesText}>{f.notes}</Text>

                  <View style={styles.cardFooter}>
                    <View style={styles.assigneeGroup}>
                      <User size={13} color={BrandColors.textSecondary} />
                      <Text style={styles.assigneeName}>{f.assigned_user_name}</Text>
                    </View>

                    {f.status !== 'completed' && (
                      <TouchableOpacity 
                        style={styles.markDoneBtn}
                        onPress={() => {
                          completeFollowup(f.id);
                          showSnackbar('Marked follow-up as completed!', 'success');
                        }}
                      >
                        <CheckCircle2 size={15} color={BrandColors.green} />
                        <Text style={styles.markDoneBtnText}>Complete</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Add Follow-up Modal */}
      <Modal visible={isAddModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Follow-up</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <X size={20} color={BrandColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Lead Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Sunil Kumar"
                  value={leadName}
                  onChangeText={setLeadName}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Phone Number</Text>
                <TextInput
                  style={styles.formInput}
                  value={leadPhone}
                  onChangeText={setLeadPhone}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Follow-up Channel</Text>
                <View style={styles.channelRow}>
                  {(['call', 'whatsapp', 'meeting', 'email'] as FollowupType[]).map(ch => (
                    <TouchableOpacity
                      key={ch}
                      style={[styles.channelBtn, type === ch && styles.channelBtnActive]}
                      onPress={() => setType(ch)}
                    >
                      {getTypeIcon(ch)}
                      <Text style={[styles.channelBtnText, type === ch && styles.channelBtnTextActive]}>
                        {ch.charAt(0).toUpperCase() + ch.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Notes / Agenda</Text>
                <TextInput
                  style={[styles.formInput, { minHeight: 60 }]}
                  placeholder="Discuss revised proposal and multi-seat pricing..."
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddModalOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleCreateFollowup}>
                <Text style={styles.confirmBtnText}>Schedule Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    gap: 14,
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
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingHorizontal: 24,
  },
  tabItem: {
    paddingVertical: 14,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: BrandColors.blue,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  tabTextActive: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  tabTextAlert: {
    color: BrandColors.red,
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    paddingBottom: 80,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  followupCard: {
    width: 'calc(33.333% - 11px)' as any,
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 12,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  overdueCard: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 6,
  },
  typeBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  overdueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.redLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: BrandColors.red,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.greenLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 4,
  },
  completedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: BrandColors.green,
  },
  dueTimeText: {
    fontSize: 11,
    color: BrandColors.orange,
    fontWeight: '600',
  },
  leadName: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  companyName: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 8,
  },
  notesText: {
    fontSize: 12.5,
    color: BrandColors.textSecondary,
    lineHeight: 18,
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    paddingTop: 10,
  },
  assigneeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assigneeName: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  markDoneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.greenLight,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  markDoneBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.green,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginTop: 12,
  },
  emptyDesc: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalDialog: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  modalBody: {
    padding: 20,
    gap: 12,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  formInput: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    outlineStyle: 'none' as any,
  },
  channelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  channelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
    gap: 6,
  },
  channelBtnActive: {
    backgroundColor: BrandColors.blueLight,
    borderColor: BrandColors.blue,
  },
  channelBtnText: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    fontWeight: '600',
  },
  channelBtnTextActive: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    backgroundColor: '#FAFCFE',
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  confirmBtn: {
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 8,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
