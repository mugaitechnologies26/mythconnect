import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BrandLogo } from '../components/BrandLogo';
import { BrandColors } from '../theme';
import { useAppStore } from '../store/useAppStore';
import { 
  Sparkles, ArrowRight, ShieldCheck, Zap, Lock, Shield, 
  Users, TrendingUp, MessageSquare, Receipt, KeyRound, 
  CheckCircle2, ChevronRight, UserCheck, ShieldAlert
} from 'lucide-react';
import { RoleRecord, RoleType } from '../types';
import { getRoleAccessibleScreens, MENU_DEFINITIONS } from '../utils/rbac';

const DEFAULT_SYSTEM_ROLES: RoleRecord[] = [
  {
    id: 1,
    name: 'super_admin',
    display_name: 'Super Admin',
    description: 'Complete control over entire platform, billing, settings and audit logs',
    user_count: 1,
    is_system: true,
    permissions: MENU_DEFINITIONS.map(m => m.menuPermission)
  },
  {
    id: 2,
    name: 'admin',
    display_name: 'Admin',
    description: 'Business operations, team management, and global pipeline configuration',
    user_count: 1,
    is_system: true,
    permissions: MENU_DEFINITIONS.map(m => m.menuPermission)
  },
  {
    id: 3,
    name: 'sales_manager',
    display_name: 'Sales Manager',
    description: 'Leads distribution, sales pipeline monitoring, and performance reports',
    user_count: 1,
    is_system: true,
    permissions: [
      'menu.dashboard', 'menu.leads', 'menu.whatsapp', 'menu.followups', 
      'menu.customers', 'menu.pipeline', 'menu.quotations', 'menu.reports', 'menu.team'
    ]
  },
  {
    id: 4,
    name: 'sales_executive',
    display_name: 'Sales Executive',
    description: 'Assigned lead outreach, WhatsApp messaging, and quotation generation',
    user_count: 1,
    is_system: true,
    permissions: [
      'menu.dashboard', 'menu.leads', 'menu.whatsapp', 'menu.followups', 
      'menu.customers', 'menu.pipeline', 'menu.digital_profile', 'menu.quotations'
    ]
  },
  {
    id: 5,
    name: 'accounts',
    display_name: 'Accounts',
    description: 'Invoices, payments collection, tax reports, and client billing',
    user_count: 1,
    is_system: true,
    permissions: [
      'menu.dashboard', 'menu.customers', 'menu.quotations', 'menu.invoices', 'menu.billing', 'menu.reports'
    ]
  }
];

const SEED_USERS_BY_ROLE: Record<string, { name: string; email: string }> = {
  super_admin: { name: 'Aravind Swaminathan', email: 'admin@mythconnect.ai' },
  admin: { name: 'Priya Narayanan', email: 'priya.n@mythconnect.ai' },
  sales_manager: { name: 'Vikram Malhotra', email: 'vikram.m@mythconnect.ai' },
  sales_executive: { name: 'Sneha Kulkarni', email: 'sneha.k@mythconnect.ai' },
  accounts: { name: 'Rohan Deshmukh', email: 'rohan.d@mythconnect.ai' },
};

export const LoginScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { login, showSnackbar, roles: storeRoles, fetchRoles, users } = useAppStore();

  const [activeTab, setActiveTab] = useState<'role_based' | 'credentials'>('role_based');
  const [selectedRole, setSelectedRole] = useState<string>('super_admin');
  const [email, setEmail] = useState('admin@mythconnect.ai');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles().catch(() => {});
  }, [fetchRoles]);

  // Combine store roles with default system roles ensuring no missing roles
  const allRoles: RoleRecord[] = React.useMemo(() => {
    if (!storeRoles || storeRoles.length === 0) {
      return DEFAULT_SYSTEM_ROLES;
    }
    return storeRoles.map(sr => {
      const def = DEFAULT_SYSTEM_ROLES.find(d => d.name === sr.name);
      return {
        ...sr,
        permissions: (sr.permissions && sr.permissions.length > 0) ? sr.permissions : (def?.permissions || [])
      };
    });
  }, [storeRoles]);

  const getRoleUser = (roleName: string) => {
    const fromUsers = users.find(u => u.role === roleName);
    if (fromUsers) {
      return { name: fromUsers.name, email: fromUsers.email };
    }
    if (SEED_USERS_BY_ROLE[roleName]) {
      return SEED_USERS_BY_ROLE[roleName];
    }
    return { name: `${roleName.replace(/_/g, ' ')} User`, email: `${roleName}@mythconnect.ai` };
  };

  const getRoleIcon = (roleName: string) => {
    switch (roleName) {
      case 'super_admin':
        return <ShieldCheck size={20} color="#1565E8" />;
      case 'admin':
        return <Users size={20} color="#8B5CF6" />;
      case 'sales_manager':
        return <TrendingUp size={20} color="#0284C7" />;
      case 'sales_executive':
        return <MessageSquare size={20} color="#00A86B" />;
      case 'accounts':
        return <Receipt size={20} color="#D97706" />;
      default:
        return <UserCheck size={20} color="#6366F1" />;
    }
  };

  const getRoleThemeColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', badge: '#1565E8' };
      case 'admin': return { bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6', badge: '#8B5CF6' };
      case 'sales_manager': return { bg: '#F0F9FF', border: '#BAE6FD', text: '#0369A1', badge: '#0284C7' };
      case 'sales_executive': return { bg: '#F0FDF4', border: '#BBF7D0', text: '#15803D', badge: '#00A86B' };
      case 'accounts': return { bg: '#FFFBEB', border: '#FDE68A', text: '#B45309', badge: '#D97706' };
      default: return { bg: '#EEF2FF', border: '#C7D2FE', text: '#3730A3', badge: '#6366F1' };
    }
  };

  const handleRoleLogin = async (role: RoleRecord) => {
    setLoadingRole(role.name);
    const userInfo = getRoleUser(role.name);
    try {
      await login(userInfo.email, role.name);
      showSnackbar(`Logged in as ${role.display_name} • Role access applied`, 'success');
    } catch (e) {
      showSnackbar('Sign in failed. Please try again.', 'error');
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCredentialsLogin = async () => {
    setIsSubmitting(true);
    try {
      await login(email, selectedRole);
      const roleObj = allRoles.find(r => r.name === selectedRole);
      showSnackbar(`Welcome back! Logged in as ${roleObj?.display_name || 'User'}`, 'success');
    } catch (e) {
      showSnackbar('Login failed. Please verify credentials.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSelectRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    const userInfo = getRoleUser(roleName);
    setEmail(userInfo.email);
  };

  const selectedRoleObj = allRoles.find(r => r.name === selectedRole) || allRoles[0];
  const selectedRoleScreens = getRoleAccessibleScreens(selectedRoleObj);

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
              <View style={styles.heroPill}>
                <Shield size={14} color="#60A5FA" />
                <Text style={styles.heroPillText}>Role-Based Access Control (RBAC)</Text>
              </View>

              <Text style={styles.heroHeading}>
                Enterprise Sales & WhatsApp CRM with Granular User Roles
              </Text>
              
              <Text style={styles.heroSub}>
                Seamlessly control permissions, sidebar menu visibility, and operational access across your sales, leadership, and finance teams.
              </Text>

              <View style={styles.featureHighlights}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <ShieldCheck size={18} color="#60A5FA" />
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>Strict Menu & Screen Guards</Text>
                    <Text style={styles.featureDesc}>Each user role only views menus and actions they are explicitly permitted to access.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Zap size={18} color="#34D399" />
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>Instant Meta Ads Webhook Ingestion</Text>
                    <Text style={styles.featureDesc}>Sub-second lead capture from Facebook and Instagram lead forms directly into the CRM.</Text>
                  </View>
                </View>

                <View style={styles.featureItem}>
                  <View style={styles.featureIconBox}>
                    <Sparkles size={18} color="#FBBF24" />
                  </View>
                  <View>
                    <Text style={styles.featureTitle}>WhatsApp Cloud API Automation</Text>
                    <Text style={styles.featureDesc}>Pre-approved welcome templates, two-way chats, and automated lead cadences.</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.leftFooter}>
              <Text style={styles.corpFoot}>Myth Connect.ai Technologies • ISO 27001 Certified • Bank-Grade 256-bit SSL</Text>
            </View>
          </View>
        )}

        {/* Right Side: Role-Based Login Card */}
        <View style={styles.rightCardCol}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardBox}>
              {isMobile && (
                <View style={{ marginBottom: 20, alignItems: 'center' }}>
                  <BrandLogo size="md" showTagline />
                </View>
              )}

              <View style={styles.portalHeader}>
                <Text style={styles.cardTitle}>Enterprise Access Portal</Text>
                <Text style={styles.cardSubtitle}>
                  Choose your role to login with pre-configured menu permissions
                </Text>
              </View>

              {/* Segmented Tab Switcher */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'role_based' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('role_based')}
                  activeOpacity={0.8}
                >
                  <ShieldCheck size={15} color={activeTab === 'role_based' ? BrandColors.blue : BrandColors.textSecondary} />
                  <Text style={[styles.tabText, activeTab === 'role_based' && styles.tabTextActive]}>
                    Login by Role
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.tabBtn, activeTab === 'credentials' && styles.tabBtnActive]}
                  onPress={() => setActiveTab('credentials')}
                  activeOpacity={0.8}
                >
                  <KeyRound size={15} color={activeTab === 'credentials' ? BrandColors.blue : BrandColors.textSecondary} />
                  <Text style={[styles.tabText, activeTab === 'credentials' && styles.tabTextActive]}>
                    Credentials
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TAB 1: ROLE-BASED LOGIN */}
              {activeTab === 'role_based' && (
                <View style={styles.roleBasedContainer}>
                  <Text style={styles.sectionNotice}>
                    Select an enterprise role below to launch the dashboard with role-scoped menu visibility and permissions:
                  </Text>

                  <View style={styles.roleCardStack}>
                    {allRoles.map(role => {
                      const theme = getRoleThemeColor(role.name);
                      const userInfo = getRoleUser(role.name);
                      const accessibleScreens = getRoleAccessibleScreens(role);
                      const isLoggingThis = loadingRole === role.name;

                      return (
                        <TouchableOpacity
                          key={role.id || role.name}
                          style={[
                            styles.roleActionCard,
                            { borderColor: theme.border }
                          ]}
                          onPress={() => handleRoleLogin(role)}
                          activeOpacity={0.85}
                          disabled={isLoggingThis || !!loadingRole}
                        >
                          <View style={styles.roleCardTop}>
                            <View style={[styles.roleIconBox, { backgroundColor: theme.bg }]}>
                              {getRoleIcon(role.name)}
                            </View>

                            <View style={styles.roleMetaBox}>
                              <View style={styles.roleTitleRow}>
                                <Text style={styles.roleCardTitle}>{role.display_name}</Text>
                                <View style={[styles.roleBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                                  <Text style={[styles.roleBadgeText, { color: theme.text }]}>
                                    {role.is_system ? 'System Role' : 'Custom Role'}
                                  </Text>
                                </View>
                              </View>
                              <Text style={styles.roleCardDesc} numberOfLines={2}>
                                {role.description}
                              </Text>
                            </View>
                          </View>

                          {/* Member info & Menu Count */}
                          <View style={styles.roleCardMiddle}>
                            <View style={styles.userSnippet}>
                              <View style={[styles.miniAvatar, { backgroundColor: theme.badge }]}>
                                <Text style={styles.miniAvatarText}>
                                  {userInfo.name.charAt(0)}
                                </Text>
                              </View>
                              <View>
                                <Text style={styles.userNameText}>{userInfo.name}</Text>
                                <Text style={styles.userEmailText}>{userInfo.email}</Text>
                              </View>
                            </View>

                            <View style={styles.menuCountBadge}>
                              <Text style={styles.menuCountNumber}>{accessibleScreens.length}</Text>
                              <Text style={styles.menuCountLabel}>of 16 menus</Text>
                            </View>
                          </View>

                          {/* Accessible Menus Preview Chips */}
                          <View style={styles.accessibleMenusPreview}>
                            {accessibleScreens.slice(0, 5).map(screenKey => {
                              const menuDef = MENU_DEFINITIONS.find(m => m.key === screenKey);
                              return (
                                <View key={screenKey} style={styles.screenChip}>
                                  <Text style={styles.screenChipText}>
                                    {menuDef?.label || screenKey}
                                  </Text>
                                </View>
                              );
                            })}
                            {accessibleScreens.length > 5 && (
                              <View style={styles.screenChipMore}>
                                <Text style={styles.screenChipMoreText}>
                                  +{accessibleScreens.length - 5} more
                                </Text>
                              </View>
                            )}
                          </View>

                          {/* Action Button */}
                          <View style={[styles.cardLoginBtn, { backgroundColor: theme.badge }]}>
                            {isLoggingThis ? (
                              <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                              <>
                                <Text style={styles.cardLoginBtnText}>
                                  Sign In as {role.display_name}
                                </Text>
                                <ArrowRight size={15} color="#FFFFFF" />
                              </>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* TAB 2: CREDENTIALS LOGIN WITH ROLE SELECTION */}
              {activeTab === 'credentials' && (
                <View style={styles.credentialsContainer}>
                  {/* Role Context Selector */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Select Target Role</Text>
                    <View style={styles.rolePickerGrid}>
                      {allRoles.map(r => {
                        const isSelected = selectedRole === r.name;
                        const theme = getRoleThemeColor(r.name);
                        return (
                          <TouchableOpacity
                            key={r.name}
                            style={[
                              styles.rolePickerItem,
                              isSelected && { borderColor: theme.badge, backgroundColor: theme.bg }
                            ]}
                            onPress={() => onSelectRoleChange(r.name)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.rolePickerHeader}>
                              <Text style={[
                                styles.rolePickerName,
                                isSelected && { color: theme.badge, fontWeight: '700' }
                              ]}>
                                {r.display_name}
                              </Text>
                              {isSelected && <CheckCircle2 size={14} color={theme.badge} />}
                            </View>
                            <Text style={styles.rolePickerSub}>
                              {getRoleAccessibleScreens(r).length} menus active
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Corporate Email Address</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="name@mythconnect.ai"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Password</Text>
                      <TouchableOpacity onPress={() => showSnackbar('Demo credentials: Use Secret123!', 'info')}>
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

                  {/* Role Permissions Summary Box */}
                  <View style={styles.roleSummaryBox}>
                    <View style={styles.roleSummaryHeader}>
                      <Shield size={14} color={BrandColors.blue} />
                      <Text style={styles.roleSummaryTitle}>
                        Active Access: {selectedRoleObj.display_name}
                      </Text>
                    </View>
                    <Text style={styles.roleSummaryText}>
                      This session will be granted access to {selectedRoleScreens.length} sidebar menus: {' '}
                      <Text style={{ fontWeight: '600' }}>
                        {selectedRoleScreens.map(s => MENU_DEFINITIONS.find(m => m.key === s)?.label || s).join(', ')}
                      </Text>
                    </Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.signInBtn} 
                    onPress={handleCredentialsLogin} 
                    activeOpacity={0.8}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Text style={styles.signInBtnText}>
                          Sign In as {selectedRoleObj.display_name}
                        </Text>
                        <ArrowRight size={16} color="#FFFFFF" />
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* Quick Jump Pills for Fast Testing */}
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>QUICK ROLE SWITCHER (ONE-CLICK ACCESS)</Text>
                <View style={styles.roleGrid}>
                  {allRoles.map(r => (
                    <TouchableOpacity
                      key={r.name}
                      style={[
                        styles.rolePill,
                        selectedRole === r.name && styles.rolePillActive
                      ]}
                      onPress={() => handleRoleLogin(r)}
                    >
                      <Text style={[
                        styles.rolePillText,
                        selectedRole === r.name && styles.rolePillTextActive
                      ]}>
                        {r.display_name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>
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
    backgroundColor: '#F8FAFC',
  },
  leftBrandCol: {
    flex: 1.1,
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
    maxWidth: 520,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  heroPillText: {
    color: '#93C5FD',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  heroHeading: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: "'Outfit', 'Inter', sans-serif",
    lineHeight: 42,
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 14.5,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 23,
    marginBottom: 32,
  },
  featureHighlights: {
    gap: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12.5,
    lineHeight: 18,
    maxWidth: 420,
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
    flex: 1.3,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBox: {
    width: '100%',
    maxWidth: 580,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    borderColor: BrandColors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  portalHeader: {
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: BrandColors.darkNavy,
    fontFamily: "'Outfit', 'Inter', sans-serif",
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: BrandColors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: BrandColors.surfaceSubtle,
    borderRadius: 10,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: BrandColors.borderLight,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: BrandColors.textSecondary,
  },
  tabTextActive: {
    color: BrandColors.darkNavy,
    fontWeight: '700',
  },
  roleBasedContainer: {
    gap: 16,
  },
  sectionNotice: {
    fontSize: 12.5,
    color: BrandColors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  roleCardStack: {
    gap: 14,
  },
  roleActionCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  roleCardTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  roleIconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleMetaBox: {
    flex: 1,
  },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  roleCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.darkNavy,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  roleCardDesc: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    lineHeight: 16,
  },
  roleCardMiddle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  userSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  userNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  userEmailText: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
  },
  menuCountBadge: {
    alignItems: 'flex-end',
  },
  menuCountNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: BrandColors.darkNavy,
  },
  menuCountLabel: {
    fontSize: 10,
    color: BrandColors.textMuted,
  },
  accessibleMenusPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  screenChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  screenChipText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '500',
  },
  screenChipMore: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  screenChipMoreText: {
    fontSize: 10.5,
    color: '#334155',
    fontWeight: '600',
  },
  cardLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 6,
  },
  cardLoginBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  credentialsContainer: {
    gap: 16,
  },
  rolePickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  rolePickerItem: {
    flex: 1,
    minWidth: 140,
    borderWidth: 1.5,
    borderColor: BrandColors.border,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  rolePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rolePickerName: {
    fontSize: 12.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  rolePickerSub: {
    fontSize: 10.5,
    color: BrandColors.textMuted,
    marginTop: 3,
  },
  formGroup: {
    marginBottom: 4,
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
  roleSummaryBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  roleSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleSummaryTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0369A1',
  },
  roleSummaryText: {
    fontSize: 11.5,
    color: '#0C4A6E',
    lineHeight: 16,
  },
  signInBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.blue,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  signInBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  demoSection: {
    marginTop: 28,
    paddingTop: 18,
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
  rolePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: BrandColors.blue,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  rolePillTextActive: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
});
