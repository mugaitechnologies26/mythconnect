import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { 
  Users, UserPlus, Clock, CheckCircle2, TrendingUp, 
  IndianRupee, FileText, AlertCircle, ArrowUpRight, ArrowRight,
  Sparkles, MessageSquare, Phone, ChevronRight
} from 'lucide-react';
import { BrandColors, PipelineColors } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const DashboardScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    currentUser, 
    kpis, 
    leads, 
    followups, 
    completeFollowup, 
    navigateToLeadDetail, 
    setActiveScreen,
    setMetaSimModalOpen 
  } = useAppStore();

  const recentLeads = leads.slice(0, 5);
  const todaysFollowups = followups.filter(f => f.status === 'pending').slice(0, 4);

  const kpiCards = [
    { label: 'Total Leads', value: kpis.totalLeads, icon: Users, color: BrandColors.blue, bg: BrandColors.blueLight, change: '+14% this month' },
    { label: 'New Leads', value: kpis.newLeads, icon: UserPlus, color: '#2563EB', bg: '#EFF6FF', change: '8 from Meta today' },
    { label: 'Follow-ups Today', value: kpis.followupsToday, icon: Clock, color: BrandColors.orange, bg: BrandColors.orangeLight, change: '2 urgent calls' },
    { label: 'Converted Leads', value: kpis.convertedLeads, icon: CheckCircle2, color: BrandColors.green, bg: BrandColors.greenLight, change: `${kpis.conversionRate}% rate` },
    { label: 'Revenue Won', value: `₹${(kpis.revenue / 100000).toFixed(2)}L`, icon: IndianRupee, color: BrandColors.darkNavy, bg: '#F1F5F9', change: '+22% vs last month' },
    { label: 'Conversion Rate', value: `${kpis.conversionRate}%`, icon: TrendingUp, color: '#7C3AED', bg: '#F5F3FF', change: 'Industry avg 18%' },
    { label: 'Pending Quotes', value: kpis.pendingQuotations, icon: FileText, color: '#D97706', bg: '#FEF3C7', change: 'Valued at ₹9.8L' },
    { label: 'Pending Payments', value: `₹${(kpis.pendingPayments / 1000).toFixed(0)}k`, icon: AlertCircle, color: BrandColors.red, bg: BrandColors.redLight, change: '1 overdue by 8d' },
  ];

  const totalLeadCount = leads.length || 1;
  const sourceCounts: Record<string, number> = {};
  leads.forEach(l => {
    const src = l.source_name || 'Other';
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  });

  const leadSources = [
    { name: 'Meta Lead Ads (FB & IG)', count: sourceCounts['Meta Lead Ads'] || 0, color: BrandColors.blue },
    { name: 'WhatsApp Inbound', count: sourceCounts['WhatsApp Inbound'] || 0, color: BrandColors.green },
    { name: 'Website Form', count: sourceCounts['Website Form'] || 0, color: BrandColors.orange },
    { name: 'Direct Referral', count: sourceCounts['Direct Referral'] || 0, color: BrandColors.darkNavy },
    { name: 'Manual Outreach', count: sourceCounts['Manual Outreach'] || 0, color: '#64748B' },
  ].map(s => ({ ...s, pct: Math.round((s.count / totalLeadCount) * 100) }));

  const pipelineStages = [
    { name: 'New', count: leads.filter(l => l.status_code === 'new').length, color: '#1565E8' },
    { name: 'Contacted', count: leads.filter(l => l.status_code === 'contacted').length, color: '#3B82F6' },
    { name: 'Qualified', count: leads.filter(l => l.status_code === 'qualified').length, color: '#8B5CF6' },
    { name: 'Quotation', count: leads.filter(l => l.status_code === 'quotation').length, color: '#F5A000' },
    { name: 'Negotiation', count: leads.filter(l => l.status_code === 'negotiation').length, color: '#EC4899' },
    { name: 'Won', count: leads.filter(l => l.status_code === 'won').length, color: '#00A86B' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Welcome Banner */}
      <View style={[styles.welcomeBanner, isMobile && styles.welcomeBannerMobile]}>
        <View style={styles.welcomeTextGroup}>
          <Text style={styles.greeting}>Good Morning, {currentUser?.name.split(' ')[0]} 👋</Text>
          <Text style={styles.subGreeting}>
            Here is your live sales pipeline summary. 8 Meta leads arrived today with automated WhatsApp greetings.
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.quickSimBtn}
          onPress={() => setMetaSimModalOpen(true)}
          activeOpacity={0.8}
        >
          <Sparkles size={16} color="#FFFFFF" />
          <Text style={styles.quickSimBtnText}>Test Meta Lead Capture</Text>
        </TouchableOpacity>
      </View>

      {/* 8 Compact KPI Cards */}
      <View style={styles.kpiGrid}>
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <View key={idx} style={[styles.kpiCard, isMobile && styles.kpiCardMobile]}>
              <View style={styles.kpiHeader}>
                <Text style={styles.kpiLabel}>{kpi.label}</Text>
                <View style={[styles.kpiIconWrapper, { backgroundColor: kpi.bg }]}>
                  <Icon size={18} color={kpi.color} />
                </View>
              </View>
              <Text style={styles.kpiValue}>{kpi.value}</Text>
              <Text style={styles.kpiChange}>{kpi.change}</Text>
            </View>
          );
        })}
      </View>

      {/* Middle Analytics Section: Lead Sources & Funnel */}
      <View style={[styles.chartsRow, isMobile && styles.chartsRowMobile]}>
        {/* Lead Sources Distribution */}
        <View style={[styles.chartCard, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Lead Sources Distribution</Text>
              <Text style={styles.cardSubtitle}>Meta Ads and WhatsApp drive 73% of inquiries</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveScreen('reports')}>
              <Text style={styles.linkText}>View Details</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sourceList}>
            {leadSources.map((s, i) => (
              <View key={i} style={styles.sourceItem}>
                <View style={styles.sourceLabelRow}>
                  <View style={styles.sourceDotText}>
                    <View style={[styles.sourceDot, { backgroundColor: s.color }]} />
                    <Text style={styles.sourceName}>{s.name}</Text>
                  </View>
                  <Text style={styles.sourcePct}>{s.count} leads ({s.pct}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${s.pct}%`, backgroundColor: s.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sales Pipeline Funnel */}
        <View style={[styles.chartCard, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Pipeline Stage Velocity</Text>
              <Text style={styles.cardSubtitle}>Active leads progressing across stages</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveScreen('pipeline')}>
              <Text style={styles.linkText}>Kanban View</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.funnelContainer}>
            {pipelineStages.map((st, i) => (
              <View key={i} style={styles.funnelRow}>
                <View style={styles.funnelInfo}>
                  <Text style={styles.funnelStageName}>{st.name}</Text>
                  <Text style={styles.funnelCount}>{st.count} leads</Text>
                </View>
                <View style={styles.funnelBarBg}>
                  <View 
                    style={[
                      styles.funnelBarFill, 
                      { 
                        width: `${Math.max(12, (st.count / leads.length) * 100)}%`, 
                        backgroundColor: st.color 
                      }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Bottom Section: Recent Leads & Today's Follow-ups */}
      <View style={[styles.bottomRow, isMobile && styles.bottomRowMobile]}>
        {/* Recent Leads Table */}
        <View style={[styles.tableCard, { flex: 1.4 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Recent Meta & Omnichannel Leads</Text>
              <Text style={styles.cardSubtitle}>Realtime lead capture with auto-assigned specialists</Text>
            </View>
            <TouchableOpacity 
              style={styles.viewAllBtn} 
              onPress={() => setActiveScreen('leads')}
            >
              <Text style={styles.viewAllText}>View All ({leads.length})</Text>
              <ArrowRight size={14} color={BrandColors.blue} />
            </TouchableOpacity>
          </View>

          <View style={styles.leadList}>
            {recentLeads.map((lead) => (
              <TouchableOpacity 
                key={lead.id} 
                style={styles.leadItem}
                onPress={() => navigateToLeadDetail(lead.id)}
                activeOpacity={0.7}
              >
                <View style={styles.leadAvatar}>
                  <Text style={styles.leadAvatarText}>{lead.name.charAt(0)}</Text>
                </View>

                <View style={styles.leadMain}>
                  <Text style={styles.leadName}>{lead.name}</Text>
                  <Text style={styles.leadCompany}>{lead.company_name} • {lead.phone}</Text>
                </View>

                <View style={styles.leadMeta}>
                  <View style={[styles.sourceBadge, { backgroundColor: BrandColors.blueLight }]}>
                    <Text style={styles.sourceBadgeText}>{lead.source_name}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: lead.status_color + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: lead.status_color }]}>{lead.status_name}</Text>
                  </View>
                </View>

                <ChevronRight size={16} color={BrandColors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Follow-ups */}
        <View style={[styles.tableCard, { flex: 1 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Today's Follow-ups</Text>
              <Text style={styles.cardSubtitle}>Scheduled calls & WhatsApp outreaches</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveScreen('followups')}>
              <Text style={styles.linkText}>All Follow-ups</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.followupList}>
            {todaysFollowups.map((f) => (
              <View key={f.id} style={styles.followupItem}>
                <View style={styles.followupTypeIcon}>
                  {f.type === 'call' ? (
                    <Phone size={16} color={BrandColors.blue} />
                  ) : (
                    <MessageSquare size={16} color={BrandColors.green} />
                  )}
                </View>

                <View style={styles.followupInfo}>
                  <Text style={styles.followupLeadName}>{f.lead_name}</Text>
                  <Text style={styles.followupNotes} numberOfLines={1}>{f.notes}</Text>
                  <Text style={styles.followupAssignee}>Assigned to {f.assigned_user_name}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.completeBtn}
                  onPress={() => completeFollowup(f.id)}
                  activeOpacity={0.7}
                >
                  <CheckCircle2 size={16} color={BrandColors.green} />
                  <Text style={styles.completeBtnText}>Done</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.bg,
  },
  content: {
    padding: 24,
    paddingBottom: 80,
  },
  welcomeBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  welcomeBannerMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 14,
  },
  welcomeTextGroup: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  subGreeting: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  quickSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  quickSimBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginBottom: 24,
  },
  kpiCard: {
    width: 'calc(25% - 11px)' as any,
    minWidth: 200,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 2,
  },
  kpiCardMobile: {
    width: 'calc(50% - 7px)' as any,
    minWidth: 140,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  kpiIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  kpiChange: {
    fontSize: 11,
    color: BrandColors.green,
    fontWeight: '600',
    marginTop: 4,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  chartsRowMobile: {
    flexDirection: 'column',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  cardSubtitle: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  linkText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  sourceList: {
    gap: 12,
  },
  sourceItem: {
    gap: 6,
  },
  sourceLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sourceDotText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sourceName: {
    fontSize: 12.5,
    fontWeight: '500',
    color: BrandColors.textPrimary,
  },
  sourcePct: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: BrandColors.surfaceSubtle,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  funnelContainer: {
    gap: 10,
  },
  funnelRow: {
    gap: 4,
  },
  funnelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  funnelStageName: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  funnelCount: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    fontWeight: '600',
  },
  funnelBarBg: {
    height: 8,
    backgroundColor: BrandColors.surfaceSubtle,
    borderRadius: 4,
    overflow: 'hidden',
  },
  funnelBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 20,
  },
  bottomRowMobile: {
    flexDirection: 'column',
  },
  tableCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  leadList: {
    gap: 8,
  },
  leadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
    gap: 12,
  },
  leadAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BrandColors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leadAvatarText: {
    color: BrandColors.blue,
    fontWeight: '700',
    fontSize: 13,
  },
  leadMain: {
    flex: 1,
  },
  leadName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  leadCompany: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  leadMeta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  sourceBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sourceBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  followupList: {
    gap: 10,
  },
  followupItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: BrandColors.surfaceSubtle,
    borderRadius: 8,
    gap: 10,
  },
  followupTypeIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  followupInfo: {
    flex: 1,
  },
  followupLeadName: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  followupNotes: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 1,
  },
  followupAssignee: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.green,
  },
});
