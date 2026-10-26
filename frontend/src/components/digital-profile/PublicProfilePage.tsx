import React, { useState, useMemo } from 'react';
import { 
  Phone, MessageSquare, Mail, Globe, MapPin, Share2, 
  Download, Star, CheckCircle, ExternalLink, Copy, Check,
  Clock, Shield, Wifi, ShoppingBag, Eye, Calendar,
  Award, ChevronRight, X, ArrowUpRight, Sparkles, AlertCircle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DigitalProfile, Product, ProfileOffer, ProfileService, ProfileCatalogue, ProfilePortfolioItem } from '../../types';
import { downloadVCard } from '../../utils/vcard';
import { BrandColors } from '../../theme';

interface PublicProfileProps {
  profile: DigitalProfile;
  products: Product[];
  onTrackEvent?: (eventType: any, targetId?: string) => void;
  onSubmitEnquiry?: (data: { name: string; phone: string; email?: string; message: string; productId?: number; quantity?: number; source?: string }) => void;
  isPreview?: boolean;
}

export const PublicProfilePage: React.FC<PublicProfileProps> = ({
  profile,
  products,
  onTrackEvent,
  onSubmitEnquiry,
  isPreview = false
}) => {
  // Active product category filter
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [productSearch, setProductSearch] = useState<string>('');
  
  // Selected product for detail modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Enquiry modal state
  const [enquiryModalOpen, setEnquiryModalOpen] = useState<boolean>(false);
  const [enquiryProduct, setEnquiryProduct] = useState<Product | null>(null);
  const [enquiryName, setEnquiryName] = useState<string>('');
  const [enquiryPhone, setEnquiryPhone] = useState<string>('');
  const [enquiryEmail, setEnquiryEmail] = useState<string>('');
  const [enquiryMessage, setEnquiryMessage] = useState<string>('');
  const [enquiryQuantity, setEnquiryQuantity] = useState<number>(1);
  const [enquirySuccess, setEnquirySuccess] = useState<boolean>(false);
  
  // Copied states for feedback
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [copiedWifi, setCopiedWifi] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  
  // Selected portfolio item for lightbox
  const [selectedPortfolio, setSelectedPortfolio] = useState<ProfilePortfolioItem | null>(null);

  // Compute Open / Closed status dynamically from current day & time
  const openStatus = useMemo(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const currentDayName = days[now.getDay()];
    const todayHours = profile.business_hours.find(h => h.day.toLowerCase() === currentDayName.toLowerCase());

    if (!todayHours || todayHours.is_closed) {
      return { isOpen: false, text: 'Closed Today', subtext: 'Check business hours for schedule' };
    }

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;

    if (currentTimeStr >= todayHours.open_time && currentTimeStr <= todayHours.close_time) {
      return { 
        isOpen: true, 
        text: 'Open Now', 
        subtext: `Closes at ${formatTime(todayHours.close_time)}` 
      };
    } else {
      return { 
        isOpen: false, 
        text: 'Currently Closed', 
        subtext: `Opens at ${formatTime(todayHours.open_time)}` 
      };
    }
  }, [profile.business_hours]);

  function formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  }

  // Filtered Shop Products
  const shopProducts = useMemo(() => {
    const featured = products.filter(p => profile.product_ids?.includes(p.id) && p.is_active);
    return featured.filter(p => {
      const matchCat = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchSearch = !productSearch || p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.description.toLowerCase().includes(productSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, profile.product_ids, activeCategory, productSearch]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.filter(p => profile.product_ids?.includes(p.id)).forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products, profile.product_ids]);

  // Handler for Actions
  const handleAction = (type: string, targetId?: string) => {
    if (onTrackEvent) onTrackEvent(type, targetId);

    switch (type) {
      case 'whatsapp_click':
        window.open(`https://wa.me/${profile.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${profile.business_name}, I saw your digital profile and would like to know more.`)}`, '_blank');
        break;
      case 'call_click':
        window.location.href = `tel:${profile.phone}`;
        break;
      case 'email_click':
        window.location.href = `mailto:${profile.email}?subject=Inquiry%20via%20Digital%20Profile`;
        break;
      case 'website_click':
        window.open(profile.website.startsWith('http') ? profile.website : `https://${profile.website}`, '_blank');
        break;
      case 'map_click':
        window.open(profile.google_maps_url || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${profile.business_name} ${profile.address} ${profile.city}`)}`, '_blank');
        break;
      case 'review_click':
        if (profile.google_review_url) window.open(profile.google_review_url, '_blank');
        break;
      case 'vcard_click':
        downloadVCard({
          fullName: profile.person_name || profile.business_name,
          company: profile.business_name,
          title: profile.designation,
          phone: profile.phone,
          mobile: profile.whatsapp,
          email: profile.email,
          url: profile.website,
          address: {
            street: profile.address,
            city: profile.city,
            state: profile.state,
            pincode: profile.pincode,
            country: profile.country
          },
          note: `Connected via ${profile.business_name} Smart Digital Card`
        }, `${profile.slug}_contact.vcf`);
        break;
      case 'share_click':
        if (navigator.share) {
          navigator.share({
            title: profile.business_name,
            text: `Check out our digital business profile: ${profile.business_name}`,
            url: window.location.href
          }).catch(() => setShareModalOpen(true));
        } else {
          setShareModalOpen(true);
        }
        break;
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(profile.upi_id);
    setCopiedUpi(true);
    if (onTrackEvent) onTrackEvent('upi_click');
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(profile.wifi_password);
    setCopiedWifi(true);
    if (onTrackEvent) onTrackEvent('wifi_click');
    setTimeout(() => setCopiedWifi(false), 2000);
  };

  const handleCopyProfileLink = () => {
    const url = window.location.origin ? `${window.location.origin}/p/${profile.slug}` : `https://mythconnect.ai/p/${profile.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenProductEnquiry = (product: Product) => {
    setEnquiryProduct(product);
    setEnquiryMessage(`Hi, I am interested in purchasing/enquiring about ${product.name} (₹${(product.discount_price || product.unit_price).toLocaleString('en-IN')}). Please contact me.`);
    setEnquiryModalOpen(true);
    setEnquirySuccess(false);
  };

  const handleOpenGeneralEnquiry = () => {
    setEnquiryProduct(null);
    setEnquiryMessage('Hi, I would like to enquire about your services and products. Please connect with me.');
    setEnquiryModalOpen(true);
    setEnquirySuccess(false);
  };

  const handleSubmitEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enquiryName || !enquiryPhone) return;

    if (onSubmitEnquiry) {
      onSubmitEnquiry({
        name: enquiryName,
        phone: enquiryPhone,
        email: enquiryEmail,
        message: enquiryMessage,
        productId: enquiryProduct ? enquiryProduct.id : undefined,
        quantity: enquiryQuantity,
        source: enquiryProduct ? 'digital_profile_shop' : 'digital_profile'
      });
    }

    setEnquirySuccess(true);
    setTimeout(() => {
      setEnquiryModalOpen(false);
      setEnquirySuccess(false);
      setEnquiryName('');
      setEnquiryPhone('');
      setEnquiryEmail('');
      setEnquiryMessage('');
      setEnquiryProduct(null);
    }, 2500);
  };

  // If unpublished and not in preview mode, render professional unavailable screen
  if (profile.status === 'unpublished' && !isPreview) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          backgroundColor: '#FEECEE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 20
        }}>
          <AlertCircle size={36} color="#EF1D2D" />
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#0B1F3A', marginBottom: 8, fontFamily: "'Outfit', sans-serif" }}>
          Profile Currently Unavailable
        </h2>
        <p style={{ fontSize: 15, color: '#64748B', maxWidth: 460, lineHeight: 1.6, marginBottom: 24 }}>
          This digital business card has been temporarily made private or unpublished by the business owner. Please check back later or contact the business directly.
        </p>
        <div style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>
          Powered by Myth Connect.ai Intelligent CRM
        </div>
      </div>
    );
  }

  // Theme styling helpers
  const themeBg = profile.theme === 'creative' ? '#0F172A' : '#F8FAFC';
  const cardBg = profile.theme === 'creative' ? '#1E293B' : '#FFFFFF';
  const textTitle = profile.theme === 'creative' ? '#F8FAFC' : '#0B1F3A';
  const textBody = profile.theme === 'creative' ? '#94A3B8' : '#475569';
  const primaryCol = profile.primary_color || '#1565E8';

  return (
    <div className="digital-profile-public-container" style={{
      width: '100%',
      maxWidth: isPreview ? '100%' : '520px',
      margin: '0 auto',
      backgroundColor: themeBg,
      minHeight: '100vh',
      position: 'relative',
      boxShadow: isPreview ? 'none' : '0 20px 45px -10px rgba(11, 31, 58, 0.15)',
      fontFamily: "'Inter', sans-serif",
      color: textBody,
      paddingBottom: 90, // Space for sticky bottom bar
      overflowX: 'hidden'
    }}>
      {/* 1. COVER BANNER */}
      <div style={{
        position: 'relative',
        height: 170,
        width: '100%',
        backgroundColor: '#0B1F3A',
        backgroundImage: profile.cover_banner_url ? `url("${profile.cover_banner_url}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Subtle overlay gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(180deg, rgba(11, 31, 58, 0.2) 0%, rgba(11, 31, 58, 0.75) 100%)'
        }} />

        {/* Top Floating Controls */}
        <div style={{
          position: 'absolute',
          top: 14,
          left: 14,
          right: 14,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10
        }}>
          {/* Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            backgroundColor: openStatus.isOpen ? 'rgba(0, 168, 107, 0.92)' : 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 20,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <span style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              backgroundColor: openStatus.isOpen ? '#72F2B6' : '#EF4444',
              display: 'inline-block'
            }} />
            {openStatus.text}
          </div>

          {/* Share Button */}
          <button 
            onClick={() => handleAction('share_click')}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(8px)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
            }}
            title="Share Profile"
          >
            <Share2 size={17} color="#0B1F3A" />
          </button>
        </div>
      </div>

      {/* 2. PROFILE HEADER / AVATARS */}
      <div style={{
        padding: '0 20px',
        position: 'relative',
        marginTop: -55,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        zIndex: 5
      }}>
        {/* Profile Avatar with Business Logo Badge */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <div style={{
            width: 104,
            height: 104,
            borderRadius: '50%',
            border: '4px solid #FFFFFF',
            backgroundColor: '#FFFFFF',
            boxShadow: '0 8px 24px rgba(11, 31, 58, 0.18)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img 
              src={profile.profile_photo_url || profile.business_logo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'} 
              alt={profile.business_name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Verified Official Brand Badge */}
          <div style={{
            position: 'absolute',
            bottom: 2,
            right: 2,
            width: 28,
            height: 28,
            borderRadius: '50%',
            backgroundColor: '#1565E8',
            border: '2px solid #FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(21, 101, 232, 0.4)'
          }}>
            <CheckCircle size={16} color="#FFFFFF" />
          </div>
        </div>

        {/* Business & Person Name */}
        <h1 style={{
          fontSize: 21,
          fontWeight: 800,
          color: textTitle,
          margin: '0 0 3px 0',
          fontFamily: "'Outfit', 'Inter', sans-serif",
          letterSpacing: '-0.3px',
          lineHeight: 1.25
        }}>
          {profile.business_name}
        </h1>

        <div style={{
          fontSize: 14,
          fontWeight: 600,
          color: primaryCol,
          marginBottom: 4
        }}>
          {profile.person_name} • {profile.designation}
        </div>

        {/* Business Category Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 5,
          backgroundColor: profile.theme === 'creative' ? '#334155' : '#EEF4FF',
          color: profile.theme === 'creative' ? '#93C5FD' : '#1565E8',
          fontSize: 12,
          fontWeight: 600,
          padding: '3px 12px',
          borderRadius: 16,
          marginBottom: 12
        }}>
          <Sparkles size={13} />
          {profile.business_category}
        </div>

        {/* Short Tagline */}
        <p style={{
          fontSize: 13.5,
          lineHeight: 1.55,
          color: textBody,
          margin: '0 0 16px 0',
          maxWidth: 420
        }}>
          {profile.short_description}
        </p>

        {/* 3. PRIMARY QUICK BUSINESS ACTIONS (Large Touch Targets) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          width: '100%',
          marginBottom: 18
        }}>
          {/* WhatsApp */}
          <button 
            onClick={() => handleAction('whatsapp_click')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 6px',
              backgroundColor: '#E8F8F1',
              border: '1px solid #A7F3D0',
              borderRadius: 12,
              cursor: 'pointer',
              color: '#00875A',
              transition: 'transform 0.1s ease',
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#00A86B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(0, 168, 107, 0.3)'
            }}>
              <MessageSquare size={19} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>WhatsApp</span>
          </button>

          {/* Call */}
          <button 
            onClick={() => handleAction('call_click')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 6px',
              backgroundColor: '#EEF4FF',
              border: '1px solid #BFDBFE',
              borderRadius: 12,
              cursor: 'pointer',
              color: '#1565E8',
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#1565E8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(21, 101, 232, 0.3)'
            }}>
              <Phone size={19} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>Call Now</span>
          </button>

          {/* Directions / Maps */}
          <button 
            onClick={() => handleAction('map_click')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 6px',
              backgroundColor: '#FEF6E6',
              border: '1px solid #FDE68A',
              borderRadius: 12,
              cursor: 'pointer',
              color: '#D97706',
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#F5A000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(245, 160, 0, 0.3)'
            }}>
              <MapPin size={19} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>Directions</span>
          </button>

          {/* Save Contact (vCard) */}
          <button 
            onClick={() => handleAction('vcard_click')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '12px 6px',
              backgroundColor: profile.theme === 'creative' ? '#334155' : '#F1F5F9',
              border: `1px solid ${profile.theme === 'creative' ? '#475569' : '#E2E8F0'}`,
              borderRadius: 12,
              cursor: 'pointer',
              color: textTitle,
            }}
          >
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '50%',
              backgroundColor: '#0B1F3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(11, 31, 58, 0.3)'
            }}>
              <Download size={19} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: 11.5, fontWeight: 700 }}>Save Contact</span>
          </button>
        </div>

        {/* Secondary Contact Bar: Email | Website | General Enquire */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 14,
          flexWrap: 'wrap',
          fontSize: 12,
          fontWeight: 600,
          color: textBody,
          marginBottom: 16
        }}>
          <span 
            onClick={() => handleAction('email_click')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Mail size={14} color={primaryCol} /> {profile.email}
          </span>
          <span>•</span>
          <span 
            onClick={() => handleAction('website_click')}
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Globe size={14} color={primaryCol} /> Website
          </span>
        </div>

        {/* Prominent Quick "Enquire Now" Banner Button */}
        <button
          onClick={handleOpenGeneralEnquiry}
          style={{
            width: '100%',
            padding: '12px 18px',
            backgroundColor: primaryCol,
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: `0 6px 18px ${primaryCol}40`,
            marginBottom: 20
          }}
        >
          <Sparkles size={17} />
          <span>Send Business Enquiry / Book Demo</span>
          <ChevronRight size={17} />
        </button>
      </div>

      {/* 4. SOCIAL MEDIA CHANNELS BAR */}
      {profile.social_links && profile.social_links.filter(s => s.enabled).length > 0 && (
        <div style={{
          padding: '0 20px',
          marginBottom: 24
        }}>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
            border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`
          }}>
            <div style={{
              fontSize: 11,
              fontWeight: 800,
              color: '#94A3B8',
              letterSpacing: 0.8,
              marginBottom: 10,
              textTransform: 'uppercase'
            }}>
              Connect on Social Platforms
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              {profile.social_links.filter(s => s.enabled).map(s => {
                const colors: Record<string, { bg: string; iconCol: string }> = {
                  instagram: { bg: '#FDF2F8', iconCol: '#E1306C' },
                  facebook: { bg: '#EFF6FF', iconCol: '#1877F2' },
                  youtube: { bg: '#FEF2F2', iconCol: '#FF0000' },
                  linkedin: { bg: '#F0F9FF', iconCol: '#0A66C2' },
                  twitter: { bg: '#F8FAFC', iconCol: '#0F172A' },
                  whatsapp: { bg: '#ECFDF5', iconCol: '#25D366' },
                  website: { bg: '#EEF2FF', iconCol: '#4F46E5' },
                };
                const style = colors[s.platform] || { bg: '#F1F5F9', iconCol: '#0B1F3A' };

                return (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onTrackEvent && onTrackEvent('social_click', s.platform)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                      color: textBody,
                      padding: 6
                    }}
                  >
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: style.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${style.iconCol}20`
                    }}>
                      <Globe size={18} color={style.iconCol} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700 }}>
                      {s.platform.charAt(0).toUpperCase() + s.platform.slice(1)}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 5. ABOUT COMPANY ACCORDION / CARD */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: '18px 20px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.04)',
          border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`
        }}>
          <h2 style={{
            fontSize: 16,
            fontWeight: 800,
            color: textTitle,
            margin: '0 0 10px 0',
            fontFamily: "'Outfit', sans-serif"
          }}>
            About {profile.business_name}
          </h2>
          <p style={{
            fontSize: 13.5,
            lineHeight: 1.65,
            color: textBody,
            margin: 0
          }}>
            {profile.about}
          </p>
        </div>
      </div>

      {/* 6. SERVICES OFFERED */}
      {profile.services && profile.services.filter(s => s.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12
          }}>
            <h2 style={{
              fontSize: 17,
              fontWeight: 800,
              color: textTitle,
              margin: 0,
              fontFamily: "'Outfit', sans-serif"
            }}>
              Our Core Services
            </h2>
            <span style={{ fontSize: 12, fontWeight: 600, color: primaryCol }}>
              {profile.services.filter(s => s.enabled).length} Services
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {profile.services.filter(s => s.enabled).map(serv => (
              <div 
                key={serv.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  padding: 16,
                  border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: textTitle, margin: 0 }}>
                    {serv.title}
                  </h3>
                  {serv.starting_price ? (
                    <span style={{
                      fontSize: 13,
                      fontWeight: 800,
                      color: '#00A86B',
                      backgroundColor: '#E8F8F1',
                      padding: '3px 8px',
                      borderRadius: 6
                    }}>
                      From ₹{serv.starting_price.toLocaleString('en-IN')}
                    </span>
                  ) : null}
                </div>

                <p style={{ fontSize: 13, color: textBody, lineHeight: 1.5, margin: 0 }}>
                  {serv.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                  <button
                    onClick={() => {
                      setEnquiryProduct(null);
                      setEnquiryMessage(`Hi, I am interested in your service: "${serv.title}". Please provide pricing details and consultation availability.`);
                      setEnquiryModalOpen(true);
                      setEnquirySuccess(false);
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${primaryCol}`,
                      color: primaryCol,
                      padding: '6px 14px',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4
                    }}
                  >
                    <span>{serv.cta_text || 'Enquire Service'}</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. MINI SHOP & CRM PRODUCT CATALOG */}
      {shopProducts.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10
          }}>
            <h2 style={{
              fontSize: 17,
              fontWeight: 800,
              color: textTitle,
              margin: 0,
              fontFamily: "'Outfit', sans-serif"
            }}>
              Product Showcase & Mini Shop
            </h2>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: '#00A86B',
              color: '#FFFFFF',
              padding: '2px 8px',
              borderRadius: 12
            }}>
              Live Inventory
            </span>
          </div>

          {/* Search & Category Filter */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Search products or packages..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#CBD5E1'}`,
                backgroundColor: cardBg,
                color: textTitle,
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Category Pills */}
          {categories.length > 1 && (
            <div style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 8,
              marginBottom: 10
            }}>
              <button
                onClick={() => setActiveCategory('all')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 16,
                  border: 'none',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: activeCategory === 'all' ? primaryCol : (profile.theme === 'creative' ? '#334155' : '#E2E8F0'),
                  color: activeCategory === 'all' ? '#FFFFFF' : textBody
                }}
              >
                All Products
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 16,
                    border: 'none',
                    fontSize: 11.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    backgroundColor: activeCategory === cat ? primaryCol : (profile.theme === 'creative' ? '#334155' : '#E2E8F0'),
                    color: activeCategory === cat ? '#FFFFFF' : textBody
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Product Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {shopProducts.map(p => {
              const hasDiscount = !!p.discount_price && p.discount_price < p.unit_price;
              const price = p.discount_price || p.unit_price;
              const original = p.unit_price;

              return (
                <div 
                  key={p.id}
                  style={{
                    backgroundColor: cardBg,
                    borderRadius: 14,
                    overflow: 'hidden',
                    border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                  }}
                >
                  {/* Thumbnail Image */}
                  <div 
                    onClick={() => {
                      setSelectedProduct(p);
                      if (onTrackEvent) onTrackEvent('product_view', String(p.id));
                    }}
                    style={{
                      height: 120,
                      backgroundColor: '#E2E8F0',
                      backgroundImage: `url("${p.image_url}")`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    {hasDiscount && (
                      <span style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        backgroundColor: '#EF1D2D',
                        color: '#FFFFFF',
                        fontSize: 10,
                        fontWeight: 800,
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        SAVE ₹{(original - price).toLocaleString('en-IN')}
                      </span>
                    )}
                    {p.in_stock && (
                      <span style={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(0, 168, 107, 0.9)',
                        color: '#FFFFFF',
                        fontSize: 9.5,
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4
                      }}>
                        In Stock
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 }}>
                      {p.category}
                    </div>
                    
                    <h3 
                      onClick={() => setSelectedProduct(p)}
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: textTitle,
                        margin: '0 0 6px 0',
                        cursor: 'pointer',
                        lineHeight: 1.3,
                        height: 34,
                        overflow: 'hidden'
                      }}
                    >
                      {p.name}
                    </h3>

                    {/* Pricing */}
                    <div style={{ marginTop: 'auto', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: textTitle }}>
                          ₹{price.toLocaleString('en-IN')}
                        </span>
                        {hasDiscount && (
                          <span style={{ fontSize: 11, color: '#94A3B8', textDecoration: 'line-through' }}>
                            ₹{original.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Enquire CTA */}
                    <button
                      onClick={() => handleOpenProductEnquiry(p)}
                      style={{
                        width: '100%',
                        padding: '7px 0',
                        backgroundColor: '#EEF4FF',
                        border: '1px solid #BFDBFE',
                        borderRadius: 8,
                        color: '#1565E8',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4
                      }}
                    >
                      <ShoppingBag size={13} />
                      <span>Enquire Now</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. ACTIVE FESTIVE OFFERS & PROMOTIONS */}
      {profile.offers && profile.offers.filter(o => o.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginBottom: 10
          }}>
            <h2 style={{
              fontSize: 17,
              fontWeight: 800,
              color: textTitle,
              margin: 0,
              fontFamily: "'Outfit', sans-serif"
            }}>
              🔥 Special Offers & Deals
            </h2>
          </div>

          {profile.offers.filter(o => o.enabled).map(offer => (
            <div 
              key={offer.id}
              style={{
                background: 'linear-gradient(135deg, #0B1F3A 0%, #1565E8 100%)',
                color: '#FFFFFF',
                borderRadius: 16,
                padding: 18,
                boxShadow: '0 8px 20px rgba(21, 101, 232, 0.25)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{
                  backgroundColor: '#EF1D2D',
                  fontSize: 10.5,
                  fontWeight: 800,
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase'
                }}>
                  Limited Time Deal
                </span>
                <span style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>
                  Valid until {new Date(offer.valid_until).toLocaleDateString()}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>
                {offer.title}
              </h3>

              <p style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.9, margin: 0 }}>
                {offer.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 6,
                paddingTop: 10,
                borderTop: '1px solid rgba(255,255,255,0.15)'
              }}>
                <div>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>
                    ₹{offer.offer_price.toLocaleString('en-IN')}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.7, textDecoration: 'line-through', marginLeft: 8 }}>
                    ₹{offer.original_price.toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setEnquiryProduct(null);
                    setEnquiryMessage(`Hi, I want to claim the offer: "${offer.title}" at ₹${offer.offer_price.toLocaleString('en-IN')}. Please confirm availability.`);
                    setEnquiryModalOpen(true);
                  }}
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: '#0B1F3A',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12.5,
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {offer.cta_text || 'Claim Offer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 9. CATALOGUE DOWNLOAD & PDF VIEWER */}
      {profile.catalogues && profile.catalogues.filter(c => c.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: textTitle,
            margin: '0 0 12px 0',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Company Catalogues & Brochures
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.catalogues.filter(c => c.enabled).map(cat => (
              <div 
                key={cat.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  padding: 14,
                  border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}
              >
                <div style={{
                  width: 50,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: '#FEF6E6',
                  backgroundImage: cat.cover_image ? `url("${cat.cover_image}")` : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flexShrink: 0
                }} />

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 700, color: textTitle, margin: '0 0 2px 0' }}>
                    {cat.title}
                  </h4>
                  <div style={{ fontSize: 11.5, color: '#94A3B8', marginBottom: 6 }}>
                    {cat.file_size || 'Official PDF Catalogue'}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <a
                      href={cat.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onTrackEvent && onTrackEvent('catalogue_click', cat.title)}
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: primaryCol,
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                    >
                      <Download size={13} /> Download PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. PORTFOLIO & RECENT WORK */}
      {profile.portfolio && profile.portfolio.filter(p => p.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: textTitle,
            margin: '0 0 12px 0',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Featured Portfolio & Work
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {profile.portfolio.filter(p => p.enabled).map(item => (
              <div 
                key={item.id}
                onClick={() => setSelectedPortfolio(item)}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 12,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`
                }}
              >
                <div style={{
                  height: 100,
                  backgroundColor: '#E2E8F0',
                  backgroundImage: `url("${item.image_url}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} />
                <div style={{ padding: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: primaryCol, textTransform: 'uppercase' }}>
                    {item.category}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: textTitle, margin: '2px 0' }}>
                    {item.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 11. ACHIEVEMENTS & MILESTONES */}
      {profile.achievements && profile.achievements.filter(a => a.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 18,
            border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 14
          }}>
            {profile.achievements.filter(a => a.enabled).map(ach => (
              <div key={ach.id} style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: 22,
                  fontWeight: 900,
                  color: primaryCol,
                  fontFamily: "'Outfit', sans-serif"
                }}>
                  {ach.value}
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: textTitle }}>
                  {ach.title}
                </span>
                <span style={{ fontSize: 11, color: '#94A3B8' }}>
                  {ach.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 12. CLIENT TESTIMONIALS & REVIEWS */}
      {profile.testimonials && profile.testimonials.filter(t => t.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <h2 style={{
            fontSize: 17,
            fontWeight: 800,
            color: textTitle,
            margin: '0 0 12px 0',
            fontFamily: "'Outfit', sans-serif"
          }}>
            Client Testimonials & Feedback
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {profile.testimonials.filter(t => t.enabled).map(test => (
              <div 
                key={test.id}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 14,
                  padding: 14,
                  border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`
                }}
              >
                <div style={{ display: 'flex', gap: 2, marginBottom: 6 }}>
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} size={14} color="#F5A000" fill="#F5A000" />
                  ))}
                </div>
                <p style={{ fontSize: 13, fontStyle: 'italic', color: textBody, margin: '0 0 8px 0', lineHeight: 1.5 }}>
                  "{test.review}"
                </p>
                <div style={{ fontSize: 12, fontWeight: 700, color: textTitle }}>
                  {test.customer_name} <span style={{ fontWeight: 400, color: '#94A3B8' }}>• {test.designation}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. GOOGLE REVIEW CTA */}
      {profile.google_review_url && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            backgroundColor: '#FEF6E6',
            borderRadius: 16,
            padding: 16,
            border: '1px solid #FDE68A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} color="#F5A000" fill="#F5A000" />
                ))}
                <span style={{ fontSize: 12, fontWeight: 800, color: '#0B1F3A', marginLeft: 4 }}>5.0 Rating</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0B1F3A' }}>
                Rate & Review Us on Google
              </div>
            </div>

            <button
              onClick={() => handleAction('review_click')}
              style={{
                backgroundColor: '#F5A000',
                color: '#FFFFFF',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Write Review
            </button>
          </div>
        </div>
      )}

      {/* 14. BUSINESS HOURS TABLE */}
      {profile.business_hours && profile.business_hours.length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 18,
            border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={16} color={primaryCol} />
                <h3 style={{ fontSize: 15, fontWeight: 800, color: textTitle, margin: 0 }}>
                  Working Hours
                </h3>
              </div>
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: openStatus.isOpen ? '#00A86B' : '#EF1D2D'
              }}>
                {openStatus.text}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {profile.business_hours.map(h => (
                <div 
                  key={h.day}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: 12.5,
                    padding: '4px 0',
                    borderBottom: '1px solid #F1F5F9'
                  }}
                >
                  <span style={{ fontWeight: 600, color: textTitle }}>{h.day}</span>
                  <span style={{ color: h.is_closed ? '#EF1D2D' : textBody, fontWeight: h.is_closed ? 700 : 500 }}>
                    {h.is_closed ? 'Closed' : `${formatTime(h.open_time)} - ${formatTime(h.close_time)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 15. UPI PAYMENT BOX */}
      {profile.upi_id && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 16,
            border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10.5, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase' }}>
                Instant Bank Settlement
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: textTitle, margin: '2px 0' }}>
                Pay via UPI
              </div>
              <div style={{ fontSize: 12, color: primaryCol, fontWeight: 600 }}>
                {profile.upi_id}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopyUpi}
                style={{
                  backgroundColor: copiedUpi ? '#E8F8F1' : '#F1F5F9',
                  color: copiedUpi ? '#00A86B' : '#0B1F3A',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                {copiedUpi ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
              </button>

              <a
                href={`upi://pay?pa=${profile.upi_id}&pn=${encodeURIComponent(profile.upi_name || profile.business_name)}&cu=INR`}
                onClick={() => onTrackEvent && onTrackEvent('upi_click')}
                style={{
                  backgroundColor: '#1565E8',
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  padding: '8px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                Pay Now
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 16. WI-FI DETAILS (If enabled) */}
      {profile.wifi_enabled && profile.wifi_ssid && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: 16,
            padding: 16,
            border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#EEF4FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Wifi size={18} color="#1565E8" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: textTitle }}>
                  Guest Wi-Fi: {profile.wifi_ssid}
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8' }}>
                  Password: {profile.wifi_password}
                </div>
              </div>
            </div>

            <button
              onClick={handleCopyWifi}
              style={{
                backgroundColor: copiedWifi ? '#E8F8F1' : '#F1F5F9',
                color: copiedWifi ? '#00A86B' : '#0B1F3A',
                border: 'none',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {copiedWifi ? 'Copied!' : 'Copy Pass'}
            </button>
          </div>
        </div>
      )}

      {/* 17. APP STORE & PLAY STORE DOWNLOADS */}
      {(profile.play_store_url || profile.app_store_url) && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {profile.play_store_url && (
              <a
                href={profile.play_store_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrackEvent && onTrackEvent('app_download_click', 'play_store')}
                style={{
                  flex: 1,
                  backgroundColor: '#0B1F3A',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none'
                }}
              >
                <div style={{ fontSize: 9.5, opacity: 0.8, textTransform: 'uppercase' }}>GET IT ON</div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Google Play</div>
              </a>
            )}
            {profile.app_store_url && (
              <a
                href={profile.app_store_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => onTrackEvent && onTrackEvent('app_download_click', 'app_store')}
                style={{
                  flex: 1,
                  backgroundColor: '#0B1F3A',
                  color: '#FFFFFF',
                  borderRadius: 10,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  textDecoration: 'none'
                }}
              >
                <div style={{ fontSize: 9.5, opacity: 0.8, textTransform: 'uppercase' }}>Download on the</div>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>App Store</div>
              </a>
            )}
          </div>
        </div>
      )}

      {/* 18. CUSTOM LINKS */}
      {profile.custom_links && profile.custom_links.filter(l => l.enabled).length > 0 && (
        <div style={{ padding: '0 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {profile.custom_links.filter(l => l.enabled).map(link => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  backgroundColor: cardBg,
                  borderRadius: 12,
                  padding: '12px 16px',
                  border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  color: textTitle
                }}
              >
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{link.title}</div>
                  {link.description && (
                    <div style={{ fontSize: 11.5, color: '#94A3B8' }}>{link.description}</div>
                  )}
                </div>
                <ExternalLink size={16} color={primaryCol} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 19. GOOGLE MAPS PREVIEW */}
      <div style={{ padding: '0 20px', marginBottom: 24 }}>
        <div style={{
          backgroundColor: cardBg,
          borderRadius: 16,
          padding: 16,
          border: `1px solid ${profile.theme === 'creative' ? '#334155' : '#E2E8F0'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <MapPin size={16} color={primaryCol} />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: textTitle, margin: 0 }}>
              Office Location & Directions
            </h3>
          </div>
          <p style={{ fontSize: 13, color: textBody, lineHeight: 1.5, margin: '0 0 12px 0' }}>
            {profile.address}, {profile.city}, {profile.state} - {profile.pincode}, {profile.country}
          </p>

          <button
            onClick={() => handleAction('map_click')}
            style={{
              width: '100%',
              backgroundColor: '#FEF6E6',
              border: '1px solid #FDE68A',
              color: '#D97706',
              borderRadius: 10,
              padding: '10px 0',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <MapPin size={15} />
            <span>Open in Google Maps / Navigation</span>
          </button>
        </div>
      </div>

      {/* 20. FOOTER BRANDING */}
      <div style={{
        textAlign: 'center',
        padding: '10px 20px 20px',
        fontSize: 11,
        color: '#94A3B8'
      }}>
        <div style={{ fontWeight: 700, color: textTitle, marginBottom: 4 }}>
          {profile.business_name}
        </div>
        <div>
          Powered by <strong style={{ color: '#1565E8' }}>Myth Connect.ai</strong> — Intelligent CRM & Sales Automation
        </div>
      </div>

      {/* 21. STICKY BOTTOM ACTION BAR (Mobile Touch Optimized) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: isPreview ? '100%' : '520px',
        height: 64,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 12px',
        zIndex: 50,
        boxShadow: '0 -4px 18px rgba(11, 31, 58, 0.08)'
      }}>
        <button
          onClick={() => handleAction('whatsapp_click')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#00A86B'
          }}
        >
          <MessageSquare size={19} />
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>WhatsApp</span>
        </button>

        <button
          onClick={() => handleAction('call_click')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#1565E8'
          }}
        >
          <Phone size={19} />
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>Call</span>
        </button>

        <button
          onClick={() => handleAction('vcard_click')}
          style={{
            flex: 1.2,
            height: 42,
            backgroundColor: '#0B1F3A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            cursor: 'pointer',
            fontSize: 11.5,
            fontWeight: 700
          }}
        >
          <Download size={14} />
          <span>Save Contact</span>
        </button>

        <button
          onClick={() => handleAction('share_click')}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          <Share2 size={19} />
          <span style={{ fontSize: 10.5, fontWeight: 700 }}>Share</span>
        </button>
      </div>

      {/* PRODUCT DETAIL MODAL */}
      {selectedProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 31, 58, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            width: '100%',
            maxWidth: 440,
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: 20,
            position: 'relative'
          }}>
            <button
              onClick={() => setSelectedProduct(null)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="#0B1F3A" />
            </button>

            <img 
              src={selectedProduct.image_url} 
              alt={selectedProduct.name}
              style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }}
            />

            <div style={{ fontSize: 11, fontWeight: 800, color: '#1565E8', textTransform: 'uppercase' }}>
              {selectedProduct.category} • SKU: {selectedProduct.item_code}
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B1F3A', margin: '4px 0 8px 0' }}>
              {selectedProduct.name}
            </h3>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#0B1F3A' }}>
                ₹{(selectedProduct.discount_price || selectedProduct.unit_price).toLocaleString('en-IN')}
              </span>
              {selectedProduct.discount_price && (
                <span style={{ fontSize: 14, color: '#94A3B8', textDecoration: 'line-through' }}>
                  ₹{selectedProduct.unit_price.toLocaleString('en-IN')}
                </span>
              )}
              <span style={{ fontSize: 11, color: '#00A86B', fontWeight: 700, marginLeft: 'auto' }}>
                +18% GST Applicable
              </span>
            </div>

            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: '#475569', marginBottom: 18 }}>
              {selectedProduct.description}
            </p>

            <button
              onClick={() => {
                const prod = selectedProduct;
                setSelectedProduct(null);
                handleOpenProductEnquiry(prod);
              }}
              style={{
                width: '100%',
                padding: '12px 0',
                backgroundColor: '#1565E8',
                color: '#FFFFFF',
                borderRadius: 10,
                border: 'none',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              <ShoppingBag size={16} />
              <span>Enquire & Connect with Sales</span>
            </button>
          </div>
        </div>
      )}

      {/* GENERAL & PRODUCT ENQUIRY MODAL (CONNECTS DIRECTLY TO CRM LEADS) */}
      {enquiryModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 31, 58, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 18,
            width: '100%',
            maxWidth: 420,
            padding: 22,
            position: 'relative',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <button
              onClick={() => setEnquiryModalOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 32,
                height: 32,
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} color="#0B1F3A" />
            </button>

            {enquirySuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  backgroundColor: '#E8F8F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px'
                }}>
                  <CheckCircle size={32} color="#00A86B" />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0B1F3A', marginBottom: 6 }}>
                  Enquiry Submitted!
                </h3>
                <p style={{ fontSize: 13.5, color: '#64748B', lineHeight: 1.5, margin: 0 }}>
                  Thank you, {enquiryName}! Your request has been forwarded to our sales executive. We will reach out to you on WhatsApp / Phone shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundColor: '#EEF4FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Sparkles size={16} color="#1565E8" />
                  </div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
                    {enquiryProduct ? 'Product Enquiry' : 'Get in Touch'}
                  </h3>
                </div>

                <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 16px 0' }}>
                  {enquiryProduct ? `Inquiring about: "${enquiryProduct.name}"` : 'Leave your contact details for instant response from our team.'}
                </p>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar"
                    value={enquiryName}
                    onChange={(e) => setEnquiryName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Mobile / WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="ramesh@company.com"
                    value={enquiryEmail}
                    onChange={(e) => setEnquiryEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {enquiryProduct && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                      Quantity / Licenses Needed
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={enquiryQuantity}
                      onChange={(e) => setEnquiryQuantity(Math.max(1, Number(e.target.value)))}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: 8,
                        border: '1px solid #CBD5E1',
                        fontSize: 13,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: '#334155', display: 'block', marginBottom: 4 }}>
                    Message / Requirements
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: '1px solid #CBD5E1',
                      fontSize: 13,
                      boxSizing: 'border-box',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '12px 0',
                    backgroundColor: '#1565E8',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  Submit Enquiry
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SHARE PROFILE MODAL */}
      {shareModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(11, 31, 58, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: 16
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 16,
            width: '100%',
            maxWidth: 380,
            padding: 20,
            position: 'relative'
          }}>
            <button
              onClick={() => setShareModalOpen(false)}
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                width: 30,
                height: 30,
                borderRadius: '50%',
                backgroundColor: '#F1F5F9',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A', margin: '0 0 12px 0' }}>
              Share Digital Business Card
            </h3>

            {/* Smart QR Preview in share modal */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: '#F8FAFC',
              padding: 16,
              borderRadius: 12,
              marginBottom: 14
            }}>
              <QRCodeSVG
                value={typeof window !== 'undefined' ? `${window.location.origin}/qr/${profile.smart_qr_id}` : `https://mythconnect.ai/qr/${profile.smart_qr_id}`}
                size={140}
                level="H"
                fgColor="#0B1F3A"
                bgColor="#FFFFFF"
                includeMargin
              />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', marginTop: 8 }}>
                Scan to open digital profile
              </span>
            </div>

            <button
              onClick={handleCopyProfileLink}
              style={{
                width: '100%',
                padding: '10px 0',
                backgroundColor: copiedLink ? '#E8F8F1' : '#1565E8',
                color: copiedLink ? '#00A86B' : '#FFFFFF',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6
              }}
            >
              {copiedLink ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Public Profile Link'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
