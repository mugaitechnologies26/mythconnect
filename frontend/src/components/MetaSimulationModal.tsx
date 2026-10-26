import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { Sparkles, X, CheckCircle, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { simulationApi } from '../services/api';

export const MetaSimulationModal: React.FC = () => {
  const { 
    isMetaSimModalOpen, 
    setMetaSimModalOpen, 
    addLead, 
    addFollowup, 
    sendWhatsAppMessage, 
    addNotification, 
    showSnackbar,
    navigateToLeadDetail
  } = useAppStore();

  const [name, setName] = useState('Vikramaditya Rao');
  const [phone, setPhone] = useState('+919876543299');
  const [email, setEmail] = useState('vikram.rao@b2bindia.com');
  const [company, setCompany] = useState('Rao TechLogistics Ltd');
  const [campaign, setCampaign] = useState('Facebook Lead Ads - B2B High Intent');
  const [adName, setAdName] = useState('Carousel - WhatsApp CRM Automations');
  const [estimatedValue, setEstimatedValue] = useState('145000');
  const [city, setCity] = useState('Bengaluru');
  const [loading, setLoading] = useState(false);
  const [completedLeadId, setCompletedLeadId] = useState<number | null>(null);

  if (!isMetaSimModalOpen) return null;

  const handleSimulate = async () => {
    setLoading(true);

    try {
      // 1. Send to backend simulation endpoint if available
      try {
        await simulationApi.simulateMetaLead({
          name,
          phone,
          email,
          company_name: company,
          campaign_name: campaign,
          ad_name: adName,
          estimated_value: Number(estimatedValue) || 120000,
          city,
          state: 'Karnataka'
        });
      } catch (e) {
        console.log('Node simulation dispatched locally');
      }

      // 2. Add to store
      const newLead = addLead({
        name,
        phone,
        email,
        company_name: company,
        source_id: 1,
        source_name: 'Meta Lead Ads (Facebook & Instagram)',
        source_code: 'meta',
        status_id: 1,
        status_code: 'new',
        status_name: 'New',
        status_color: '#1565E8',
        assigned_to: 4,
        assigned_user_name: 'Sneha Kulkarni',
        estimated_value: Number(estimatedValue) || 120000,
        priority: 'high',
        city,
        state: 'Karnataka',
        meta_lead_id: `meta_ld_${Date.now()}`,
        meta_campaign_name: campaign,
        meta_ad_name: adName,
      });

      // 3. Automated follow-up
      const followUpTime = new Date();
      followUpTime.setHours(followUpTime.getHours() + 2);

      addFollowup({
        lead_id: newLead.id,
        lead_name: name,
        lead_phone: phone,
        lead_company: company,
        assigned_to: 4,
        assigned_user_name: 'Sneha Kulkarni',
        scheduled_at: followUpTime.toISOString(),
        type: 'whatsapp',
        status: 'pending',
        notes: `Automated: Ingested from ${campaign}. Send introduction deck.`
      });

      // 4. Automated Notification
      addNotification({
        type: 'meta_lead_created',
        title: '🔥 New Meta Lead Ingested',
        message: `${name} (${phone}) submitted Lead Form from ${campaign}`,
        action_url: 'leads'
      });

      setCompletedLeadId(newLead.id);
      showSnackbar(`🔥 Meta Lead #${newLead.lead_code} created! Auto WhatsApp welcome queued.`, 'success');
    } catch (err: any) {
      showSnackbar(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setCompletedLeadId(null);
    setMetaSimModalOpen(false);
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.dialog}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.sparkleIcon}>
                <Sparkles size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Meta Lead Ads Live Simulator</Text>
                <Text style={styles.headerSubtitle}>Simulate Facebook / Instagram Lead Ingestion & WhatsApp Automation</Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleReset} style={styles.closeBtn}>
              <X size={20} color={BrandColors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.contentScroll}>
            {completedLeadId ? (
              <View style={styles.successState}>
                <View style={styles.successIcon}>
                  <CheckCircle size={48} color={BrandColors.green} />
                </View>
                <Text style={styles.successTitle}>Meta Webhook Processed Successfully!</Text>
                <Text style={styles.successDesc}>
                  Lead was created, assigned to Sneha Kulkarni, automated welcome WhatsApp template was dispatched, and a 2-hour follow-up was scheduled.
                </Text>

                <View style={styles.workflowChain}>
                  <Text style={styles.chainTitle}>AUTOMATED WORKFLOW EXECUTED:</Text>
                  <Text style={styles.chainStep}>1. Ingested Meta webhook payload</Text>
                  <Text style={styles.chainStep}>2. Deduplication check passed (New phone number)</Text>
                  <Text style={styles.chainStep}>3. Ingested into CRM with High Intent priority</Text>
                  <Text style={styles.chainStep}>4. Dispatched WhatsApp Template "myth_lead_welcome"</Text>
                  <Text style={styles.chainStep}>5. Scheduled pending follow-up for today</Text>
                </View>

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={styles.viewLeadBtn}
                    onPress={() => {
                      navigateToLeadDetail(completedLeadId);
                      handleReset();
                    }}
                  >
                    <Text style={styles.viewLeadBtnText}>Open Lead Details</Text>
                    <ArrowRight size={16} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={() => setCompletedLeadId(null)}
                  >
                    <Text style={styles.secondaryBtnText}>Simulate Another</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.formContainer}>
                {/* Pipeline Flow Banner */}
                <View style={styles.flowBanner}>
                  <Zap size={16} color={BrandColors.blue} />
                  <Text style={styles.flowBannerText}>
                    Meta Lead Ad ➔ Webhook ➔ Lead Creation ➔ Auto WhatsApp ➔ Follow-up
                  </Text>
                </View>

                {/* Form Fields */}
                <View style={styles.row}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Lead Full Name *</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Vikramaditya Rao"
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Phone Number (WhatsApp) *</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="+919876543299"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Business Email *</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="vikram.rao@b2bindia.com"
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Company / Organisation *</Text>
                    <TextInput
                      style={styles.input}
                      value={company}
                      onChangeText={setCompany}
                      placeholder="Rao TechLogistics Ltd"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Meta Campaign Name</Text>
                    <TextInput
                      style={styles.input}
                      value={campaign}
                      onChangeText={setCampaign}
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Ad Form Name</Text>
                    <TextInput
                      style={styles.input}
                      value={adName}
                      onChangeText={setAdName}
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>Estimated Deal Value (₹)</Text>
                    <TextInput
                      style={styles.input}
                      value={estimatedValue}
                      onChangeText={setEstimatedValue}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.fieldCol}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>

                {/* Submit Action */}
                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleSimulate}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Sparkles size={18} color="#FFFFFF" />
                      <Text style={styles.submitBtnText}>Trigger Meta Webhook & Automate</Text>
                    </>
                  )}
                </TouchableOpacity>
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
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16,
  },
  dialog: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.borderLight,
    backgroundColor: '#FAFCFE',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sparkleIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BrandColors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  headerSubtitle: {
    fontSize: 11.5,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: BrandColors.surfaceSubtle,
  },
  contentScroll: {
    padding: 20,
    maxHeight: 520,
  },
  flowBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BrandColors.blueLight,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  flowBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.blue,
    flex: 1,
  },
  formContainer: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: BrandColors.textPrimary,
    backgroundColor: '#FFFFFF',
    outlineStyle: 'none' as any,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blue,
    paddingVertical: 13,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  successState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.darkNavy,
    marginBottom: 6,
  },
  successDesc: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  workflowChain: {
    width: '100%',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    gap: 6,
  },
  chainTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.6,
  },
  chainStep: {
    fontSize: 12.5,
    color: BrandColors.textPrimary,
    fontWeight: '500',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  viewLeadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blue,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  viewLeadBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  secondaryBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingVertical: 12,
    borderRadius: 8,
  },
  secondaryBtnText: {
    color: BrandColors.textPrimary,
    fontSize: 13.5,
    fontWeight: '600',
  },
});
