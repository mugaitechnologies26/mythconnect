import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Search, Send, Paperclip, Smile, FileText, Check, 
  CheckCheck, Phone, User, Tag, Sparkles, AlertCircle, ArrowLeft
} from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { WhatsAppMessage } from '../types';
import { simulationApi } from '../services/api';

export const WhatsAppCRMScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    conversations, 
    messages, 
    templates, 
    sendWhatsAppMessage, 
    receiveWhatsAppMessage, 
    showSnackbar,
    leads,
    navigateToLeadDetail
  } = useAppStore();

  const [activeConvId, setActiveConvId] = useState<number>(conversations[0]?.id || 1);
  const [inputText, setInputText] = useState('');
  const [searchConv, setSearchConv] = useState('');
  const [isTemplateMenuOpen, setTemplateMenuOpen] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  const activeConv = conversations.find(c => c.id === activeConvId) || conversations[0];
  const activeMessages = messages[activeConvId] || [];
  const linkedLead = leads.find(l => l.id === activeConv?.lead_id || l.phone === activeConv?.phone);

  const filteredConversations = conversations.filter(c => 
    c.name.toLowerCase().includes(searchConv.toLowerCase()) || 
    c.phone.includes(searchConv)
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendWhatsAppMessage(activeConvId, inputText.trim());
    setInputText('');
  };

  const handleSendTemplate = (tmpl: any) => {
    const text = tmpl.body_text
      .replace('{{1}}', activeConv.name)
      .replace('{{2}}', 'Sneha Kulkarni')
      .replace('{{3}}', '1,25,000')
      .replace('{{4}}', '30 Days');
    
    sendWhatsAppMessage(activeConvId, text, tmpl.name);
    setTemplateMenuOpen(false);
    showSnackbar(`Dispatched WhatsApp Template: ${tmpl.name}`, 'success');
  };

  const simulateCustomerReply = async () => {
    const replies = [
      "Hi! Could you also email us the formal GST invoice copy?",
      "We are ready to proceed with 5 user licenses. Can we start onboarding tomorrow?",
      "Thanks for the prompt quotation! Is the 18% GST included in the final figure?",
      "Can we integrate this with our existing Zoho Inventory database?"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];

    try {
      await simulationApi.simulateWhatsAppReply({
        phone: activeConv.phone,
        name: activeConv.name,
        content: reply
      });
    } catch (e) {
      // Local fallback
    }

    receiveWhatsAppMessage(activeConv.phone, reply, activeConv.name);
    showSnackbar(`Incoming reply received from ${activeConv.name}`, 'info');
  };

  return (
    <View style={styles.container}>
      {/* 3-Column Layout on Desktop */}
      <View style={styles.layoutRow}>
        {/* Left Column: Conversations List */}
        {(!isMobile || !mobileChatOpen) && (
          <View style={[styles.convColumn, isMobile && styles.fullWidthCol]}>
            <View style={styles.convHeader}>
              <Text style={styles.convHeaderTitle}>WhatsApp Inbox</Text>
              <TouchableOpacity 
                style={styles.simReplyBtn}
                onPress={simulateCustomerReply}
                activeOpacity={0.8}
                title="Simulate Inbound Customer Reply"
              >
                <Sparkles size={14} color="#FFFFFF" />
                <Text style={styles.simReplyBtnText}>Simulate Reply</Text>
              </TouchableOpacity>
            </View>

            {/* Search Conversations */}
            <View style={styles.searchBox}>
              <Search size={15} color={BrandColors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search chats by name or phone..."
                value={searchConv}
                onChangeText={setSearchConv}
              />
            </View>

            {/* Conversation List */}
            <ScrollView style={styles.convScroll}>
              {filteredConversations.map(conv => {
                const isActive = conv.id === activeConvId;
                return (
                  <TouchableOpacity
                    key={conv.id}
                    style={[styles.convItem, isActive && styles.convItemActive]}
                    onPress={() => {
                      setActiveConvId(conv.id);
                      if (isMobile) setMobileChatOpen(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.convAvatar}>
                      <Text style={styles.convAvatarText}>{conv.name.charAt(0)}</Text>
                    </View>

                    <View style={styles.convDetails}>
                      <View style={styles.convTopRow}>
                        <Text style={[styles.convName, isActive && styles.convNameActive]}>
                          {conv.name}
                        </Text>
                        <Text style={styles.convTime}>Just now</Text>
                      </View>
                      <Text style={styles.convLastMsg} numberOfLines={1}>
                        {conv.last_message}
                      </Text>
                      <View style={styles.convMetaRow}>
                        <Text style={styles.convPhone}>{conv.phone}</Text>
                        {conv.unread_count > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{conv.unread_count}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Center Column: Active Chat Feed */}
        {(!isMobile || mobileChatOpen) && (
          <View style={[styles.chatColumn, isMobile && styles.fullWidthCol]}>
            {/* Chat Top Header */}
            <View style={styles.chatHeader}>
              <View style={styles.chatHeaderLeft}>
                {isMobile && (
                  <TouchableOpacity 
                    style={styles.mobileBackBtn} 
                    onPress={() => setMobileChatOpen(false)}
                  >
                    <ArrowLeft size={20} color={BrandColors.darkNavy} />
                  </TouchableOpacity>
                )}
                <View style={styles.chatAvatar}>
                  <Text style={styles.chatAvatarText}>{activeConv?.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.chatHeaderName}>{activeConv?.name}</Text>
                  <Text style={styles.chatHeaderPhone}>{activeConv?.phone} • WhatsApp Cloud API</Text>
                </View>
              </View>

              <View style={styles.chatHeaderRight}>
                <TouchableOpacity 
                  style={styles.templateBtn}
                  onPress={() => setTemplateMenuOpen(!isTemplateMenuOpen)}
                >
                  <FileText size={15} color={BrandColors.blue} />
                  <Text style={styles.templateBtnText}>Templates</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.simReplyBtnSmall}
                  onPress={simulateCustomerReply}
                  title="Simulate Inbound WhatsApp Reply"
                >
                  <Sparkles size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Template Selector Dropdown */}
            {isTemplateMenuOpen && (
              <View style={styles.templateDropdown}>
                <Text style={styles.templateDropdownTitle}>SELECT WHATSAPP APPROVED TEMPLATE</Text>
                {templates.map(tmpl => (
                  <TouchableOpacity
                    key={tmpl.id}
                    style={styles.templateOption}
                    onPress={() => handleSendTemplate(tmpl)}
                  >
                    <View style={styles.tmplBadge}>
                      <Text style={styles.tmplBadgeText}>{tmpl.category}</Text>
                    </View>
                    <Text style={styles.tmplName}>{tmpl.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Chat Messages Feed */}
            <ScrollView style={styles.messageScroll} contentContainerStyle={styles.messageScrollContent}>
              {/* WhatsApp Official Encryption Banner */}
              <View style={styles.encBanner}>
                <Text style={styles.encBannerText}>
                  🔒 Verified WhatsApp Cloud API Integration • End-to-end encrypted
                </Text>
              </View>

              {activeMessages.map((msg) => {
                const isOut = msg.sender_type === 'agent';
                const isSys = msg.sender_type === 'system';

                if (isSys) {
                  return (
                    <View key={msg.id} style={styles.systemBubble}>
                      <Text style={styles.systemMsgText}>🤖 {msg.content}</Text>
                      <Text style={styles.systemMsgTime}>Automated Rule Dispatched</Text>
                    </View>
                  );
                }

                return (
                  <View key={msg.id} style={[styles.bubbleWrapper, isOut ? styles.bubbleRight : styles.bubbleLeft]}>
                    <View style={[styles.messageBubble, isOut ? styles.bubbleOut : styles.bubbleIn]}>
                      <Text style={styles.messageText}>{msg.content}</Text>
                      <View style={styles.messageFooter}>
                        <Text style={styles.messageTime}>11:42 AM</Text>
                        {isOut && (
                          <View style={styles.statusTicks}>
                            {msg.status === 'read' ? (
                              <CheckCheck size={14} color="#34B7F1" />
                            ) : msg.status === 'delivered' ? (
                              <CheckCheck size={14} color="#8696A0" />
                            ) : (
                              <Check size={14} color="#8696A0" />
                            )}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Message Composer Bar */}
            <View style={styles.composerBar}>
              <TouchableOpacity style={styles.attachBtn}>
                <Paperclip size={18} color={BrandColors.textSecondary} />
              </TouchableOpacity>
              
              <TextInput
                style={styles.composerInput}
                placeholder="Type a message or click 'Templates' above..."
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSend}
              />

              <TouchableOpacity 
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]} 
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Right Column: Customer Info Sidebar (Desktop only) */}
        {!isMobile && (
          <View style={styles.infoColumn}>
            <View style={styles.infoAvatar}>
              <Text style={styles.infoAvatarText}>{activeConv?.name.charAt(0)}</Text>
            </View>
            <Text style={styles.infoName}>{activeConv?.name}</Text>
            <Text style={styles.infoPhone}>{activeConv?.phone}</Text>

            <View style={styles.infoSection}>
              <Text style={styles.infoSectionTitle}>LEAD & CRM STATUS</Text>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status</Text>
                <View style={[styles.leadStatusPill, { backgroundColor: BrandColors.blueLight }]}>
                  <Text style={styles.leadStatusText}>{activeConv?.status || 'Active Lead'}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Assigned Specialist</Text>
                <Text style={styles.infoVal}>Sneha Kulkarni</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Source</Text>
                <Text style={styles.infoVal}>Meta Lead Ads</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Deal</Text>
                <Text style={[styles.infoVal, { fontWeight: '700', color: BrandColors.darkNavy }]}>
                  ₹1,25,000
                </Text>
              </View>
            </View>

            {/* Actions for this lead */}
            {linkedLead && (
              <TouchableOpacity 
                style={styles.viewLeadBtn}
                onPress={() => navigateToLeadDetail(linkedLead.id)}
              >
                <Text style={styles.viewLeadBtnText}>Open Full Lead File</Text>
              </TouchableOpacity>
            )}

            <View style={styles.quickTagsSection}>
              <Text style={styles.infoSectionTitle}>TAGS</Text>
              <View style={styles.tagsGroup}>
                <View style={styles.tagItem}><Text style={styles.tagText}>Meta Ads</Text></View>
                <View style={styles.tagItem}><Text style={styles.tagText}>High Intent</Text></View>
                <View style={styles.tagItem}><Text style={styles.tagText}>Quotation Sent</Text></View>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.bg,
  },
  layoutRow: {
    flex: 1,
    flexDirection: 'row',
  },
  convColumn: {
    width: 320,
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
    borderRightColor: BrandColors.border,
    display: 'flex',
    flexDirection: 'column',
  },
  chatColumn: {
    flex: 1,
    backgroundColor: '#EFEAE2', // WhatsApp classic high-contrast clean backdrop
    display: 'flex',
    flexDirection: 'column',
  },
  infoColumn: {
    width: 280,
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1,
    borderLeftColor: BrandColors.border,
    padding: 20,
    alignItems: 'center',
  },
  fullWidthCol: {
    width: '100%',
    flex: 1,
  },
  convHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
  },
  convHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  simReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.green,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  simReplyBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    marginHorizontal: 12,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    fontSize: 12.5,
    flex: 1,
    outlineStyle: 'none' as any,
  },
  convScroll: {
    flex: 1,
  },
  convItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
    gap: 12,
  },
  convItemActive: {
    backgroundColor: BrandColors.blueLight,
  },
  convAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BrandColors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  convDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  convTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  convName: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  convNameActive: {
    color: BrandColors.blue,
  },
  convTime: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  convLastMsg: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 4,
  },
  convMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convPhone: {
    fontSize: 11,
    color: BrandColors.textMuted,
  },
  unreadBadge: {
    backgroundColor: BrandColors.green,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  chatHeader: {
    height: 64,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mobileBackBtn: {
    padding: 4,
    marginRight: 4,
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BrandColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  chatHeaderName: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  chatHeaderPhone: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
  },
  chatHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blueLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  templateBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  simReplyBtnSmall: {
    backgroundColor: BrandColors.green,
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateDropdown: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    padding: 12,
    zIndex: 10,
  },
  templateDropdownTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: BrandColors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.6,
  },
  templateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
    gap: 10,
  },
  tmplBadge: {
    backgroundColor: BrandColors.blueLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tmplBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  tmplName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  messageScroll: {
    flex: 1,
  },
  messageScrollContent: {
    padding: 16,
    gap: 8,
  },
  encBanner: {
    alignSelf: 'center',
    backgroundColor: '#FFEECD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  encBannerText: {
    fontSize: 11,
    color: '#533F03',
  },
  systemBubble: {
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    maxWidth: '85%',
    alignItems: 'center',
    marginVertical: 4,
  },
  systemMsgText: {
    fontSize: 11.5,
    color: BrandColors.darkNavy,
    fontWeight: '500',
    textAlign: 'center',
  },
  systemMsgTime: {
    fontSize: 9.5,
    color: BrandColors.textMuted,
    marginTop: 2,
  },
  bubbleWrapper: {
    width: '100%',
    flexDirection: 'row',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleOut: {
    backgroundColor: '#D9FDD3', // WhatsApp Outgoing Message Green
    borderTopRightRadius: 2,
  },
  bubbleIn: {
    backgroundColor: '#FFFFFF', // WhatsApp Incoming Message White
    borderTopLeftRadius: 2,
  },
  messageText: {
    fontSize: 13.5,
    color: '#111B21',
    lineHeight: 19,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 3,
    gap: 4,
  },
  messageTime: {
    fontSize: 10.5,
    color: '#667781',
  },
  statusTicks: {
    marginLeft: 2,
  },
  composerBar: {
    backgroundColor: '#F0F2F5',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  attachBtn: {
    padding: 8,
  },
  composerInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
    fontSize: 13.5,
    outlineStyle: 'none' as any,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.6,
  },
  infoAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: BrandColors.darkNavy,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  infoAvatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  infoName: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  infoPhone: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  infoSection: {
    width: '100%',
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    gap: 10,
  },
  infoSectionTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  leadStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  leadStatusText: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  viewLeadBtn: {
    width: '100%',
    backgroundColor: BrandColors.blueLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  viewLeadBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BrandColors.blue,
  },
  quickTagsSection: {
    width: '100%',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
  },
  tagsGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagItem: {
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: BrandColors.textSecondary,
  },
});
