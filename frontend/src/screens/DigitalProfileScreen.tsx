import React, { useState } from 'react';
import { 
  Contact, Sparkles, QrCode, Globe, Eye, Users, 
  Share2, Copy, Download, ExternalLink, Edit3, CheckCircle, 
  AlertCircle, BarChart3, ShoppingBag, ArrowUpRight, Check,
  Layers, ArrowRight, ShieldCheck, Clock
} from 'lucide-react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import { useAppStore } from '../store/useAppStore';
import { BrandColors } from '../theme';
import { ProfileBuilder } from '../components/digital-profile/ProfileBuilder';
import { ProfileAnalyticsTab } from '../components/digital-profile/ProfileAnalyticsTab';
import { PublicProfilePage } from '../components/digital-profile/PublicProfilePage';

type TabKey = 'dashboard' | 'builder' | 'analytics';

export const DigitalProfileScreen: React.FC<{ isMobile: boolean }> = ({ isMobile }) => {
  const { 
    digitalProfile, 
    products, 
    updateDigitalProfile, 
    publishDigitalProfile, 
    unpublishDigitalProfile,
    showSnackbar,
    setActiveScreen,
    submitProfileEnquiry,
    trackProfileEvent
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [copiedLink, setCopiedLink] = useState(false);
  const [fullPreviewModal, setFullPreviewModal] = useState(false);

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/p/${digitalProfile.slug}` 
    : `http://localhost:3000/p/${digitalProfile.slug}`;

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/qr/${digitalProfile.smart_qr_id}`
    : `http://localhost:3000/qr/${digitalProfile.smart_qr_id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedLink(true);
    showSnackbar('Public Profile URL copied to clipboard!', 'info');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleTogglePublish = () => {
    if (digitalProfile.status === 'published') {
      unpublishDigitalProfile();
      showSnackbar('Digital profile unpublished. Public visitors will see unavailable page.', 'info');
    } else {
      publishDigitalProfile();
      showSnackbar('Digital profile published and live to the world!', 'success');
    }
  };

  const handleDownloadQrPng = () => {
    const canvas = document.getElementById('digital-profile-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `${digitalProfile.slug}_smart_qr.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      showSnackbar('Smart QR Code (PNG) downloaded successfully!', 'success');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      backgroundColor: BrandColors.bg,
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Hidden high-res canvas for downloading smart QR */}
      <div style={{ display: 'none' }}>
        <QRCodeCanvas
          id="digital-profile-qr-canvas"
          value={qrUrl}
          size={512}
          level="H"
          fgColor="#0B1F3A"
          bgColor="#FFFFFF"
          includeMargin
        />
      </div>

      {/* 1. TOP HEADER & NAVIGATION TABS */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderBottom: `1px solid ${BrandColors.border}`,
        padding: isMobile ? '16px 16px 0' : '20px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: BrandColors.blueLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Contact size={18} color={BrandColors.blue} />
              </div>
              <h1 style={{
                fontSize: 20,
                fontWeight: 800,
                color: BrandColors.darkNavy,
                margin: 0,
                fontFamily: "'Outfit', 'Inter', sans-serif"
              }}>
                Smart Digital Profile & Dynamic QR
              </h1>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                backgroundColor: digitalProfile.status === 'published' ? BrandColors.greenLight : '#FEECEE',
                color: digitalProfile.status === 'published' ? BrandColors.green : BrandColors.red,
                padding: '3px 8px',
                borderRadius: 12
              }}>
                {digitalProfile.status.toUpperCase()}
              </span>
            </div>
            <p style={{ fontSize: 13, color: BrandColors.textSecondary, margin: '4px 0 0 0' }}>
              Connected Digital Business Card, Live Mini Shop, Smart QR & CRM Ingestion
            </p>
          </div>

          {/* Quick Primary Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={handleCopyLink}
              style={{
                backgroundColor: copiedLink ? BrandColors.greenLight : '#FFFFFF',
                color: copiedLink ? BrandColors.green : BrandColors.darkNavy,
                border: `1px solid ${BrandColors.border}`,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {copiedLink ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedLink ? 'Copied' : 'Copy Public Link'}</span>
            </button>

            <button
              onClick={() => setFullPreviewModal(true)}
              style={{
                backgroundColor: '#FFFFFF',
                color: BrandColors.blue,
                border: `1px solid ${BrandColors.border}`,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <Eye size={14} />
              <span>Full Preview</span>
            </button>

            <button
              onClick={handleTogglePublish}
              style={{
                backgroundColor: digitalProfile.status === 'published' ? BrandColors.red : BrandColors.green,
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 12.5,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              {digitalProfile.status === 'published' ? 'Unpublish' : 'Publish Live'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 24 }}>
          {[
            { key: 'dashboard', label: 'Dashboard & Overview', icon: Globe },
            { key: 'builder', label: 'Profile Builder & Editor', icon: Edit3 },
            { key: 'analytics', label: 'Analytics & Conversions', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 2px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `3px solid ${BrandColors.blue}` : '3px solid transparent',
                  color: isActive ? BrandColors.blue : BrandColors.textSecondary,
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  marginBottom: -1
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. BODY CONTENT AREA */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'dashboard' && (
          <div style={{ padding: isMobile ? 14 : 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Profile Overview Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${BrandColors.border}`,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              justifyContent: 'space-between',
              alignItems: isMobile ? 'flex-start' : 'center',
              gap: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>
              {/* Profile Details */}
              <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                <img 
                  src={digitalProfile.profile_photo_url || digitalProfile.business_logo_url} 
                  alt={digitalProfile.business_name}
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: `3px solid ${BrandColors.blueLight}`
                  }}
                />

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: BrandColors.darkNavy, margin: 0 }}>
                      {digitalProfile.business_name}
                    </h2>
                    <span style={{
                      fontSize: 11,
                      fontWeight: 700,
                      backgroundColor: digitalProfile.status === 'published' ? BrandColors.greenLight : '#FEECEE',
                      color: digitalProfile.status === 'published' ? BrandColors.green : BrandColors.red,
                      padding: '2px 8px',
                      borderRadius: 10
                    }}>
                      {digitalProfile.status === 'published' ? 'Live & Active' : 'Draft / Unpublished'}
                    </span>
                  </div>

                  <p style={{ fontSize: 13, color: BrandColors.textSecondary, margin: '4px 0 8px 0' }}>
                    {digitalProfile.person_name} • {digitalProfile.designation} ({digitalProfile.business_category})
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: BrandColors.blue }}>
                    <Globe size={14} />
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: BrandColors.blue, fontWeight: 700, textDecoration: 'none' }}
                    >
                      {publicUrl}
                    </a>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('builder')}
                  style={{
                    backgroundColor: BrandColors.blue,
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <Edit3 size={15} /> Edit Profile
                </button>

                <button
                  onClick={() => setActiveScreen('qr')}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: BrandColors.darkNavy,
                    border: `1px solid ${BrandColors.border}`,
                    padding: '10px 18px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  <QrCode size={15} /> QR Manager
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 14
            }}>
              <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, border: `1px solid ${BrandColors.border}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: BrandColors.textMuted }}>TOTAL VIEWS</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: BrandColors.darkNavy, marginTop: 4 }}>
                  {digitalProfile.views_count.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: BrandColors.green, marginTop: 4, fontWeight: 600 }}>
                  Active visitor traffic
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, border: `1px solid ${BrandColors.border}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: BrandColors.textMuted }}>SMART QR SCANS</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: BrandColors.darkNavy, marginTop: 4 }}>
                  {digitalProfile.qr_scans_count.toLocaleString('en-IN')}
                </div>
                <div style={{ fontSize: 11, color: BrandColors.blue, marginTop: 4, fontWeight: 600 }}>
                  Physical & exhibition scans
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, border: `1px solid ${BrandColors.border}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: BrandColors.textMuted }}>CRM ENQUIRIES</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: BrandColors.green, marginTop: 4 }}>
                  {digitalProfile.enquiries_count}
                </div>
                <div style={{ fontSize: 11, color: BrandColors.green, marginTop: 4, fontWeight: 600 }}>
                  Captured directly in Leads
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, border: `1px solid ${BrandColors.border}` }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: BrandColors.textMuted }}>CONVERSION RATE</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: BrandColors.darkNavy, marginTop: 4 }}>
                  {((digitalProfile.enquiries_count / digitalProfile.views_count) * 100).toFixed(1)}%
                </div>
                <div style={{ fontSize: 11, color: BrandColors.textSecondary, marginTop: 4, fontWeight: 600 }}>
                  High-converting digital card
                </div>
              </div>
            </div>

            {/* Smart QR Code Showcase Card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 24,
              border: `1px solid ${BrandColors.border}`,
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              gap: 24
            }}>
              {/* Dynamic QR Code Vector Preview */}
              <div style={{
                backgroundColor: '#FAFCFE',
                padding: 16,
                borderRadius: 14,
                border: `1px solid ${BrandColors.border}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
              }}>
                <QRCodeSVG
                  value={qrUrl}
                  size={180}
                  level="H"
                  fgColor="#0B1F3A"
                  bgColor="#FFFFFF"
                  includeMargin
                />
                <span style={{ fontSize: 11, fontWeight: 800, color: BrandColors.textMuted, marginTop: 8 }}>
                  {digitalProfile.smart_qr_id}
                </span>
              </div>

              {/* QR Details & Action Buttons */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: BrandColors.blueLight,
                  color: BrandColors.blue,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 700,
                  width: 'fit-content'
                }}>
                  <Sparkles size={13} /> DYNAMIC SMART REDIRECTION
                </div>

                <h3 style={{ fontSize: 17, fontWeight: 800, color: BrandColors.darkNavy, margin: 0 }}>
                  Printable Dynamic Smart QR
                </h3>

                <p style={{ fontSize: 13, lineHeight: 1.6, color: BrandColors.textSecondary, margin: 0 }}>
                  Your Smart QR dynamically points to <strong>{qrUrl}</strong>. If you update your phone number, business address, or products, the printed QR code remains unchanged and continues working seamlessly!
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 8 }}>
                  <button
                    onClick={handleDownloadQrPng}
                    style={{
                      backgroundColor: BrandColors.blue,
                      color: '#FFFFFF',
                      border: 'none',
                      padding: '9px 16px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Download size={14} /> Download High-Res PNG
                  </button>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(qrUrl);
                      showSnackbar('Smart QR dynamic URL copied!', 'info');
                    }}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: BrandColors.darkNavy,
                      border: `1px solid ${BrandColors.border}`,
                      padding: '9px 16px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6
                    }}
                  >
                    <Copy size={14} /> Copy QR URL
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'builder' && (
          <ProfileBuilder
            profile={digitalProfile}
            products={products}
            onUpdateProfile={updateDigitalProfile}
            onPublish={publishDigitalProfile}
            isMobile={isMobile}
          />
        )}

        {activeTab === 'analytics' && (
          <ProfileAnalyticsTab
            profile={digitalProfile}
            products={products}
            isMobile={isMobile}
          />
        )}
      </div>

      {/* FULL PREVIEW MODAL */}
      {fullPreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 31, 58, 0.75)',
          backdropFilter: 'blur(5px)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}>
          <div style={{
            width: '100%',
            maxWidth: 440,
            height: '92vh',
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            <div style={{
              height: 48,
              padding: '0 16px',
              backgroundColor: BrandColors.darkNavy,
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Full Screen Profile Preview</span>
              <button
                onClick={() => setFullPreviewModal(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#FFFFFF',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              <PublicProfilePage
                profile={digitalProfile}
                products={products}
                onTrackEvent={trackProfileEvent}
                onSubmitEnquiry={submitProfileEnquiry}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
