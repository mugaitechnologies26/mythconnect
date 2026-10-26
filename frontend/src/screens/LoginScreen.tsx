import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { BrandLogo } from '../components/BrandLogo';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Lock } from 'lucide-react';

export const LoginScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { login, showSnackbar } = useAppStore();

  const [email, setEmail] = useState('admin@mythconnect.ai');
  const [password, setPassword] = useState('••••••••••••');

  const handleLogin = () => {
    login(email);
    showSnackbar(`Welcome back to Myth Connect.ai!`, 'success');
  };

  const handleQuickRole = (roleEmail: string, roleName: string) => {
    setEmail(roleEmail);
    login(roleEmail);
    showSnackbar(`Logged in as ${roleName}`, 'success');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.splitLayout, isMobile && styles.splitLayoutMobile]}>
        {/* Left Side: Brand & Product Showcase (Desktop only) */}
        {!isMobile && (
          <View style={styles.leftBrandCol}>
            <View style={styles.leftHeader}>
              <BrandLogo size="lg" showTagline lightText />
            </View>

            <View style={styles.brandHeroContent}>
              <Text style={styles.heroHeading}>
                Turn Meta Ad clicks into closed sales on WhatsApp
              </Text>
              <Text style={styles.heroSub}>
                Omnichannel enterprise sales infrastructure connecting Facebook & Instagram lead ads with instant WhatsApp Cloud API messaging, automated sales cadences, quotation generation, and GST billing.
              </Text>

              <View style={styles.featureHighlights}>
                <View style={styles.featureItem}>
                  <Zap size={18} color="#00A86B" />
                  <Text style={styles.featureText}>Instant Meta Webhook Ingestion (&lt;1s latency)</Text>
                </View>
                <View style={styles.featureItem}>
                  <Sparkles size={18} color="#1565E8" />
                  <Text style={styles.featureText}>Automated Approved WhatsApp Welcome Templates</Text>
                </View>
                <View style={styles.featureItem}>
                  <ShieldCheck size={18} color="#F5A000" />
                  <Text style={styles.featureText}>18% GST Compliant Formal Quotations & Invoicing</Text>
                </View>
              </View>
            </View>

            <View style={styles.leftFooter}>
              <Text style={styles.corpFoot}>Myth Connect.ai Technologies • ISO 27001 Certified</Text>
            </View>
          </View>
        )}

        {/* Right Side: Login Card */}
        <View style={styles.rightCardCol}>
          <View style={styles.cardBox}>
            {isMobile && (
              <View style={{ marginBottom: 24, alignItems: 'center' }}>
                <BrandLogo size="md" showTagline />
              </View>
            )}

            <Text style={styles.cardTitle}>Sign in to your account</Text>
            <Text style={styles.cardSubtitle}>Enter your corporate credentials to continue</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address or Mobile</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="name@company.com"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Password</Text>
                <TouchableOpacity onPress={() => showSnackbar('Password reset instructions sent to email', 'info')}>
                  <Text style={styles.forgotLink}>Forgot password?</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.signInBtnText}>Sign In to Dashboard</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Quick Demo Switcher */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>QUICK DEMO ACCESS (SELECT ROLE)</Text>
              <View style={styles.roleGrid}>
                {[
                  { label: 'Super Admin', email: 'admin@mythconnect.ai' },
                  { label: 'Sales Exec (Sneha)', email: 'sneha.k@mythconnect.ai' },
                  { label: 'Sales Manager (Vikram)', email: 'vikram.m@mythconnect.ai' },
                  { label: 'Accounts (Rohan)', email: 'rohan.d@mythconnect.ai' }
                ].map(r => (
                  <TouchableOpacity
                    key={r.email}
                    style={styles.rolePill}
                    onPress={() => handleQuickRole(r.email, r.label)}
                  >
                    <Text style={styles.rolePillText}>{r.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  splitLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  splitLayoutMobile: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: BrandColors.bg,
  },
  leftBrandCol: {
    flex: 1.2,
    backgroundColor: BrandColors.darkNavy,
    padding: 48,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  leftHeader: {
    marginBottom: 40,
  },
  brandHeroContent: {
    maxWidth: 500,
  },
  heroHeading: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    lineHeight: 44,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 24,
    marginBottom: 32,
  },
  featureHighlights: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '500',
  },
  leftFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 16,
  },
  corpFoot: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  rightCardCol: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  cardBox: {
    width: '100%',
    maxWidth: 420,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  cardSubtitle: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    marginTop: 4,
    marginBottom: 24,
  },
  formGroup: {
    marginBottom: 16,
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  forgotLink: {
    fontSize: 11.5,
    fontWeight: '600',
    color: BrandColors.blue,
  },
  input: {
    borderWidth: 1,
    borderColor: BrandColors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13.5,
    backgroundColor: '#FFFFFF',
    outlineStyle: 'none' as any,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blue,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    gap: 8,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
  },
  demoTitle: {
    fontSize: 10.5,
    fontWeight: '700',
    color: BrandColors.textMuted,
    marginBottom: 10,
    letterSpacing: 0.6,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rolePill: {
    backgroundColor: BrandColors.surfaceSubtle,
    borderWidth: 1,
    borderColor: BrandColors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
});
