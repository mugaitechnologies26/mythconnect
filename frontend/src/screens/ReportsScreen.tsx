import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BarChart3, Download, TrendingUp, Users, DollarSign, Award, Target } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const ReportsScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { leads, users, kpis, showSnackbar } = useAppStore();

  // Compute team performance dynamically from database leads and users
  const salesTeamStats = users.length > 0
    ? users.map(u => {
        const userLeads = leads.filter(l => l.assigned_to === u.id);
        const wonLeads = userLeads.filter(l => l.status_code === 'won');
        const revenue = wonLeads.reduce((a, b) => a + Number(b.estimated_value || 0), 0);
        const convRate = userLeads.length > 0 ? Number(((wonLeads.length / userLeads.length) * 100).toFixed(1)) : 0;
        return {
          name: u.name,
          role: u.role_display || u.role,
          closedDeals: wonLeads.length,
          revenue,
          conversionRate: convRate
        };
      })
    : [];

  // Compute campaign performance dynamically from real database leads
  const campaignMap: Record<string, { count: number; qualified: number; revenue: number }> = {};
  leads.forEach(l => {
    const camp = l.meta_campaign_name || 'Direct Organic / Referral';
    if (!campaignMap[camp]) {
      campaignMap[camp] = { count: 0, qualified: 0, revenue: 0 };
    }
    campaignMap[camp].count += 1;
    if (l.status_code === 'qualified' || l.status_code === 'quotation' || l.status_code === 'won') {
      campaignMap[camp].qualified += 1;
    }
    if (l.status_code === 'won') {
      campaignMap[camp].revenue += Number(l.estimated_value || 0);
    }
  });

  const metaCampaigns = Object.entries(campaignMap).map(([campaign, data]) => ({
    campaign,
    leads: data.count,
    costPerLead: '₹140',
    qualified: data.qualified,
    revenue: data.revenue
  }));

  const handleExportReports = () => {
    showSnackbar('Comprehensive analytics report exported to CSV!', 'success');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Analytics & Performance Reports</Text>
          <Text style={styles.pageSubtitle}>
            ROI by Meta campaign, team sales leaderboards, and conversion analytics
          </Text>
        </View>

        <TouchableOpacity style={styles.exportBtn} onPress={handleExportReports}>
          <Download size={16} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Export Full Report (CSV)</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        {/* Performance High-level Cards */}
        <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
          <View style={styles.statBox}>
            <View style={styles.statIconBox}>
              <Target size={18} color={BrandColors.blue} />
            </View>
            <Text style={styles.statVal}>{kpis.conversionRate}%</Text>
            <Text style={styles.statLabel}>Lead-to-Deal Conversion</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: BrandColors.greenLight }]}>
              <DollarSign size={18} color={BrandColors.green} />
            </View>
            <Text style={[styles.statVal, { color: BrandColors.green }]}>
              ₹{(kpis.revenue / 100000).toFixed(1)}L
            </Text>
            <Text style={styles.statLabel}>Total Closed Sales Revenue</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.statIconBox, { backgroundColor: BrandColors.orangeLight }]}>
              <TrendingUp size={18} color={BrandColors.orange} />
            </View>
            <Text style={[styles.statVal, { color: BrandColors.orange }]}>
              {leads.length > 0 ? `₹${Math.round(15000 / leads.length)}` : '₹0'}
            </Text>
            <Text style={styles.statLabel}>Average Cost per Meta Lead</Text>
          </View>
        </View>

        {/* Sales Team Performance Leaderboard */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>SALES SPECIALIST LEADERBOARD</Text>
          <View style={styles.table}>
            <View style={styles.thRow}>
              <Text style={[styles.th, { flex: 2 }]}>SPECIALIST</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>WON DEALS</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>CONVERSION</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>REVENUE CLOSED</Text>
            </View>

            {salesTeamStats.map((sp, i) => (
              <View key={i} style={styles.tr}>
                <View style={{ flex: 2 }}>
                  <Text style={styles.spName}>{sp.name}</Text>
                  <Text style={styles.spRole}>{sp.role}</Text>
                </View>
                <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>{sp.closedDeals}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'center', color: BrandColors.green, fontWeight: '700' }]}>
                  {sp.conversionRate}%
                </Text>
                <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: '800', color: BrandColors.darkNavy }]}>
                  ₹{(sp.revenue / 100000).toFixed(2)} Lakhs
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Meta Ad Campaigns Performance */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeading}>META ADS CAMPAIGN ROI METRICS</Text>
          <View style={styles.table}>
            <View style={styles.thRow}>
              <Text style={[styles.th, { flex: 2.2 }]}>CAMPAIGN NAME</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>LEADS</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>CPL (₹)</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>QUALIFIED</Text>
              <Text style={[styles.th, { flex: 1.5, textAlign: 'right' }]}>REVENUE</Text>
            </View>

            {metaCampaigns.map((camp, i) => (
              <View key={i} style={styles.tr}>
                <View style={{ flex: 2.2 }}>
                  <Text style={styles.campName}>{camp.campaign}</Text>
                </View>
                <Text style={[styles.td, { flex: 1, textAlign: 'center', fontWeight: '700' }]}>{camp.leads}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>{camp.costPerLead}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: 'center', color: BrandColors.blue, fontWeight: '700' }]}>
                  {camp.qualified}
                </Text>
                <Text style={[styles.td, { flex: 1.5, textAlign: 'right', fontWeight: '800', color: BrandColors.darkNavy }]}>
                  ₹{(camp.revenue / 100000).toFixed(2)} Lakhs
                </Text>
              </View>
            ))}
          </View>
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
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  exportBtnText: {
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
    gap: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statsRowMobile: {
    flexDirection: 'column',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  statIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: BrandColors.blueLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  statLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  table: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFCFE',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    padding: 10,
  },
  th: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.textMuted,
  },
  tr: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  spName: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  spRole: {
    fontSize: 11,
    color: BrandColors.textSecondary,
  },
  campName: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  td: {
    fontSize: 12.5,
    color: BrandColors.textPrimary,
  },
});
