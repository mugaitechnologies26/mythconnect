import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from 'react-native';
import { 
  UserCheck, Search, Phone, Mail, Building, 
  IndianRupee, ChevronRight, X, FileText, Receipt, ArrowRight
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Customer } from '../types';

export const CustomersScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { customers, quotations, invoices, setActiveScreen, showSnackbar } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.company_name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.customer_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Page Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Customer Accounts</Text>
          <Text style={styles.pageSubtitle}>
            Active enterprise clients, contract revenues, and lifetime account histories
          </Text>
        </View>

        <View style={styles.searchBar}>
          <Search size={16} color={BrandColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search accounts by name, company, GSTIN..."
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Customer List Table */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={styles.tableCard}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>CUSTOMER & COMPANY</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>CONTACT</Text>
            <Text style={[styles.th, { flex: 1 }]}>LOCATION</Text>
            <Text style={[styles.th, { flex: 0.8, textAlign: 'center' }]}>ORDERS</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>TOTAL REVENUE</Text>
            <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>OUTSTANDING</Text>
            <Text style={[styles.th, { width: 60, textAlign: 'center' }]}>ACTION</Text>
          </View>

          {filtered.map(cust => (
            <TouchableOpacity
              key={cust.id}
              style={styles.tableRow}
              onPress={() => setSelectedCustomer(cust)}
              activeOpacity={0.8}
            >
              <View style={[styles.td, { flex: 2 }]}>
                <Text style={styles.codeText}>{cust.customer_code}</Text>
                <Text style={styles.nameText}>{cust.name}</Text>
                <Text style={styles.compText}>{cust.company_name}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2 }]}>
                <Text style={styles.phoneText}>{cust.phone}</Text>
                <Text style={styles.emailText}>{cust.email}</Text>
              </View>

              <View style={[styles.td, { flex: 1 }]}>
                <Text style={styles.cityText}>{cust.city}, {cust.state}</Text>
                <Text style={styles.gstinText}>GST: {cust.gstin}</Text>
              </View>

              <View style={[styles.td, { flex: 0.8, alignItems: 'center' }]}>
                <View style={styles.orderBadge}>
                  <Text style={styles.orderBadgeText}>{cust.total_orders}</Text>
                </View>
              </View>

              <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                <Text style={styles.revenueText}>₹{cust.total_revenue.toLocaleString('en-IN')}</Text>
              </View>

              <View style={[styles.td, { flex: 1.2, alignItems: 'flex-end' }]}>
                <Text style={[
                  styles.balanceText,
                  cust.outstanding_balance > 0 ? styles.balanceDue : styles.balanceZero
                ]}>
                  ₹{cust.outstanding_balance.toLocaleString('en-IN')}
                </Text>
              </View>

              <View style={[styles.td, { width: 60, alignItems: 'center' }]}>
                <ChevronRight size={18} color={BrandColors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Customer Full Detail Modal */}
      {selectedCustomer && (
        <Modal visible transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalDialog}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalCustCode}>{selectedCustomer.customer_code}</Text>
                  <Text style={styles.modalCustName}>{selectedCustomer.name}</Text>
                  <Text style={styles.modalCustCompany}>{selectedCustomer.company_name}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedCustomer(null)}>
                  <X size={20} color={BrandColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                {/* Stats Row */}
                <View style={styles.custStatsRow}>
                  <View style={styles.custStatBox}>
                    <Text style={styles.custStatLabel}>Total Revenue</Text>
                    <Text style={styles.custStatVal}>₹{selectedCustomer.total_revenue.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.custStatBox}>
                    <Text style={styles.custStatLabel}>Outstanding Balance</Text>
                    <Text style={[styles.custStatVal, { color: selectedCustomer.outstanding_balance > 0 ? BrandColors.red : BrandColors.green }]}>
                      ₹{selectedCustomer.outstanding_balance.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.custStatBox}>
                    <Text style={styles.custStatLabel}>Total Orders</Text>
                    <Text style={styles.custStatVal}>{selectedCustomer.total_orders} Contracts</Text>
                  </View>
                </View>

                {/* Account Details */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>COMPANY & GST PROFILE</Text>
                  <Text style={styles.infoLine}>📍 <Text style={styles.boldText}>Address:</Text> {selectedCustomer.address}, {selectedCustomer.city}, {selectedCustomer.state}</Text>
                  <Text style={styles.infoLine}>🏷️ <Text style={styles.boldText}>GSTIN:</Text> {selectedCustomer.gstin}</Text>
                  <Text style={styles.infoLine}>📞 <Text style={styles.boldText}>Direct Phone:</Text> {selectedCustomer.phone}</Text>
                  <Text style={styles.infoLine}>✉️ <Text style={styles.boldText}>Email:</Text> {selectedCustomer.email}</Text>
                </View>

                {/* Related Invoices */}
                <View style={styles.detailCard}>
                  <Text style={styles.detailCardTitle}>RECENT BILLING INVOICES</Text>
                  {invoices.filter(i => i.customer_id === selectedCustomer.id).map(inv => (
                    <View key={inv.id} style={styles.miniInvoiceRow}>
                      <View>
                        <Text style={styles.miniInvNo}>{inv.invoice_number}</Text>
                        <Text style={styles.miniInvDate}>Due {inv.due_date}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.miniInvAmt}>₹{inv.grand_total.toLocaleString('en-IN')}</Text>
                        <Text style={[styles.miniInvStatus, { color: inv.payment_status === 'paid' ? BrandColors.green : BrandColors.red }]}>
                          {inv.payment_status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.modalActionBtn}
                  onPress={() => {
                    setSelectedCustomer(null);
                    setActiveScreen('quotations');
                  }}
                >
                  <FileText size={16} color="#FFFFFF" />
                  <Text style={styles.modalActionBtnText}>Create Quotation for Client</Text>
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
  searchInput: {
    fontSize: 13,
    flex: 1,
    outlineStyle: 'none' as any,
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
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  compText: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  phoneText: {
    fontSize: 12.5,
    color: BrandColors.textPrimary,
    fontWeight: '500',
  },
  emailText: {
    fontSize: 11.5,
    color: BrandColors.textMuted,
  },
  cityText: {
    fontSize: 12,
    color: BrandColors.textPrimary,
  },
  gstinText: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
  },
  orderBadge: {
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  orderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  revenueText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  balanceText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  balanceDue: {
    color: BrandColors.red,
  },
  balanceZero: {
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
    maxWidth: 600,
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
  modalCustCode: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  modalCustName: {
    fontSize: 18,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  modalCustCompany: {
    fontSize: 12.5,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  modalBody: {
    padding: 20,
    maxHeight: 480,
  },
  custStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  custStatBox: {
    flex: 1,
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 12,
    borderRadius: 8,
  },
  custStatLabel: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    marginBottom: 4,
  },
  custStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  detailCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
  },
  detailCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  infoLine: {
    fontSize: 12.5,
    color: BrandColors.textPrimary,
    marginBottom: 6,
    lineHeight: 18,
  },
  boldText: {
    fontWeight: '700',
  },
  miniInvoiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  miniInvNo: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  miniInvDate: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  miniInvAmt: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  miniInvStatus: {
    fontSize: 10,
    fontWeight: '800',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    backgroundColor: '#FAFCFE',
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blue,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalActionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
