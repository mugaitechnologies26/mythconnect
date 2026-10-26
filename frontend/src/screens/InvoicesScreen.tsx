import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { 
  Receipt, Plus, Search, IndianRupee, Printer, 
  CheckCircle2, AlertCircle, CreditCard, X, ChevronRight
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Invoice } from '../types';

export const InvoicesScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { invoices, recordPayment, showSnackbar } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPayModalOpen, setPayModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<'upi' | 'bank_transfer' | 'card' | 'cash'>('upi');
  const [refNumber, setRefNumber] = useState('');

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(search.toLowerCase()) || 
    inv.customer_company.toLowerCase().includes(search.toLowerCase()) ||
    inv.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalBilled = invoices.reduce((a, b) => a + b.grand_total, 0);
  const totalCollected = invoices.reduce((a, b) => a + b.paid_amount, 0);
  const totalOutstanding = invoices.reduce((a, b) => a + b.balance_amount, 0);

  const handleRecordPayment = () => {
    if (!selectedInvoice) return;
    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      showSnackbar('Please enter a valid payment amount', 'error');
      return;
    }

    recordPayment({
      invoice_id: selectedInvoice.id,
      invoice_number: selectedInvoice.invoice_number,
      customer_name: selectedInvoice.customer_company,
      amount: amt,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: payMethod,
      reference_number: refNumber || `TXN_${Date.now().toString().slice(-6)}`,
      notes: `Recorded via ${payMethod.toUpperCase()}`,
      recorded_by_name: 'Rohan Deshmukh'
    });

    setPayModalOpen(false);
    setSelectedInvoice(null);
    setPayAmount('');
    setRefNumber('');
    showSnackbar('Payment successfully booked and invoice balance updated!', 'success');
  };

  const getStatusBadge = (status: Invoice['payment_status']) => {
    switch (status) {
      case 'paid':
        return { bg: BrandColors.greenLight, text: BrandColors.green, label: 'PAID' };
      case 'partially_paid':
        return { bg: BrandColors.blueLight, text: BrandColors.blue, label: 'PARTIAL' };
      case 'overdue':
        return { bg: BrandColors.redLight, text: BrandColors.red, label: 'OVERDUE' };
      default:
        return { bg: BrandColors.surfaceSubtle, text: BrandColors.textSecondary, label: status.toUpperCase() };
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Tax Invoices & Collections</Text>
          <Text style={styles.pageSubtitle}>
            GST tax invoices, client payments recording, and ledger tracking
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Search size={16} color={BrandColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoice number, client or company..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Collection Stats Bar */}
      <View style={[styles.statsRow, isMobile && styles.statsRowMobile]}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Invoiced (GST)</Text>
          <Text style={styles.statValue}>₹{(totalBilled / 100000).toFixed(2)} Lakhs</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Collected</Text>
          <Text style={[styles.statValue, { color: BrandColors.green }]}>
            ₹{(totalCollected / 100000).toFixed(2)} Lakhs
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Outstanding Balance</Text>
          <Text style={[styles.statValue, { color: BrandColors.red }]}>
            ₹{(totalOutstanding / 1000).toFixed(0)}k Due
          </Text>
        </View>
      </View>

      {/* Invoices Table */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 1.5 }]}>INVOICE #</Text>
            <Text style={[styles.th, { flex: 2 }]}>CUSTOMER & GSTIN</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>DUE DATE</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>TOTAL (₹)</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>BALANCE (₹)</Text>
            <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
            <Text style={[styles.th, { width: 130, textAlign: 'center' }]}>ACTION</Text>
          </View>

          {filteredInvoices.map(inv => {
            const st = getStatusBadge(inv.payment_status);
            return (
              <View key={inv.id} style={styles.tableRow}>
                <View style={[styles.td, { flex: 1.5 }]}>
                  <Text style={styles.invNo}>{inv.invoice_number}</Text>
                  <Text style={styles.invDate}>Issued: {inv.invoice_date}</Text>
                </View>

                <View style={[styles.td, { flex: 2 }]}>
                  <Text style={styles.custName}>{inv.customer_company}</Text>
                  <Text style={styles.custContact}>{inv.customer_name} • {inv.customer_phone}</Text>
                </View>

                <View style={[styles.td, { flex: 1.2 }]}>
                  <Text style={[styles.dueDate, inv.payment_status === 'overdue' && styles.dueDateAlert]}>
                    {inv.due_date}
                  </Text>
                  {inv.payment_status === 'overdue' && (
                    <Text style={styles.overdueNote}>Overdue 8 days</Text>
                  )}
                </View>

                <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                  <Text style={styles.amtText}>₹{inv.grand_total.toLocaleString('en-IN')}</Text>
                </View>

                <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                  <Text style={[styles.balText, inv.balance_amount > 0 ? styles.balDue : styles.balZero]}>
                    ₹{inv.balance_amount.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={[styles.td, { flex: 1, alignItems: 'center' }]}>
                  <View style={[styles.statusBadge, { backgroundColor: st.bg }]}>
                    <Text style={[styles.statusBadgeText, { color: st.text }]}>{st.label}</Text>
                  </View>
                </View>

                <View style={[styles.td, { width: 130, alignItems: 'center' }]}>
                  {inv.balance_amount > 0 ? (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => {
                        setSelectedInvoice(inv);
                        setPayAmount(String(inv.balance_amount));
                        setPayModalOpen(true);
                      }}
                    >
                      <CreditCard size={13} color="#FFFFFF" />
                      <Text style={styles.payBtnText}>Pay</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.paidPill}>
                      <CheckCircle2 size={14} color={BrandColors.green} />
                      <Text style={styles.paidPillText}>Settled</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Record Payment Modal Dialog */}
      {selectedInvoice && (
        <Modal visible={isPayModalOpen} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalDialog}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalSub}>RECORD CLIENT PAYMENT</Text>
                  <Text style={styles.modalTitle}>{selectedInvoice.invoice_number}</Text>
                </View>
                <TouchableOpacity onPress={() => setPayModalOpen(false)}>
                  <X size={20} color={BrandColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                <View style={styles.balanceReminderBox}>
                  <Text style={styles.reminderLabel}>Total Invoice Amount:</Text>
                  <Text style={styles.reminderVal}>₹{selectedInvoice.grand_total.toLocaleString('en-IN')}</Text>
                  <Text style={styles.reminderLabel}>Current Balance Due:</Text>
                  <Text style={[styles.reminderVal, { color: BrandColors.red }]}>
                    ₹{selectedInvoice.balance_amount.toLocaleString('en-IN')}
                  </Text>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Amount Received (₹) *</Text>
                  <TextInput
                    style={styles.formInput}
                    value={payAmount}
                    onChangeText={setPayAmount}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Payment Channel</Text>
                  <View style={styles.payMethodsRow}>
                    {[
                      { key: 'upi', label: 'UPI' },
                      { key: 'bank_transfer', label: 'NEFT / RTGS' },
                      { key: 'card', label: 'Credit Card' },
                      { key: 'cash', label: 'Cash' }
                    ].map(m => (
                      <TouchableOpacity
                        key={m.key}
                        style={[styles.payMethodBtn, payMethod === m.key && styles.payMethodActive]}
                        onPress={() => setPayMethod(m.key as any)}
                      >
                        <Text style={[styles.payMethodText, payMethod === m.key && styles.payMethodTextActive]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Transaction Reference / UTR Number</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. HDFC-NEFT-9912048 or UPI Ref"
                    value={refNumber}
                    onChangeText={setRefNumber}
                  />
                </View>
              </View>

              <View style={styles.modalFooter}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setPayModalOpen(false)}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.confirmBtn} onPress={handleRecordPayment}>
                  <Text style={styles.confirmBtnText}>Save Payment</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
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
  searchBox: {
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
  searchInput: {
    fontSize: 13,
    flex: 1,
    outlineStyle: 'none' as any,
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
  statCard: {
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
  statValue: {
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
  invNo: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  invDate: {
    fontSize: 11,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  custName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  custContact: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  dueDate: {
    fontSize: 12,
    color: BrandColors.textPrimary,
  },
  dueDateAlert: {
    color: BrandColors.red,
    fontWeight: '700',
  },
  overdueNote: {
    fontSize: 10,
    color: BrandColors.red,
    fontWeight: '700',
  },
  amtText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  balText: {
    fontSize: 13,
    fontWeight: '700',
  },
  balDue: {
    color: BrandColors.red,
  },
  balZero: {
    color: BrandColors.green,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  payBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  paidPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  paidPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: BrandColors.green,
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
    maxWidth: 520,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
    backgroundColor: '#FAFCFE',
  },
  modalSub: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  modalBody: {
    padding: 20,
    gap: 14,
  },
  balanceReminderBox: {
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLabel: {
    fontSize: 11,
    color: BrandColors.textSecondary,
  },
  reminderVal: {
    fontSize: 13,
    fontWeight: '700',
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
  payMethodsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  payMethodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
  },
  payMethodActive: {
    backgroundColor: BrandColors.blueLight,
    borderColor: BrandColors.blue,
  },
  payMethodText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  payMethodTextActive: {
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
