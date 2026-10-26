import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { 
  Users, Plus, Search, Filter, Download, Upload, 
  ExternalLink, Phone, Mail, MoreVertical, X, Sparkles, ChevronRight
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Lead } from '../types';

export const LeadsScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { leads, addLead, navigateToLeadDetail, setMetaSimModalOpen, showSnackbar } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  // New Lead Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newSource, setNewSource] = useState<Lead['source_code']>('meta');
  const [newValue, setNewValue] = useState('');
  const [newCity, setNewCity] = useState('');

  // Filter Leads
  const filteredLeads = leads.filter(lead => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      lead.name.toLowerCase().includes(q) ||
      lead.company_name.toLowerCase().includes(q) ||
      lead.phone.includes(q) ||
      lead.email.toLowerCase().includes(q) ||
      lead.lead_code.toLowerCase().includes(q);

    const matchesSource = selectedSource === 'all' || lead.source_code === selectedSource;
    const matchesStatus = selectedStatus === 'all' || lead.status_code === selectedStatus;

    return matchesSearch && matchesSource && matchesStatus;
  });

  const handleCreateLead = () => {
    if (!newName.trim() || !newPhone.trim()) {
      showSnackbar('Please enter lead name and phone number', 'error');
      return;
    }

    const created = addLead({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '')}@example.com`,
      company_name: newCompany || `${newName} Ventures`,
      source_id: newSource === 'meta' ? 1 : newSource === 'whatsapp' ? 2 : 3,
      source_name: newSource === 'meta' ? 'Meta Lead Ads' : newSource === 'whatsapp' ? 'WhatsApp' : 'Website Form',
      source_code: newSource,
      status_id: 1,
      status_code: 'new',
      status_name: 'New',
      status_color: '#1565E8',
      assigned_to: 4,
      assigned_user_name: 'Sneha Kulkarni',
      estimated_value: Number(newValue) || 75000,
      priority: 'high',
      city: newCity,
      state: 'Maharashtra',
    });

    setAddModalOpen(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewCompany('');
    showSnackbar(`Lead #${created.lead_code} added successfully!`, 'success');
  };

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Lead Code,Name,Company,Phone,Email,Source,Status,Value\n" + 
      filteredLeads.map(l => `"${l.lead_code}","${l.name}","${l.company_name}","${l.phone}","${l.email}","${l.source_name}","${l.status_name}",${l.estimated_value}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MythConnect_Leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSnackbar('CSV exported successfully!', 'success');
  };

  return (
    <View style={styles.container}>
      {/* Top Page Header */}
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>Leads & Enquiries</Text>
          <Text style={styles.pageSubtitle}>
            Centralized Meta Lead Ads, WhatsApp inbound, and web conversions
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.simBtn} 
            onPress={() => setMetaSimModalOpen(true)}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color={BrandColors.blue} />
            {!isMobile && <Text style={styles.simBtnText}>Meta Ad Simulator</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.exportBtn} 
            onPress={exportCSV}
            activeOpacity={0.8}
          >
            <Download size={16} color={BrandColors.textSecondary} />
            {!isMobile && <Text style={styles.exportBtnText}>Export CSV</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.addLeadBtn} 
            onPress={() => setAddModalOpen(true)}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addLeadBtnText}>Add Lead</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter & Search Bar */}
      <View style={[styles.filterBar, isMobile && styles.filterBarMobile]}>
        <View style={styles.searchBox}>
          <Search size={16} color={BrandColors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, company, phone or lead ID..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterPills}>
          {['all', 'meta', 'whatsapp', 'digital_profile', 'digital_profile_shop', 'website', 'referral'].map(src => (
            <TouchableOpacity
              key={src}
              style={[styles.pill, selectedSource === src && styles.pillActive]}
              onPress={() => setSelectedSource(src)}
            >
              <Text style={[styles.pillText, selectedSource === src && styles.pillTextActive]}>
                {src === 'all' 
                  ? 'All Sources' 
                  : src === 'digital_profile' 
                  ? 'Digital Profile' 
                  : src === 'digital_profile_shop' 
                  ? 'Shop Enquiry' 
                  : src.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}

          <View style={styles.pillDivider} />

          {['all', 'new', 'contacted', 'qualified', 'quotation', 'won'].map(st => (
            <TouchableOpacity
              key={st}
              style={[styles.pill, selectedStatus === st && styles.pillActive]}
              onPress={() => setSelectedStatus(st)}
            >
              <Text style={[styles.pillText, selectedStatus === st && styles.pillTextActive]}>
                {st === 'all' ? 'All Stages' : st.charAt(0).toUpperCase() + st.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Area: Table on Desktop, Cards on Mobile */}
      <ScrollView style={styles.contentScroll} contentContainerStyle={styles.scrollInner}>
        {filteredLeads.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color={BrandColors.textMuted} />
            <Text style={styles.emptyTitle}>No leads found</Text>
            <Text style={styles.emptyDesc}>Try adjusting your search terms or filter selections</Text>
          </View>
        ) : isMobile ? (
          /* Mobile Card View */
          <View style={styles.cardList}>
            {filteredLeads.map(lead => (
              <TouchableOpacity
                key={lead.id}
                style={styles.leadCard}
                onPress={() => navigateToLeadDetail(lead.id)}
                activeOpacity={0.7}
              >
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardLeadCode}>{lead.lead_code}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: lead.status_color + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: lead.status_color }]}>{lead.status_name}</Text>
                  </View>
                </View>

                <Text style={styles.cardName}>{lead.name}</Text>
                <Text style={styles.cardCompany}>{lead.company_name}</Text>

                {lead.attached_product_name && (
                  <View style={{ marginTop: 4, paddingVertical: 2, paddingHorizontal: 6, backgroundColor: '#ECFDF5', borderRadius: 4, alignSelf: 'flex-start' }}>
                    <Text style={{ fontSize: 11, color: BrandColors.green, fontWeight: '700' }}>
                      🛍️ Product: {lead.attached_product_name} {lead.enquiry_quantity ? `(Qty: ${lead.enquiry_quantity})` : ''}
                    </Text>
                  </View>
                )}

                <View style={styles.cardInfoRow}>
                  <Text style={styles.cardContact}>{lead.phone}</Text>
                  <Text style={styles.cardValue}>₹{lead.estimated_value.toLocaleString('en-IN')}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.cardAssignee}>👤 {lead.assigned_user_name}</Text>
                  <Text style={styles.cardSource}>{lead.source_name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          /* Desktop Data Table */
          <View style={styles.tableCard}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>LEAD & COMPANY</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>CONTACT</Text>
              <Text style={[styles.th, { flex: 1.4 }]}>SOURCE & CONTEXT</Text>
              <Text style={[styles.th, { flex: 1 }]}>STAGE</Text>
              <Text style={[styles.th, { flex: 1.2 }]}>ASSIGNED TO</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'right' }]}>VALUE</Text>
              <Text style={[styles.th, { width: 60, textAlign: 'center' }]}>ACTIONS</Text>
            </View>

            {filteredLeads.map(lead => (
              <TouchableOpacity
                key={lead.id}
                style={styles.tableRow}
                onPress={() => navigateToLeadDetail(lead.id)}
                activeOpacity={0.8}
              >
                <View style={[styles.td, { flex: 2 }]}>
                  <Text style={styles.leadCodeText}>{lead.lead_code}</Text>
                  <Text style={styles.leadNameText}>{lead.name}</Text>
                  <Text style={styles.companyText}>{lead.company_name}</Text>
                </View>

                <View style={[styles.td, { flex: 1.2 }]}>
                  <Text style={styles.contactText}>{lead.phone}</Text>
                  <Text style={styles.emailText}>{lead.email}</Text>
                </View>

                <View style={[styles.td, { flex: 1.4 }]}>
                  <View style={[styles.sourcePill, { 
                    backgroundColor: lead.source_code === 'digital_profile_shop' || lead.source_code === 'digital_profile' 
                      ? '#EEF2FF' 
                      : BrandColors.blueLight 
                  }]}>
                    <Text style={[styles.sourcePillText, {
                      color: lead.source_code === 'digital_profile_shop' || lead.source_code === 'digital_profile'
                        ? '#4F46E5'
                        : BrandColors.blue
                    }]}>{lead.source_name}</Text>
                  </View>
                  {lead.attached_product_name ? (
                    <Text style={[styles.campaignText, { color: BrandColors.green, fontWeight: '700' }]} numberOfLines={1}>
                      🛍️ {lead.attached_product_name} {lead.enquiry_quantity ? `(x${lead.enquiry_quantity})` : ''}
                    </Text>
                  ) : lead.meta_campaign_name ? (
                    <Text style={styles.campaignText} numberOfLines={1}>{lead.meta_campaign_name}</Text>
                  ) : null}
                </View>

                <View style={[styles.td, { flex: 1 }]}>
                  <View style={[styles.statusBadge, { backgroundColor: lead.status_color + '20' }]}>
                    <Text style={[styles.statusBadgeText, { color: lead.status_color }]}>{lead.status_name}</Text>
                  </View>
                </View>

                <View style={[styles.td, { flex: 1.2 }]}>
                  <Text style={styles.assigneeText}>{lead.assigned_user_name}</Text>
                </View>

                <View style={[styles.td, { flex: 1, alignItems: 'flex-end' }]}>
                  <Text style={styles.valueText}>₹{lead.estimated_value.toLocaleString('en-IN')}</Text>
                </View>

                <View style={[styles.td, { width: 60, alignItems: 'center' }]}>
                  <ChevronRight size={18} color={BrandColors.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Lead Modal Dialog */}
      <Modal visible={isAddModalOpen} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalDialog}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Lead</Text>
              <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                <X size={20} color={BrandColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Lead Name *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Ramesh Chandra"
                    value={newName}
                    onChangeText={setNewName}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Phone Number *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="+919876543210"
                    value={newPhone}
                    onChangeText={setNewPhone}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Email Address</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="ramesh@example.com"
                    value={newEmail}
                    onChangeText={setNewEmail}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Company Name</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Chandra Agro Ltd"
                    value={newCompany}
                    onChangeText={setNewCompany}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>Estimated Deal Value (₹)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="85000"
                    value={newValue}
                    onChangeText={setNewValue}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.formLabel}>City</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="Mumbai"
                    value={newCity}
                    onChangeText={setNewCity}
                  />
                </View>
              </View>

              <View style={styles.sourceSelector}>
                <Text style={styles.formLabel}>Lead Source</Text>
                <View style={styles.sourceBtnGroup}>
                  {[
                    { key: 'meta', label: 'Meta Ads' },
                    { key: 'whatsapp', label: 'WhatsApp' },
                    { key: 'website', label: 'Website' },
                    { key: 'manual', label: 'Manual' }
                  ].map(s => (
                    <TouchableOpacity
                      key={s.key}
                      style={[styles.sourceOptBtn, newSource === s.key && styles.sourceOptActive]}
                      onPress={() => setNewSource(s.key as any)}
                    >
                      <Text style={[styles.sourceOptText, newSource === s.key && styles.sourceOptTextActive]}>
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelBtn} 
                onPress={() => setAddModalOpen(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.confirmBtn} 
                onPress={handleCreateLead}
              >
                <Text style={styles.confirmBtnText}>Save Lead</Text>
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
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blueLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  simBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  exportBtnText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  addLeadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  addLeadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    padding: 16,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  filterBarMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
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
    flex: 1,
    maxWidth: 360,
    gap: 8,
  },
  searchInput: {
    fontSize: 13,
    color: BrandColors.textPrimary,
    flex: 1,
    outlineStyle: 'none' as any,
  },
  filterPills: {
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: BrandColors.surfaceSubtle,
    marginRight: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  pillActive: {
    backgroundColor: BrandColors.blue,
    borderColor: BrandColors.blue,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  pillDivider: {
    width: 1,
    height: 20,
    backgroundColor: BrandColors.border,
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  contentScroll: {
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
  leadCodeText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
    marginBottom: 2,
  },
  leadNameText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  companyText: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  contactText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: BrandColors.textPrimary,
  },
  emailText: {
    fontSize: 11.5,
    color: BrandColors.textMuted,
  },
  sourcePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  campaignText: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  assigneeText: {
    fontSize: 12.5,
    color: BrandColors.textPrimary,
  },
  valueText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  cardList: {
    gap: 12,
  },
  leadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 16,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardLeadCode: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  cardCompany: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 10,
  },
  cardInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: BrandColors.borderLight,
    marginBottom: 8,
  },
  cardContact: {
    fontSize: 12,
    color: BrandColors.textPrimary,
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAssignee: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  cardSource: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  emptyState: {
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
    maxWidth: 540,
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
    maxHeight: 460,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formCol: {
    flex: 1,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    marginBottom: 6,
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
  sourceSelector: {
    marginTop: 4,
  },
  sourceBtnGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  sourceOptBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
  },
  sourceOptActive: {
    backgroundColor: BrandColors.blueLight,
    borderColor: BrandColors.blue,
  },
  sourceOptText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  sourceOptTextActive: {
    color: BrandColors.blue,
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
