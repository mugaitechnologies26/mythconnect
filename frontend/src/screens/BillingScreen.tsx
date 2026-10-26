import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { CreditCard, IndianRupee, ArrowDownLeft, CheckCircle2 } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const BillingScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { payments, invoices, setActiveScreen } = useAppStore();

  const totalInvoiced = invoices.reduce((a, b) => a + b.grand_total, 0);
  const totalReceived = payments.reduce((a, b) => a + b.amount, 0);
  const totalBalance = Math.max(0, totalInvoiced - totalReceived);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Billing & Payment Ledger</Text>
          <Text style={styles.pageSubtitle}>
            Complete bank transfers, UPI settlements, and credit card transaction logs
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.recordBtn} 
          onPress={() => setActiveScreen('invoices')}
        >
          <Text style={styles.recordBtnText}>Go to Invoices</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Invoiced Amount</Text>
          <Text style={styles.statVal}>₹{totalInvoiced.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Payment Settled</Text>
          <Text style={[styles.statVal, { color: BrandColors.green }]}>
            ₹{totalReceived.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Outstanding Collection</Text>
          <Text style={[styles.statVal, { color: BrandColors.red }]}>
            ₹{totalBalance.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {/* Ledger Table */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.2 }]}>PAYMENT #</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>INVOICE #</Text>
            <Text style={[styles.th, { flex: 2 }]}>CUSTOMER</Text>
            <Text style={[styles.th, { flex: 1 }]}>METHOD</Text>
            <Text style={[styles.th, { flex: 1.4 }]}>REFERENCE / UTR</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>AMOUNT (₹)</Text>
          </View>

          {payments.map(pay => (
            <View key={pay.id} style={styles.tableRow}>
              <View style={[styles.td, { flex: 1.2 }]}>
                <Text style={styles.payNo}>{pay.payment_number}</Text>
                <Text style={styles.payDate}>{pay.payment_date}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2 }]}>
                <Text style={styles.invLink}>{pay.invoice_number}</Text>
              </View>

              <View style={[styles.td, { flex: 2 }]}>
                <Text style={styles.custName}>{pay.customer_name}</Text>
                <Text style={styles.notesText}>{pay.notes}</Text>
              </View>

              <View style={[styles.td, { flex: 1 }]}>
                <View style={styles.methodBadge}>
                  <Text style={styles.methodText}>{pay.payment_method.toUpperCase()}</Text>
                </View>
              </View>

              <View style={[styles.td, { flex: 1.4 }]}>
                <Text style={styles.refText}>{pay.reference_number || 'N/A'}</Text>
                <Text style={styles.recordedBy}>by {pay.recorded_by_name}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                <Text style={styles.amountText}>+ ₹{pay.amount.toLocaleString('en-IN')}</Text>
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
  recordBtn: {
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recordBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 24,
    paddingBottom: 0,
    gap: 16,
  },
  statsRowMobile: {
    flexDirection: 'column',
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    marginBottom: 6,
  },
  statVal: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.darkNavy,
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
    letterSpacing: 0.6,
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
  payNo: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  payDate: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  invLink: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  custName: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  notesText: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  methodBadge: {
    alignSelf: 'flex-start',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  methodText: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  refText: {
    fontSize: 11.5,
    fontFamily: "'Space Grotesk', monospace",
    color: BrandColors.textPrimary,
  },
  recordedBy: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
  },
  amountText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: BrandColors.green,
  },
});
