import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Search, X, Users, UserCheck, FileText, Receipt, MessageSquare, ArrowRight } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore, ScreenType } from '../store/useAppStore';

export const CommandPalette: React.FC = () => {
  const { 
    isSearchOpen, 
    setSearchOpen, 
    setActiveScreen, 
    navigateToLeadDetail,
    leads, 
    customers, 
    quotations, 
    invoices, 
    conversations 
  } = useAppStore();

  const [query, setQuery] = useState('');

  // Handle Ctrl+K shortcut on Web
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(!isSearchOpen);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredLeads = q ? leads.filter(l => 
    l.name.toLowerCase().includes(q) || 
    l.company_name.toLowerCase().includes(q) || 
    l.phone.includes(q) || 
    l.lead_code.toLowerCase().includes(q)
  ).slice(0, 4) : [];

  const filteredCustomers = q ? customers.filter(c => 
    c.name.toLowerCase().includes(q) || 
    c.company_name.toLowerCase().includes(q) || 
    c.phone.includes(q) || 
    c.customer_code.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const filteredQuotes = q ? quotations.filter(qt => 
    qt.quotation_number.toLowerCase().includes(q) || 
    qt.customer_name.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const filteredInvoices = q ? invoices.filter(inv => 
    inv.invoice_number.toLowerCase().includes(q) || 
    inv.customer_name.toLowerCase().includes(q)
  ).slice(0, 3) : [];

  const quickNav: { label: string; screen: ScreenType; desc: string }[] = [
    { label: 'Leads & Enquiries', screen: 'leads', desc: 'Browse all Meta, WhatsApp and Web leads' },
    { label: 'Digital Profile & Shop', screen: 'digital_profile', desc: 'Smart business card, mini shop & dynamic QR' },
    { label: 'WhatsApp Live CRM', screen: 'whatsapp', desc: 'Direct chat with incoming leads & customers' },
    { label: 'Sales Pipeline (Kanban)', screen: 'pipeline', desc: 'Manage deal stages and revenue pipeline' },
    { label: 'Create New Quotation', screen: 'quotations', desc: 'Draft formal client proposal with 18% GST' },
    { label: 'Generate QR Code', screen: 'qr', desc: 'Create trackable dynamic QR codes' },
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
          {/* Search Input Bar */}
          <View style={styles.inputBar}>
            <Search size={20} color={BrandColors.blue} />
            <TextInput
              style={styles.input}
              placeholder="Search leads, phone numbers, quotes, invoices... (Press ESC to exit)"
              placeholderTextColor={BrandColors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <X size={18} color={BrandColors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => setSearchOpen(false)} style={styles.closeBtn}>
              <Text style={styles.escText}>ESC</Text>
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <ScrollView style={styles.resultsScroll} keyboardShouldPersistTaps="handled">
            {/* When query is empty, show Quick Navigation shortcuts */}
            {!q && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>QUICK NAVIGATION</Text>
                {quickNav.map(item => (
                  <TouchableOpacity
                    key={item.screen}
                    style={styles.itemRow}
                    onPress={() => {
                      setActiveScreen(item.screen);
                      setSearchOpen(false);
                    }}
                  >
                    <View style={styles.itemIconBox}>
                      <ArrowRight size={16} color={BrandColors.blue} />
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemTitle}>{item.label}</Text>
                      <Text style={styles.itemSubtitle}>{item.desc}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Leads Search Results */}
            {filteredLeads.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>LEADS</Text>
                {filteredLeads.map(lead => (
                  <TouchableOpacity
                    key={lead.id}
                    style={styles.itemRow}
                    onPress={() => {
                      navigateToLeadDetail(lead.id);
                      setSearchOpen(false);
                    }}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: BrandColors.blueLight }]}>
                      <Users size={16} color={BrandColors.blue} />
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemTitle}>{lead.name} • {lead.lead_code}</Text>
                      <Text style={styles.itemSubtitle}>{lead.company_name} | {lead.phone}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: lead.status_color + '20' }]}>
                      <Text style={[styles.statusText, { color: lead.status_color }]}>{lead.status_name}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Customers Search Results */}
            {filteredCustomers.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CUSTOMERS</Text>
                {filteredCustomers.map(cust => (
                  <TouchableOpacity
                    key={cust.id}
                    style={styles.itemRow}
                    onPress={() => {
                      setActiveScreen('customers');
                      setSearchOpen(false);
                    }}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: BrandColors.greenLight }]}>
                      <UserCheck size={16} color={BrandColors.green} />
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemTitle}>{cust.name} ({cust.customer_code})</Text>
                      <Text style={styles.itemSubtitle}>{cust.company_name} | Revenue: ₹{cust.total_revenue.toLocaleString('en-IN')}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Quotations Search Results */}
            {filteredQuotes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>QUOTATIONS</Text>
                {filteredQuotes.map(qt => (
                  <TouchableOpacity
                    key={qt.id}
                    style={styles.itemRow}
                    onPress={() => {
                      setActiveScreen('quotations');
                      setSearchOpen(false);
                    }}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: BrandColors.orangeLight }]}>
                      <FileText size={16} color={BrandColors.orange} />
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemTitle}>{qt.quotation_number} • ₹{qt.grand_total.toLocaleString('en-IN')}</Text>
                      <Text style={styles.itemSubtitle}>{qt.customer_company} | Status: {qt.status}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Invoices Search Results */}
            {filteredInvoices.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>INVOICES</Text>
                {filteredInvoices.map(inv => (
                  <TouchableOpacity
                    key={inv.id}
                    style={styles.itemRow}
                    onPress={() => {
                      setActiveScreen('invoices');
                      setSearchOpen(false);
                    }}
                  >
                    <View style={[styles.itemIconBox, { backgroundColor: BrandColors.blueLight }]}>
                      <Receipt size={16} color={BrandColors.blue} />
                    </View>
                    <View style={styles.itemTextBox}>
                      <Text style={styles.itemTitle}>{inv.invoice_number} • ₹{inv.grand_total.toLocaleString('en-IN')}</Text>
                      <Text style={styles.itemSubtitle}>{inv.customer_company} | Balance: ₹{inv.balance_amount.toLocaleString('en-IN')}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* If query has no results */}
            {q && filteredLeads.length === 0 && filteredCustomers.length === 0 && filteredQuotes.length === 0 && filteredInvoices.length === 0 && (
              <View style={styles.noResults}>
                <Text style={styles.noResultsTitle}>No results found for "{query}"</Text>
                <Text style={styles.noResultsSubtitle}>Try searching by lead name, phone number, quote number or company name</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(11, 31, 58, 0.65)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 16,
    zIndex: 9999,
  },
  dialog: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: BrandColors.textPrimary,
    outlineStyle: 'none' as any,
  },
  closeBtn: {
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  escText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.textSecondary,
  },
  resultsScroll: {
    maxHeight: 450,
    paddingVertical: 8,
  },
  section: {
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 12,
  },
  itemIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: BrandColors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTextBox: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  itemSubtitle: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  noResultsSubtitle: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
