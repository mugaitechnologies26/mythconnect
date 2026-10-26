import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { 
  ArrowLeft, Phone, Mail, MessageSquare, Plus, FileText, 
  Clock, CheckCircle, Calendar, Shield, IndianRupee, MapPin, 
  Share2, ChevronRight, CheckCircle2, AlertCircle, Send
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';

export const LeadDetailScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    selectedLeadId, 
    leads, 
    setActiveScreen, 
    updateLeadStatus, 
    sendWhatsAppMessage, 
    addFollowup, 
    showSnackbar,
    conversations,
    quotations
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'whatsapp' | 'followups' | 'notes'>('overview');
  const [newNote, setNewNote] = useState('');
  const [notesList, setNotesList] = useState<string[]>([
    'Customer is expanding from wholesale to 6 direct retail experience centers.',
    'Prefers WhatsApp communication between 2:00 PM and 5:00 PM.',
    'Technical head Sunil Sharma approved GST billing setup.'
  ]);
  const [quickMsg, setQuickMsg] = useState('');

  const lead = leads.find(l => l.id === selectedLeadId) || leads[0];
  const relatedQuotes = quotations.filter(q => q.lead_id === lead.id || q.customer_name === lead.name);

  const timelineSteps = [
    { title: 'Lead Captured via Meta Ad', time: 'Today 05:23 AM', desc: `Ingested from ${lead.meta_campaign_name || 'Facebook Feed Lead Form'}`, icon: CheckCircle2, color: BrandColors.blue },
    { title: 'Automated WhatsApp Greeting Dispatched', time: 'Today 05:25 AM', desc: 'Sent approved template: myth_lead_welcome', icon: MessageSquare, color: BrandColors.green },
    { title: 'Qualification Phone Call', time: 'Today 06:10 AM', desc: 'Discussed requirements for WhatsApp API and multi-agent CRM', icon: Phone, color: '#8B5CF6' },
    { title: 'Quotation Dispatched', time: 'Today 08:30 AM', desc: `Formal proposal for ₹${lead.estimated_value.toLocaleString('en-IN')} created`, icon: FileText, color: BrandColors.orange },
  ];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    setNotesList([newNote.trim(), ...notesList]);
    setNewNote('');
    showSnackbar('Note saved to lead history!', 'success');
  };

  const handleSendWhatsApp = () => {
    if (!quickMsg.trim()) return;
    sendWhatsAppMessage(1, quickMsg);
    setQuickMsg('');
    showSnackbar('WhatsApp message sent!', 'success');
  };

  return (
    <View style={styles.container}>
      {/* Top Navigation & Lead Header */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          style={styles.backBtn}
          onPress={() => setActiveScreen('leads')}
          activeOpacity={0.7}
        >
          <ArrowLeft size={18} color={BrandColors.textSecondary} />
          <Text style={styles.backBtnText}>Back to Leads</Text>
        </TouchableOpacity>

        <View style={styles.leadCodeBadge}>
          <Text style={styles.leadCodeText}>{lead.lead_code}</Text>
        </View>
      </View>

      {/* Hero Lead Info Bar */}
      <View style={[styles.heroCard, isMobile && styles.heroCardMobile]}>
        <View style={styles.heroLeft}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{lead.name.charAt(0)}</Text>
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.leadHeroName}>{lead.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: lead.status_color + '20' }]}>
                <Text style={[styles.statusBadgeText, { color: lead.status_color }]}>{lead.status_name}</Text>
              </View>
            </View>
            <Text style={styles.companyHero}>{lead.company_name} • {lead.city || 'India'}</Text>
            <View style={styles.contactRow}>
              <Text style={styles.contactItem}>📞 {lead.phone}</Text>
              <Text style={styles.contactDivider}>|</Text>
              <Text style={styles.contactItem}>✉️ {lead.email}</Text>
              <Text style={styles.contactDivider}>|</Text>
              <Text style={styles.contactItem}>🌐 {lead.source_name}</Text>
            </View>
          </View>
        </View>

        {/* Quick Lead Actions */}
        <View style={styles.heroActions}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: BrandColors.greenLight, borderColor: '#A7F3D0' }]}
            onPress={() => setActiveScreen('whatsapp')}
          >
            <MessageSquare size={16} color={BrandColors.green} />
            <Text style={[styles.actionBtnText, { color: BrandColors.green }]}>WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: BrandColors.blueLight, borderColor: '#BFDBFE' }]}
            onPress={() => showSnackbar(`Initiating call to ${lead.phone}`, 'info')}
          >
            <Phone size={16} color={BrandColors.blue} />
            <Text style={[styles.actionBtnText, { color: BrandColors.blue }]}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: BrandColors.orangeLight, borderColor: '#FDE68A' }]}
            onPress={() => setActiveScreen('quotations')}
          >
            <FileText size={16} color={BrandColors.orange} />
            <Text style={[styles.actionBtnText, { color: BrandColors.orange }]}>Send Quote</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'activity', label: 'Timeline & Activity' },
          { key: 'whatsapp', label: 'WhatsApp Chat' },
          { key: 'followups', label: 'Follow-ups' },
          { key: 'notes', label: `Notes (${notesList.length})` },
        ].map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tabItem, activeTab === t.key && styles.tabItemActive]}
            onPress={() => setActiveTab(t.key as any)}
          >
            <Text style={[styles.tabLabel, activeTab === t.key && styles.tabLabelActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main Two-Column Layout */}
      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={[styles.contentLayout, isMobile && styles.contentLayoutMobile]}>
          {/* Main Content Area */}
          <View style={styles.mainPanel}>
            {activeTab === 'overview' && (
              <View style={styles.tabContentCard}>
                <Text style={styles.sectionHeading}>Lead Summary & Commercials</Text>
                
                <View style={styles.detailsGrid}>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>Estimated Deal Value</Text>
                    <Text style={styles.detailBoxValue}>₹{lead.estimated_value.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>Priority</Text>
                    <Text style={[styles.detailBoxValue, { color: BrandColors.red, textTransform: 'uppercase' }]}>
                      {lead.priority}
                    </Text>
                  </View>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>Assigned Specialist</Text>
                    <Text style={styles.detailBoxValue}>{lead.assigned_user_name}</Text>
                  </View>
                  <View style={styles.detailBox}>
                    <Text style={styles.detailBoxLabel}>Next Scheduled Follow-up</Text>
                    <Text style={[styles.detailBoxValue, { color: BrandColors.orange }]}>
                      Today 11:30 AM
                    </Text>
                  </View>
                </View>

                {/* Pipeline Stage Quick Changer */}
                <View style={styles.stageChangerCard}>
                  <Text style={styles.stageChangerTitle}>MOVE STAGE IN PIPELINE</Text>
                  <View style={styles.stagePillsRow}>
                    {['new', 'contacted', 'qualified', 'quotation', 'negotiation', 'won', 'lost'].map(st => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.stagePillBtn,
                          lead.status_code === st && styles.stagePillActive
                        ]}
                        onPress={() => {
                          updateLeadStatus(lead.id, st as any);
                          showSnackbar(`Lead stage updated to ${st.toUpperCase()}`, 'success');
                        }}
                      >
                        <Text style={[
                          styles.stagePillText,
                          lead.status_code === st && styles.stagePillTextActive
                        ]}>
                          {st.charAt(0).toUpperCase() + st.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Recent Quotation for this Lead */}
                <View style={styles.subCard}>
                  <View style={styles.subCardHeader}>
                    <Text style={styles.subCardTitle}>Commercial Quotations</Text>
                    <TouchableOpacity onPress={() => setActiveScreen('quotations')}>
                      <Text style={styles.subCardLink}>+ New Quotation</Text>
                    </TouchableOpacity>
                  </View>
                  {relatedQuotes.length > 0 ? (
                    relatedQuotes.map(q => (
                      <View key={q.id} style={styles.quoteRow}>
                        <View>
                          <Text style={styles.quoteNo}>{q.quotation_number}</Text>
                          <Text style={styles.quoteDate}>Valid until {q.valid_until}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <Text style={styles.quoteAmt}>₹{q.grand_total.toLocaleString('en-IN')}</Text>
                          <Text style={[styles.quoteStatus, { color: q.status === 'accepted' ? BrandColors.green : BrandColors.orange }]}>
                            {q.status.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noQuotesText}>No quotations generated yet for this lead.</Text>
                  )}
                </View>
              </View>
            )}

            {activeTab === 'activity' && (
              <View style={styles.tabContentCard}>
                <Text style={styles.sectionHeading}>Activity & Ingestion Timeline</Text>
                <View style={styles.timelineList}>
                  {timelineSteps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                      <View key={idx} style={styles.timelineItem}>
                        <View style={[styles.timelineIconWrapper, { backgroundColor: step.color + '20' }]}>
                          <Icon size={16} color={step.color} />
                        </View>
                        <View style={styles.timelineBody}>
                          <View style={styles.timelineTitleRow}>
                            <Text style={styles.timelineTitle}>{step.title}</Text>
                            <Text style={styles.timelineTime}>{step.time}</Text>
                          </View>
                          <Text style={styles.timelineDesc}>{step.desc}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {activeTab === 'whatsapp' && (
              <View style={styles.tabContentCard}>
                <Text style={styles.sectionHeading}>WhatsApp Chat Preview</Text>
                <View style={styles.chatBox}>
                  <View style={styles.chatBubbleSystem}>
                    <Text style={styles.chatSystemText}>
                      🚀 Meta Lead Form Trigger: Template 'myth_lead_welcome' sent automatically via WhatsApp Cloud API.
                    </Text>
                  </View>
                  <View style={styles.chatBubbleOut}>
                    <Text style={styles.chatOutText}>
                      Hi {lead.name}, thank you for reaching out to Myth Connect.ai! Our specialist Sneha Kulkarni has received your inquiry.
                    </Text>
                    <Text style={styles.chatTimeText}>05:25 AM • Read ✓✓</Text>
                  </View>
                  <View style={styles.chatBubbleIn}>
                    <Text style={styles.chatInText}>
                      Thanks! Can you please share details on how your Meta integration syncs leads in real-time?
                    </Text>
                    <Text style={styles.chatTimeText}>05:40 AM</Text>
                  </View>
                </View>

                {/* Quick Reply Bar */}
                <View style={styles.quickSendBar}>
                  <TextInput
                    style={styles.quickInput}
                    placeholder="Type WhatsApp message..."
                    value={quickMsg}
                    onChangeText={setQuickMsg}
                  />
                  <TouchableOpacity style={styles.quickSendBtn} onPress={handleSendWhatsApp}>
                    <Send size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {activeTab === 'followups' && (
              <View style={styles.tabContentCard}>
                <Text style={styles.sectionHeading}>Scheduled Follow-ups</Text>
                <View style={styles.followupCardItem}>
                  <View style={styles.followupIconBox}>
                    <Clock size={18} color={BrandColors.orange} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.followupCardTitle}>Follow-up Call with Procurement Team</Text>
                    <Text style={styles.followupCardTime}>Today at 11:30 AM (In 2 hours)</Text>
                    <Text style={styles.followupCardNotes}>Review quote terms & multi-location installation options.</Text>
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'notes' && (
              <View style={styles.tabContentCard}>
                <Text style={styles.sectionHeading}>Internal Sales Notes</Text>
                <View style={styles.addNoteBox}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Add an internal note about this prospect..."
                    value={newNote}
                    onChangeText={setNewNote}
                    multiline
                  />
                  <TouchableOpacity style={styles.saveNoteBtn} onPress={handleAddNote}>
                    <Text style={styles.saveNoteBtnText}>Add Note</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.notesList}>
                  {notesList.map((n, i) => (
                    <View key={i} style={styles.noteItem}>
                      <Text style={styles.noteText}>{n}</Text>
                      <Text style={styles.noteAuthor}>Sneha Kulkarni • Today</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Secondary Panel: Lead Meta & Origin */}
          <View style={styles.sidePanel}>
            {lead.source_code === 'digital_profile' || lead.source_code === 'digital_profile_shop' || lead.source_code === 'qr' ? (
              <View style={styles.sideCard}>
                <Text style={styles.sideCardTitle}>DIGITAL PROFILE & SHOP ORIGIN</Text>
                
                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Source Profile</Text>
                  <Text style={styles.metaValue}>{lead.public_url ? `Mugai Tech (${lead.public_url})` : 'Mugai Tech'}</Text>
                </View>

                {lead.attached_product_name && (
                  <View style={styles.metaField}>
                    <Text style={styles.metaLabel}>Attached Product</Text>
                    <Text style={[styles.metaValue, { color: BrandColors.green, fontWeight: '700' }]}>
                      🛍️ {lead.attached_product_name}
                    </Text>
                  </View>
                )}

                {lead.enquiry_quantity && (
                  <View style={styles.metaField}>
                    <Text style={styles.metaLabel}>Requested Quantity</Text>
                    <Text style={styles.metaValue}>{lead.enquiry_quantity} units</Text>
                  </View>
                )}

                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Smart QR Code ID</Text>
                  <Text style={styles.metaValueCode}>{lead.qr_id || 'QR-DP-MUGAI01'}</Text>
                </View>

                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Visitor Attribution</Text>
                  <Text style={styles.metaValue}>{lead.referrer || 'Direct Scan / Link'}</Text>
                </View>

                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Enquiry Ingestion Time</Text>
                  <Text style={styles.metaValue}>{new Date(lead.created_at).toLocaleString()}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.sideCard}>
                <Text style={styles.sideCardTitle}>META LEAD AD ORIGIN</Text>
                
                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Campaign Name</Text>
                  <Text style={styles.metaValue}>{lead.meta_campaign_name || 'B2B Enterprise Lead Gen'}</Text>
                </View>

                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Creative / Ad</Text>
                  <Text style={styles.metaValue}>{lead.meta_ad_name || 'WhatsApp CRM Carousel Ad'}</Text>
                </View>

                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Meta Leadgen ID</Text>
                  <Text style={styles.metaValueCode}>{lead.meta_lead_id || 'meta_ld_87123910'}</Text>
                </View>

                <View style={styles.metaField}>
                  <Text style={styles.metaLabel}>Ingestion Timestamp</Text>
                  <Text style={styles.metaValue}>{new Date(lead.created_at).toLocaleString()}</Text>
                </View>
              </View>
            )}

            <View style={styles.sideCard}>
              <Text style={styles.sideCardTitle}>COMMUNICATION METRICS</Text>
              
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>WhatsApp Status</Text>
                <Text style={[styles.metricValue, { color: BrandColors.green }]}>Connected (Active)</Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Messages Exchanged</Text>
                <Text style={styles.metricValue}>4 messages</Text>
              </View>

              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Avg Response Time</Text>
                <Text style={styles.metricValue}>12 minutes</Text>
              </View>
            </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  leadCodeBadge: {
    backgroundColor: BrandColors.blueLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  leadCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroCardMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 16,
  },
  heroLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: BrandColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  leadHeroName: {
    fontSize: 20,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  companyHero: {
    fontSize: 13.5,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  contactItem: {
    fontSize: 12,
    color: BrandColors.textPrimary,
  },
  contactDivider: {
    fontSize: 11,
    color: BrandColors.border,
  },
  heroActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  actionBtnText: {
    fontSize: 12.5,
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
  tabLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  tabLabelActive: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  scrollInner: {
    padding: 24,
    paddingBottom: 80,
  },
  contentLayout: {
    flexDirection: 'row',
    gap: 24,
  },
  contentLayoutMobile: {
    flexDirection: 'column',
  },
  mainPanel: {
    flex: 1.8,
  },
  sidePanel: {
    flex: 1,
    gap: 16,
  },
  tabContentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  detailBox: {
    width: 'calc(50% - 6px)' as any,
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 14,
    borderRadius: 8,
  },
  detailBoxLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textSecondary,
    marginBottom: 4,
  },
  detailBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  stageChangerCard: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
  },
  stageChangerTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  stagePillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  stagePillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: BrandColors.border,
    backgroundColor: '#FFFFFF',
  },
  stagePillActive: {
    backgroundColor: BrandColors.blue,
    borderColor: BrandColors.blue,
  },
  stagePillText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  stagePillTextActive: {
    color: '#FFFFFF',
  },
  subCard: {
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    paddingTop: 16,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  subCardLink: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: BrandColors.surfaceSubtle,
    borderRadius: 8,
    marginBottom: 8,
  },
  quoteNo: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  quoteDate: {
    fontSize: 11,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  quoteAmt: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  quoteStatus: {
    fontSize: 11,
    fontWeight: '700',
  },
  noQuotesText: {
    fontSize: 12.5,
    color: BrandColors.textMuted,
  },
  timelineList: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineBody: {
    flex: 1,
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 12,
    borderRadius: 8,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  timelineTime: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  timelineDesc: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 4,
  },
  chatBox: {
    backgroundColor: '#F0F2F5',
    padding: 16,
    borderRadius: 8,
    gap: 10,
    marginBottom: 14,
  },
  chatBubbleSystem: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '85%',
  },
  chatSystemText: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  chatBubbleOut: {
    alignSelf: 'flex-end',
    backgroundColor: '#D9FDD3',
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  chatOutText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
  },
  chatBubbleIn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    maxWidth: '80%',
  },
  chatInText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
  },
  chatTimeText: {
    fontSize: 10,
    color: BrandColors.textMuted,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  quickSendBar: {
    flexDirection: 'row',
    gap: 8,
  },
  quickInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
  quickSendBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: BrandColors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followupCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    padding: 14,
    borderRadius: 8,
    gap: 12,
  },
  followupIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: BrandColors.orangeLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followupCardTitle: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  followupCardTime: {
    fontSize: 11.5,
    color: BrandColors.orange,
    fontWeight: '600',
    marginTop: 2,
  },
  followupCardNotes: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 4,
  },
  addNoteBox: {
    marginBottom: 16,
  },
  noteInput: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    marginBottom: 8,
    outlineStyle: 'none' as any,
  },
  saveNoteBtn: {
    alignSelf: 'flex-end',
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
  },
  saveNoteBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notesList: {
    gap: 10,
  },
  noteItem: {
    padding: 12,
    backgroundColor: BrandColors.surfaceSubtle,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
    lineHeight: 18,
  },
  noteAuthor: {
    fontSize: 11,
    color: BrandColors.textMuted,
    marginTop: 4,
  },
  sideCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  sideCardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  metaField: {
    marginBottom: 12,
  },
  metaLabel: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  metaValueCode: {
    fontSize: 11.5,
    fontFamily: "'Space Grotesk', monospace",
    color: BrandColors.blue,
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  metricLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
});
