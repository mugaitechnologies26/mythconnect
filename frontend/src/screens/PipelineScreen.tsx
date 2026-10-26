import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  GitPullRequest, ArrowRight, ArrowLeft, Trophy, 
  Clock, IndianRupee, User, Sparkles, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BrandColors, PipelineColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Lead } from '../types';

export const PipelineScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { leads, updateLeadStatus, navigateToLeadDetail, showSnackbar } = useAppStore();

  const stages: { code: Lead['status_code']; label: string; color: string }[] = [
    { code: 'new', label: 'New Inquiries', color: '#1565E8' },
    { code: 'contacted', label: 'Contacted', color: '#3B82F6' },
    { code: 'qualified', label: 'Qualified', color: '#8B5CF6' },
    { code: 'quotation', label: 'Quotation Sent', color: '#F5A000' },
    { code: 'negotiation', label: 'Negotiation', color: '#EC4899' },
    { code: 'won', label: 'Closed Won 🏆', color: '#00A86B' },
    { code: 'lost', label: 'Lost', color: '#EF1D2D' },
  ];

  const handleMoveStage = (leadId: number, currentStage: Lead['status_code'], direction: 'next' | 'prev') => {
    const stageCodes: Lead['status_code'][] = ['new', 'contacted', 'qualified', 'quotation', 'negotiation', 'won', 'lost'];
    const currentIndex = stageCodes.indexOf(currentStage);
    const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

    if (newIndex >= 0 && newIndex < stageCodes.length) {
      const nextCode = stageCodes[newIndex];
      updateLeadStatus(leadId, nextCode);

      if (nextCode === 'won') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        showSnackbar('🎉 DEAL WON! Congratulations on closing the sale!', 'success');
      } else {
        showSnackbar(`Lead moved to ${nextCode.toUpperCase()}`, 'info');
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Sales Pipeline Kanban</Text>
          <Text style={styles.pageSubtitle}>
            Drag and move prospects across deal stages • Total Pipeline: ₹{(leads.reduce((a, l) => a + l.estimated_value, 0) / 100000).toFixed(1)} Lakhs
          </Text>
        </View>
      </View>

      {/* Kanban Board Horizontal Scroll */}
      <ScrollView horizontal style={styles.boardScroll} contentContainerStyle={styles.boardInner}>
        {stages.map((stage) => {
          const stageLeads = leads.filter(l => l.status_code === stage.code);
          const stageTotal = stageLeads.reduce((acc, l) => acc + l.estimated_value, 0);

          return (
            <View key={stage.code} style={styles.column}>
              {/* Column Header */}
              <View style={[styles.colHeader, { borderTopColor: stage.color }]}>
                <View style={styles.colTitleRow}>
                  <Text style={styles.colTitle}>{stage.label}</Text>
                  <View style={[styles.countBadge, { backgroundColor: stage.color + '20' }]}>
                    <Text style={[styles.countText, { color: stage.color }]}>{stageLeads.length}</Text>
                  </View>
                </View>
                <Text style={styles.colTotalValue}>
                  ₹{(stageTotal / 1000).toFixed(0)}k pipeline
                </Text>
              </View>

              {/* Cards inside this stage */}
              <ScrollView style={styles.colBody} showsVerticalScrollIndicator={false}>
                {stageLeads.length === 0 ? (
                  <View style={styles.emptyColBox}>
                    <Text style={styles.emptyColText}>No leads in this stage</Text>
                  </View>
                ) : (
                  stageLeads.map((lead) => (
                    <View key={lead.id} style={styles.leadCard}>
                      <TouchableOpacity 
                        onPress={() => navigateToLeadDetail(lead.id)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.cardHeader}>
                          <Text style={styles.cardLeadCode}>{lead.lead_code}</Text>
                          <Text style={styles.cardValue}>₹{lead.estimated_value.toLocaleString('en-IN')}</Text>
                        </View>

                        <Text style={styles.cardName}>{lead.name}</Text>
                        <Text style={styles.cardCompany} numberOfLines={1}>{lead.company_name}</Text>

                        <View style={styles.cardSourceTag}>
                          <Text style={styles.cardSourceText}>{lead.source_name}</Text>
                        </View>
                      </TouchableOpacity>

                      {/* Card Footer with Stage Mover Buttons */}
                      <View style={styles.cardFooter}>
                        <View style={styles.assigneeGroup}>
                          <Text style={styles.assigneeText}>👤 {lead.assigned_user_name.split(' ')[0]}</Text>
                        </View>

                        <View style={styles.stageMoverGroup}>
                          {stage.code !== 'new' && (
                            <TouchableOpacity
                              style={styles.moverBtn}
                              onPress={() => handleMoveStage(lead.id, lead.status_code, 'prev')}
                              title="Previous Stage"
                            >
                              <ArrowLeft size={13} color={BrandColors.textSecondary} />
                            </TouchableOpacity>
                          )}

                          {stage.code !== 'lost' && (
                            <TouchableOpacity
                              style={[styles.moverBtn, styles.nextBtn]}
                              onPress={() => handleMoveStage(lead.id, lead.status_code, 'next')}
                              title="Advance to Next Stage"
                            >
                              <ArrowRight size={13} color={BrandColors.blue} />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            </View>
          );
        })}
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
  boardScroll: {
    flex: 1,
  },
  boardInner: {
    padding: 20,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  column: {
    width: 290,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    maxHeight: '100%',
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  colHeader: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 4,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
  },
  colTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  colTotalValue: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  colBody: {
    padding: 10,
    maxHeight: 650,
  },
  emptyColBox: {
    padding: 24,
    alignItems: 'center',
  },
  emptyColText: {
    fontSize: 12,
    color: BrandColors.textMuted,
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLeadCode: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  cardValue: {
    fontSize: 12.5,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  cardName: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  cardCompany: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 1,
    marginBottom: 8,
  },
  cardSourceTag: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.surfaceSubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 10,
  },
  cardSourceText: {
    fontSize: 10,
    color: BrandColors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    paddingTop: 8,
  },
  assigneeGroup: {
    flex: 1,
  },
  assigneeText: {
    fontSize: 11,
    color: BrandColors.textSecondary,
  },
  stageMoverGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  moverBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    backgroundColor: BrandColors.blueLight,
    borderColor: '#BFDBFE',
  },
});
