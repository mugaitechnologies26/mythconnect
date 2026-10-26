import React, { useState, useEffect } from 'react';
import { View, StyleSheet, useWindowDimensions, Modal, ScrollView, TouchableOpacity, Text } from 'react-native';
import { PaperProvider, Snackbar } from 'react-native-paper';
import { AppTheme, BrandColors } from './theme';
import { useAppStore, ScreenType } from './store/useAppStore';
import { realtimeSocket } from './services/socket';

// Components
import { AppSidebar } from './components/AppSidebar';
import { AppHeader } from './components/AppHeader';
import { MobileNavigation } from './components/MobileNavigation';
import { CommandPalette } from './components/CommandPalette';
import { MetaSimulationModal } from './components/MetaSimulationModal';
import { BrandLogo } from './components/BrandLogo';

// Screens
import { LoginScreen } from './screens/LoginScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LeadsScreen } from './screens/LeadsScreen';
import { LeadDetailScreen } from './screens/LeadDetailScreen';
import { WhatsAppCRMScreen } from './screens/WhatsAppCRMScreen';
import { FollowupsScreen } from './screens/FollowupsScreen';
import { PipelineScreen } from './screens/PipelineScreen';
import { CustomersScreen } from './screens/CustomersScreen';
import { QuotationsScreen } from './screens/QuotationsScreen';
import { InvoicesScreen } from './screens/InvoicesScreen';
import { BillingScreen } from './screens/BillingScreen';
import { QRGeneratorScreen } from './screens/QRGeneratorScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { TeamScreen } from './screens/TeamScreen';
import { IntegrationsScreen } from './screens/IntegrationsScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { DigitalProfileScreen } from './screens/DigitalProfileScreen';
import { PublicProfilePage } from './components/digital-profile/PublicProfilePage';

import { X, ChevronRight, LogOut } from 'lucide-react';

export const App: React.FC = () => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  const { 
    isAuthenticated, 
    activeScreen, 
    setActiveScreen,
    isMobileDrawerOpen, 
    setMobileDrawerOpen,
    activeSnackbar, 
    hideSnackbar,
    currentUser,
    logout,
    digitalProfile,
    products,
    trackProfileEvent,
    submitProfileEnquiry,
    fetchInitialData
  } = useAppStore();

  // Load database datasets & Connect to Realtime WebSocket Engine on load
  useEffect(() => {
    fetchInitialData();
    realtimeSocket.connect();
    return () => realtimeSocket.disconnect();
  }, [fetchInitialData]);

  // Check if current browser URL is a public profile or QR route
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isPublicProfileRoute = currentPath.startsWith('/p/');
  const isQrRoute = currentPath.startsWith('/qr/');

  // Track QR scan on first arrival at /qr/:qrId
  useEffect(() => {
    if (isQrRoute) {
      const qrId = currentPath.replace('/qr/', '').replace(/\/$/, '');
      trackProfileEvent('qr_scan', qrId);
    } else if (isPublicProfileRoute) {
      trackProfileEvent('view', digitalProfile.slug);
    }
  }, [isQrRoute, isPublicProfileRoute]);

  // Public standalone view without CRM login required
  if (isPublicProfileRoute || isQrRoute) {
    return (
      <PaperProvider theme={AppTheme}>
        <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', width: '100%' }}>
          <PublicProfilePage
            profile={digitalProfile}
            products={products}
            onTrackEvent={trackProfileEvent}
            onSubmitEnquiry={submitProfileEnquiry}
            isPreview={false}
          />
        </div>
      </PaperProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <PaperProvider theme={AppTheme}>
        <LoginScreen isMobile={isMobile} />
      </PaperProvider>
    );
  }

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'dashboard': return <DashboardScreen isMobile={isMobile} />;
      case 'leads': return <LeadsScreen isMobile={isMobile} />;
      case 'lead_detail': return <LeadDetailScreen isMobile={isMobile} />;
      case 'whatsapp': return <WhatsAppCRMScreen isMobile={isMobile} />;
      case 'followups': return <FollowupsScreen isMobile={isMobile} />;
      case 'pipeline': return <PipelineScreen isMobile={isMobile} />;
      case 'customers': return <CustomersScreen isMobile={isMobile} />;
      case 'digital_profile': return <DigitalProfileScreen isMobile={isMobile} />;
      case 'quotations': return <QuotationsScreen isMobile={isMobile} />;
      case 'invoices': return <InvoicesScreen isMobile={isMobile} />;
      case 'billing': return <BillingScreen isMobile={isMobile} />;
      case 'qr': return <QRGeneratorScreen isMobile={isMobile} />;
      case 'reports': return <ReportsScreen isMobile={isMobile} />;
      case 'team': return <TeamScreen isMobile={isMobile} />;
      case 'integrations': return <IntegrationsScreen isMobile={isMobile} />;
      case 'settings': return <SettingsScreen isMobile={isMobile} />;
      default: return <DashboardScreen isMobile={isMobile} />;
    }
  };

  const drawerNav: { key: ScreenType; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'leads', label: 'Leads & Enquiries' },
    { key: 'whatsapp', label: 'WhatsApp Live CRM' },
    { key: 'followups', label: 'Scheduled Follow-ups' },
    { key: 'customers', label: 'Customer Accounts' },
    { key: 'pipeline', label: 'Sales Pipeline (Kanban)' },
    { key: 'digital_profile', label: 'Digital Profile & Shop' },
    { key: 'quotations', label: 'Quotations & Proposals' },
    { key: 'invoices', label: 'Invoices & Billing' },
    { key: 'billing', label: 'Payment Ledger' },
    { key: 'qr', label: 'Dynamic QR Generator' },
    { key: 'reports', label: 'Analytics & Reports' },
    { key: 'team', label: 'Team & RBAC Roles' },
    { key: 'integrations', label: 'Meta & WhatsApp Integrations' },
    { key: 'settings', label: 'Company Settings' },
  ];

  return (
    <PaperProvider theme={AppTheme}>
      <View style={styles.appContainer}>
        {/* Desktop / Laptop / Tablet Sidebar */}
        {!isMobile && <AppSidebar />}

        {/* Main Content Area */}
        <View style={styles.mainWrapper}>
          <AppHeader isMobile={isMobile} />
          
          <View style={styles.screenWrapper}>
            {renderActiveScreen()}
          </View>

          {/* Bottom Navigation for Mobile Devices */}
          {isMobile && <MobileNavigation />}
        </View>

        {/* Global Search Palette (Ctrl+K) */}
        <CommandPalette />

        {/* Live Meta Lead Ingestion & WhatsApp Simulator */}
        <MetaSimulationModal />

        {/* Mobile Navigation Drawer Modal */}
        {isMobile && (
          <Modal visible={isMobileDrawerOpen} transparent animationType="slide">
            <View style={styles.drawerOverlay}>
              <View style={styles.drawerContent}>
                <View style={styles.drawerHeader}>
                  <BrandLogo size="sm" showTagline={false} />
                  <TouchableOpacity onPress={() => setMobileDrawerOpen(false)}>
                    <X size={22} color={BrandColors.darkNavy} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.drawerScroll}>
                  {drawerNav.map(item => (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.drawerItem,
                        activeScreen === item.key && styles.drawerItemActive
                      ]}
                      onPress={() => setActiveScreen(item.key)}
                    >
                      <Text style={[
                        styles.drawerLabel,
                        activeScreen === item.key && styles.drawerLabelActive
                      ]}>
                        {item.label}
                      </Text>
                      <ChevronRight size={16} color={BrandColors.textMuted} />
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.drawerFooter}>
                  <View style={styles.drawerUser}>
                    <Text style={styles.drawerUserName}>{currentUser?.name}</Text>
                    <Text style={styles.drawerUserRole}>{currentUser?.role_display}</Text>
                  </View>
                  <TouchableOpacity onPress={logout} style={styles.drawerLogout}>
                    <LogOut size={18} color={BrandColors.red} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* Toast / Snackbar */}
        <Snackbar
          visible={activeSnackbar.visible}
          onDismiss={hideSnackbar}
          duration={3500}
          style={{
            backgroundColor: 
              activeSnackbar.type === 'success' ? BrandColors.green :
              activeSnackbar.type === 'error' ? BrandColors.red : BrandColors.darkNavy
          }}
        >
          {activeSnackbar.message}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    flexDirection: 'row',
    height: '100%',
    width: '100%',
    backgroundColor: BrandColors.bg,
    overflow: 'hidden',
  },
  mainWrapper: {
    flex: 1,
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  screenWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 58, 0.5)',
    justifyContent: 'flex-start',
  },
  drawerContent: {
    width: 290,
    height: '100%',
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
  },
  drawerHeader: {
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  drawerScroll: {
    flex: 1,
    padding: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  drawerItemActive: {
    backgroundColor: BrandColors.blueLight,
  },
  drawerLabel: {
    fontSize: 13.5,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  drawerLabelActive: {
    color: BrandColors.blue,
    fontWeight: '700',
  },
  drawerFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: BrandColors.borderLight,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAFCFE',
  },
  drawerUser: {
    flex: 1,
  },
  drawerUserName: {
    fontSize: 13,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  drawerUserRole: {
    fontSize: 11,
    color: BrandColors.textSecondary,
  },
  drawerLogout: {
    padding: 8,
  },
});
