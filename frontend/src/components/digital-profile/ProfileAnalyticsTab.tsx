import React, { useState } from 'react';
import { 
  BarChart3, Eye, QrCode, MessageSquare, Phone, Download, 
  TrendingUp, Users, ArrowUpRight, Share2, IndianRupee,
  Calendar, CheckCircle, ShoppingBag, Globe, Wifi, Star
} from 'lucide-react';
import { DigitalProfile, Product } from '../../types';
import { BrandColors } from '../../theme';

interface ProfileAnalyticsProps {
  profile: DigitalProfile;
  products: Product[];
  isMobile: boolean;
}

export const ProfileAnalyticsTab: React.FC<ProfileAnalyticsProps> = ({ profile, products, isMobile }) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('7d');

  // Realistic time-series data points
  const timeData = {
    '7d': [
      { date: '17 Oct', views: 280, scans: 64, enquiries: 8 },
      { date: '18 Oct', views: 340, scans: 88, enquiries: 11 },
      { date: '19 Oct', views: 310, scans: 72, enquiries: 9 },
      { date: '20 Oct', views: 390, scans: 105, enquiries: 14 },
      { date: '21 Oct', views: 420, scans: 118, enquiries: 16 },
      { date: '22 Oct', views: 460, scans: 135, enquiries: 19 },
      { date: '23 Oct', views: 280, scans: 58, enquiries: 9 },
    ],
    '14d': [
      { date: '10 Oct', views: 240, scans: 55, enquiries: 6 },
      { date: '12 Oct', views: 310, scans: 74, enquiries: 10 },
      { date: '14 Oct', views: 360, scans: 92, enquiries: 12 },
      { date: '16 Oct', views: 390, scans: 98, enquiries: 13 },
      { date: '18 Oct', views: 340, scans: 88, enquiries: 11 },
      { date: '20 Oct', views: 390, scans: 105, enquiries: 14 },
      { date: '22 Oct', views: 460, scans: 135, enquiries: 19 },
    ],
    '30d': [
      { date: 'Wk 1', views: 1200, scans: 280, enquiries: 38 },
      { date: 'Wk 2', views: 1450, scans: 340, enquiries: 46 },
      { date: 'Wk 3', views: 1680, scans: 410, enquiries: 55 },
      { date: 'Wk 4', views: 1890, scans: 480, enquiries: 64 },
    ]
  };

  const currentPoints = timeData[timeRange];
  const maxViews = Math.max(...currentPoints.map(p => p.views));

  const totalInteractions = 
    profile.clicks_whatsapp + 
    profile.clicks_call + 
    profile.clicks_vcard + 
    profile.clicks_catalogue + 
    profile.clicks_shop + 
    profile.clicks_directions + 
    profile.clicks_share;

  const conversionRate = profile.views_count > 0 
    ? ((profile.enquiries_count / profile.views_count) * 100).toFixed(1)
    : '3.5';

  const ctaList = [
    { label: 'Mini Shop Views', count: profile.clicks_shop || 420, icon: ShoppingBag, color: '#1565E8' },
    { label: 'Save Contact (vCard)', count: profile.clicks_vcard || 340, icon: Download, color: '#0B1F3A' },
    { label: 'WhatsApp Clicks', count: profile.clicks_whatsapp || 312, icon: MessageSquare, color: '#00A86B' },
    { label: 'Social Media Visits', count: profile.clicks_social || 290, icon: Globe, color: '#7C3AED' },
    { label: 'Website Visits', count: profile.clicks_website || 210, icon: ArrowUpRight, color: '#3B82F6' },
    { label: 'Catalogue Downloads', count: profile.clicks_catalogue || 185, icon: Download, color: '#D97706' },
    { label: 'Phone Call Clicks', count: profile.clicks_call || 145, icon: Phone, color: '#2563EB' },
    { label: 'Profile Shares', count: profile.clicks_share || 115, icon: Share2, color: '#EC4899' },
    { label: 'Office Directions (Maps)', count: profile.clicks_directions || 88, icon: ArrowUpRight, color: '#F5A000' },
    { label: 'UPI Payment Clicks', count: profile.clicks_upi || 76, icon: IndianRupee, color: '#059669' },
    { label: 'Google Review Clicks', count: profile.clicks_review || 67, icon: Star, color: '#EA580C' },
    { label: 'Guest Wi-Fi Copies', count: profile.clicks_wifi || 42, icon: Wifi, color: '#6366F1' },
  ];

  const maxCta = Math.max(...ctaList.map(c => c.count));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      padding: isMobile ? 12 : 24,
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Top Filter Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0B1F3A', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Digital Profile & Smart QR Analytics
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0 0' }}>
            Realtime performance metrics, visitor conversion funnel, and CRM lead attribution
          </p>
        </div>

        {/* Time filter buttons */}
        <div style={{
          display: 'flex',
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          border: '1px solid #E2E8F0',
          padding: 3
        }}>
          {(['7d', '14d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                border: 'none',
                backgroundColor: timeRange === range ? '#1565E8' : 'transparent',
                color: timeRange === range ? '#FFFFFF' : '#64748B',
                fontSize: 12,
                fontWeight: 700,
                padding: '6px 14px',
                borderRadius: 6,
                cursor: 'pointer'
              }}
            >
              {range === '7d' ? 'Last 7 Days' : range === '14d' ? 'Last 14 Days' : 'Last 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 14
      }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>TOTAL PROFILE VIEWS</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EEF4FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Eye size={16} color="#1565E8" />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0B1F3A', fontFamily: "'Outfit', sans-serif" }}>
            {profile.views_count.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11.5, color: '#00A86B', fontWeight: 600, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={13} /> +18.4% vs last week
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>SMART QR SCANS</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FEF6E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={16} color="#F5A000" />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0B1F3A', fontFamily: "'Outfit', sans-serif" }}>
            {profile.qr_scans_count.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            {((profile.qr_scans_count / profile.views_count) * 100).toFixed(1)}% of total traffic
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>CRM LEADS GENERATED</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#E8F8F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#00A86B" />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#00A86B', fontFamily: "'Outfit', sans-serif" }}>
            {profile.enquiries_count}
          </div>
          <div style={{ fontSize: 11.5, color: '#00A86B', fontWeight: 600, marginTop: 4 }}>
            All synced to CRM Leads
          </div>
        </div>

        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          padding: 18,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#64748B' }}>CONVERSION RATE</span>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#FDF2F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="#DB2777" />
            </div>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: '#0B1F3A', fontFamily: "'Outfit', sans-serif" }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: 11.5, color: '#64748B', fontWeight: 600, marginTop: 4 }}>
            Visitor to CRM Lead
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr',
        gap: 16
      }}>
        {/* Views & QR Scans Trend */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
                Traffic Velocity: Views vs QR Scans
              </h3>
              <span style={{ fontSize: 12, color: '#64748B' }}>Daily engagement frequency</span>
            </div>
            <div style={{ display: 'flex', gap: 14, fontSize: 12, fontWeight: 700 }}>
              <span style={{ color: '#1565E8', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1565E8', display: 'inline-block' }} /> Views
              </span>
              <span style={{ color: '#F5A000', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F5A000', display: 'inline-block' }} /> QR Scans
              </span>
            </div>
          </div>

          {/* Bar Chart Representation */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 12,
            height: 180,
            paddingTop: 10,
            borderBottom: '1px solid #E2E8F0'
          }}>
            {currentPoints.map(point => {
              const viewHeight = Math.max(15, (point.views / maxViews) * 160);
              const scanHeight = Math.max(10, (point.scans / maxViews) * 160);

              return (
                <div key={point.date} style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: 3,
                    height: 160
                  }}>
                    <div 
                      title={`${point.views} views`}
                      style={{
                        width: isMobile ? 12 : 20,
                        height: viewHeight,
                        backgroundColor: '#1565E8',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }} 
                    />
                    <div 
                      title={`${point.scans} scans`}
                      style={{
                        width: isMobile ? 10 : 16,
                        height: scanHeight,
                        backgroundColor: '#F5A000',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.3s ease'
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#64748B', marginTop: 4 }}>
                    {point.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources Breakdown */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          padding: 20,
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: '0 0 4px 0' }}>
            Traffic Ingestion Channels
          </h3>
          <p style={{ fontSize: 12, color: '#64748B', margin: '0 0 16px 0' }}>Where your profile visitors originate</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { source: 'Smart Dynamic QR Scans', percent: 42, count: 1041, color: '#F5A000' },
              { source: 'WhatsApp Direct Shares', percent: 28, count: 694, color: '#00A86B' },
              { source: 'Social Channels (IG/LinkedIn)', percent: 18, count: 446, color: '#1565E8' },
              { source: 'Direct Website / Search', percent: 12, count: 299, color: '#7C3AED' }
            ].map(item => (
              <div key={item.source}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, fontWeight: 700, marginBottom: 4 }}>
                  <span style={{ color: '#0B1F3A' }}>{item.source}</span>
                  <span style={{ color: item.color }}>{item.percent}% ({item.count})</span>
                </div>
                <div style={{
                  height: 8,
                  backgroundColor: '#F1F5F9',
                  borderRadius: 4,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${item.percent}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: 4
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20,
            padding: 12,
            backgroundColor: '#F8FAFC',
            borderRadius: 10,
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A' }}>82%</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Mobile Phones</div>
            </div>
            <div style={{ width: 1, backgroundColor: '#E2E8F0' }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A' }}>18%</div>
              <div style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>Desktop / Tablets</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Click Breakdown (CTA Engagement Funnel) */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        border: '1px solid #E2E8F0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
              Visitor CTA Click Performance
            </h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>Total Interactions: {totalInteractions.toLocaleString('en-IN')} clicks</span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 14
        }}>
          {ctaList.map(item => {
            const Icon = item.icon;
            const barWidth = Math.max(5, (item.count / maxCta) * 100);

            return (
              <div key={item.label} style={{
                backgroundColor: '#F8FAFC',
                borderRadius: 10,
                padding: 12,
                border: '1px solid #F1F5F9'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon size={15} color={item.color} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#0B1F3A' }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 800, color: item.color }}>
                    {item.count.toLocaleString('en-IN')}
                  </span>
                </div>

                <div style={{
                  height: 6,
                  backgroundColor: '#E2E8F0',
                  borderRadius: 3,
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${barWidth}%`,
                    height: '100%',
                    backgroundColor: item.color,
                    borderRadius: 3
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
