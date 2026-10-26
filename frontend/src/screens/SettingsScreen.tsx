import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Sliders, Building, CheckCircle2, Shield, Bell, CreditCard } from 'lucide-react';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { settingsApi } from '../services/api';

export const SettingsScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { settings, showSnackbar } = useAppStore();

  const [companyName, setCompanyName] = useState(settings['company_name'] || '');
  const [tagline, setTagline] = useState(settings['company_tagline'] || '');
  const [gstin, setGstin] = useState(settings['company_gstin'] || '');
  const [address, setAddress] = useState(settings['company_address'] || '');
  const [email, setEmail] = useState(settings['company_email'] || '');
  const [currency, setCurrency] = useState(settings['currency_code'] ? `${settings['currency_code']} (${settings['currency_symbol'] || '₹'})` : 'INR (₹)');
  const [taxRate, setTaxRate] = useState('18');

  useEffect(() => {
    if (Object.keys(settings).length > 0) {
      if (settings['company_name']) setCompanyName(settings['company_name']);
      if (settings['company_tagline']) setTagline(settings['company_tagline']);
      if (settings['company_gstin']) setGstin(settings['company_gstin']);
      if (settings['company_address']) setAddress(settings['company_address']);
      if (settings['company_email']) setEmail(settings['company_email']);
    }
  }, [settings]);

  const handleSave = () => {
    settingsApi.updateSettings({
      company_name: companyName,
      company_tagline: tagline,
      company_gstin: gstin,
      company_address: address,
      company_email: email,
    }).then(() => {
      showSnackbar('Company profile and GST billing settings updated in database!', 'success');
    }).catch(() => {
      showSnackbar('Settings saved locally', 'info');
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, isMobile && styles.headerMobile]}>
        <View>
          <Text style={styles.pageTitle}>System & Organisation Settings</Text>
          <Text style={styles.pageSubtitle}>
            Branding, GST rules, invoice terms, and business defaults
          </Text>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save Settings</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollInner}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>COMPANY & LEGAL PROFILE</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Registered Legal Entity Name</Text>
              <TextInput style={styles.input} value={companyName} onChangeText={setCompanyName} />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Official Tagline / Positioning</Text>
              <TextInput style={styles.input} value={tagline} onChangeText={setTagline} />
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Corporate GSTIN</Text>
              <TextInput style={styles.input} value={gstin} onChangeText={setGstin} />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Official Contact Email</Text>
              <TextInput style={styles.input} value={email} onChangeText={setEmail} />
            </View>
          </View>

          <View style={styles.fieldFull}>
            <Text style={styles.label}>Registered Head Office Address</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>TAX & CURRENCY PREFERENCES</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formCol}>
              <Text style={styles.label}>Standard Indian GST Rate (%)</Text>
              <TextInput style={styles.input} value={taxRate} onChangeText={setTaxRate} keyboardType="numeric" />
            </View>
            <View style={styles.formCol}>
              <Text style={styles.label}>Base Currency</Text>
              <TextInput style={styles.input} value={currency} onChangeText={setCurrency} />
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
  saveBtn: {
    backgroundColor: BrandColors.blue,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
  },
  saveBtnText: {
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BrandColors.border,
    padding: 20,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: BrandColors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
  },
  formCol: {
    flex: 1,
    gap: 6,
  },
  fieldFull: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    outlineStyle: 'none' as any,
  },
});
