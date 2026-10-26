import React, { useState } from 'react';
import { 
  User, Phone, Mail, Globe, MapPin, Clock, Share2, 
  Sparkles, Plus, Trash2, Edit2, Check, ArrowUp, ArrowDown,
  Image, Layers, Star, Award, Shield, Wifi, ShoppingBag,
  Palette, Search, ExternalLink, QrCode, Eye, Smartphone,
  Monitor, ChevronRight, CheckCircle, AlertTriangle
} from 'lucide-react';
import { DigitalProfile, Product, ProfileTheme, SocialLink, ProfileService, ProfileCatalogue, ProfilePortfolioItem, ProfileTestimonial, ProfileAchievement, ProfileOffer, ProfileCustomLink } from '../../types';
import { PublicProfilePage } from './PublicProfilePage';
import { BrandColors } from '../../theme';

interface ProfileBuilderProps {
  profile: DigitalProfile;
  products: Product[];
  onUpdateProfile: (patch: Partial<DigitalProfile>) => void;
  onSaveDraft?: () => void;
  onPublish?: () => void;
  isMobile: boolean;
}

type SectionKey = 
  | 'basic' 
  | 'contact' 
  | 'hours' 
  | 'social' 
  | 'services' 
  | 'shop' 
  | 'catalogue' 
  | 'portfolio' 
  | 'testimonials' 
  | 'achievements' 
  | 'offers' 
  | 'upi_wifi' 
  | 'apps_links' 
  | 'theme_seo';

export const ProfileBuilder: React.FC<ProfileBuilderProps> = ({
  profile,
  products,
  onUpdateProfile,
  onSaveDraft,
  onPublish,
  isMobile
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('basic');
  const [mobilePreviewModal, setMobilePreviewModal] = useState<boolean>(false);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet'>('mobile');

  const sections: { key: SectionKey; label: string; icon: any; count?: number }[] = [
    { key: 'basic', label: 'Basic Information', icon: User },
    { key: 'contact', label: 'Contact & Location', icon: MapPin },
    { key: 'hours', label: 'Business Hours', icon: Clock },
    { key: 'social', label: 'Social Channels', icon: Share2, count: profile.social_links.filter(s => s.enabled).length },
    { key: 'services', label: 'Services', icon: Layers, count: profile.services.filter(s => s.enabled).length },
    { key: 'shop', label: 'Mini Shop / Products', icon: ShoppingBag, count: profile.product_ids?.length || 0 },
    { key: 'catalogue', label: 'PDF Catalogues', icon: Image, count: profile.catalogues?.length || 0 },
    { key: 'portfolio', label: 'Portfolio Gallery', icon: Image, count: profile.portfolio?.length || 0 },
    { key: 'testimonials', label: 'Testimonials', icon: Star, count: profile.testimonials?.length || 0 },
    { key: 'achievements', label: 'Achievements', icon: Award, count: profile.achievements?.length || 0 },
    { key: 'offers', label: 'Active Offers & Deals', icon: Sparkles, count: profile.offers?.length || 0 },
    { key: 'upi_wifi', label: 'UPI & Guest Wi-Fi', icon: Wifi },
    { key: 'apps_links', label: 'Apps & Custom Links', icon: Globe },
    { key: 'theme_seo', label: 'Theme & SEO Meta', icon: Palette },
  ];

  // Handlers for Basic info
  const handleTextChange = (field: keyof DigitalProfile, value: any) => {
    onUpdateProfile({ [field]: value });
  };

  // Handlers for Social Links
  const toggleSocialLink = (id: string) => {
    const updated = profile.social_links.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    onUpdateProfile({ social_links: updated });
  };

  const updateSocialUrl = (id: string, url: string) => {
    const updated = profile.social_links.map(s => s.id === id ? { ...s, url } : s);
    onUpdateProfile({ social_links: updated });
  };

  // Handlers for Business Hours
  const updateHourDay = (index: number, patch: Partial<typeof profile.business_hours[0]>) => {
    const updated = [...profile.business_hours];
    updated[index] = { ...updated[index], ...patch };
    onUpdateProfile({ business_hours: updated });
  };

  // Handlers for Services
  const addService = () => {
    const newService: ProfileService = {
      id: `s_${Date.now()}`,
      title: 'New Enterprise Service',
      description: 'Comprehensive solution tailored to modern business requirements.',
      starting_price: 25000,
      cta_text: 'Enquire Now',
      enabled: true
    };
    onUpdateProfile({ services: [...profile.services, newService] });
  };

  const removeService = (id: string) => {
    onUpdateProfile({ services: profile.services.filter(s => s.id !== id) });
  };

  const updateService = (id: string, patch: Partial<ProfileService>) => {
    onUpdateProfile({
      services: profile.services.map(s => s.id === id ? { ...s, ...patch } : s)
    });
  };

  // Handlers for Products featured in Shop
  const toggleProductInShop = (productId: number) => {
    const current = profile.product_ids || [];
    const exists = current.includes(productId);
    const updated = exists ? current.filter(id => id !== productId) : [...current, productId];
    onUpdateProfile({ product_ids: updated });
  };

  // Handlers for Offers
  const addOffer = () => {
    const newOffer: ProfileOffer = {
      id: `o_${Date.now()}`,
      title: 'Special Discount Package',
      description: 'Exclusive bundle pricing available for a limited duration.',
      original_price: 50000,
      offer_price: 38000,
      valid_until: new Date(Date.now() + 30 * 86400000).toISOString(),
      cta_text: 'Claim Offer',
      enabled: true
    };
    onUpdateProfile({ offers: [...(profile.offers || []), newOffer] });
  };

  const removeOffer = (id: string) => {
    onUpdateProfile({ offers: (profile.offers || []).filter(o => o.id !== id) });
  };

  const updateOffer = (id: string, patch: Partial<ProfileOffer>) => {
    onUpdateProfile({
      offers: (profile.offers || []).map(o => o.id === id ? { ...o, ...patch } : o)
    });
  };

  // Handlers for Catalogues
  const addCatalogue = () => {
    const newCat: ProfileCatalogue = {
      id: `cat_${Date.now()}`,
      title: 'Product & Service Deck',
      description: 'Comprehensive catalogue of our capabilities and pricing.',
      file_url: 'https://example.com/catalogue.pdf',
      file_size: '3.2 MB PDF',
      enabled: true
    };
    onUpdateProfile({ catalogues: [...(profile.catalogues || []), newCat] });
  };

  const removeCatalogue = (id: string) => {
    onUpdateProfile({ catalogues: (profile.catalogues || []).filter(c => c.id !== id) });
  };

  const updateCatalogue = (id: string, patch: Partial<ProfileCatalogue>) => {
    onUpdateProfile({
      catalogues: (profile.catalogues || []).map(c => c.id === id ? { ...c, ...patch } : c)
    });
  };

  // Section Renderers
  const renderEditorContent = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={styles.label}>Business / Organization Name *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.business_name}
                  onChange={(e) => handleTextChange('business_name', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Primary Contact Person *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.person_name}
                  onChange={(e) => handleTextChange('person_name', e.target.value)}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={styles.label}>Designation / Professional Title</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.designation}
                  onChange={(e) => handleTextChange('designation', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Business Category / Industry</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.business_category}
                  onChange={(e) => handleTextChange('business_category', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>Short Tagline / Catchphrase (1-2 sentences)</label>
              <input
                type="text"
                style={styles.input}
                value={profile.short_description}
                onChange={(e) => handleTextChange('short_description', e.target.value)}
              />
            </div>

            <div>
              <label style={styles.label}>About Business (Full Narrative)</label>
              <textarea
                rows={4}
                style={{ ...styles.input, height: 'auto' }}
                value={profile.about}
                onChange={(e) => handleTextChange('about', e.target.value)}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 14,
              marginTop: 6
            }}>
              <div>
                <label style={styles.label}>Profile Avatar Photo URL</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.profile_photo_url}
                  onChange={(e) => handleTextChange('profile_photo_url', e.target.value)}
                />
                <img src={profile.profile_photo_url} alt="Profile" style={styles.thumbPreview} />
              </div>

              <div>
                <label style={styles.label}>Business Logo URL</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.business_logo_url}
                  onChange={(e) => handleTextChange('business_logo_url', e.target.value)}
                />
                <img src={profile.business_logo_url} alt="Logo" style={styles.thumbPreview} />
              </div>

              <div>
                <label style={styles.label}>Cover Banner URL</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.cover_banner_url}
                  onChange={(e) => handleTextChange('cover_banner_url', e.target.value)}
                />
                <img src={profile.cover_banner_url} alt="Cover" style={styles.thumbPreview} />
              </div>
            </div>
          </div>
        );

      case 'contact':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={styles.label}>Official Phone Number (Call Action) *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.phone}
                  onChange={(e) => handleTextChange('phone', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>WhatsApp Phone (with Country Code) *</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.whatsapp}
                  onChange={(e) => handleTextChange('whatsapp', e.target.value)}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={styles.label}>Official Email Address *</label>
                <input
                  type="email"
                  style={styles.input}
                  value={profile.email}
                  onChange={(e) => handleTextChange('email', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Website URL *</label>
                <input
                  type="url"
                  style={styles.input}
                  value={profile.website}
                  onChange={(e) => handleTextChange('website', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label style={styles.label}>Street Address & Building</label>
              <input
                type="text"
                style={styles.input}
                value={profile.address}
                onChange={(e) => handleTextChange('address', e.target.value)}
              />
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
              gap: 12
            }}>
              <div>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.city}
                  onChange={(e) => handleTextChange('city', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.state}
                  onChange={(e) => handleTextChange('state', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Pincode</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.pincode}
                  onChange={(e) => handleTextChange('pincode', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Country</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.country}
                  onChange={(e) => handleTextChange('country', e.target.value)}
                />
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 16
            }}>
              <div>
                <label style={styles.label}>Google Maps Destination URL</label>
                <input
                  type="url"
                  style={styles.input}
                  placeholder="https://maps.google.com/?q=..."
                  value={profile.google_maps_url}
                  onChange={(e) => handleTextChange('google_maps_url', e.target.value)}
                />
              </div>
              <div>
                <label style={styles.label}>Google Review URL ("Review Us")</label>
                <input
                  type="url"
                  style={styles.input}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  value={profile.google_review_url}
                  onChange={(e) => handleTextChange('google_review_url', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'hours':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 8px 0' }}>
              Configure operational schedule. The public profile automatically detects whether your office is <strong>Open Now</strong> or <strong>Closed</strong> in real time.
            </p>

            {profile.business_hours.map((h, idx) => (
              <div 
                key={h.day}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#FFFFFF',
                  padding: '12px 16px',
                  borderRadius: 10,
                  border: '1px solid #E2E8F0',
                  gap: 12,
                  flexWrap: isMobile ? 'wrap' : 'nowrap'
                }}
              >
                <div style={{ width: 110, fontWeight: 700, color: '#0B1F3A', fontSize: 13.5 }}>
                  {h.day}
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={!h.is_closed}
                    onChange={(e) => updateHourDay(idx, { is_closed: !e.target.checked })}
                  />
                  <span style={{ fontWeight: 600, color: !h.is_closed ? '#00A86B' : '#EF1D2D' }}>
                    {!h.is_closed ? 'Open' : 'Closed'}
                  </span>
                </label>

                {!h.is_closed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
                    <input
                      type="time"
                      value={h.open_time}
                      onChange={(e) => updateHourDay(idx, { open_time: e.target.value })}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5 }}
                    />
                    <span style={{ color: '#94A3B8' }}>to</span>
                    <input
                      type="time"
                      value={h.close_time}
                      onChange={(e) => updateHourDay(idx, { close_time: e.target.value })}
                      style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #CBD5E1', fontSize: 12.5 }}
                    />
                  </div>
                ) : (
                  <span style={{ fontSize: 12, color: '#94A3B8', fontStyle: 'italic', marginLeft: 'auto' }}>
                    Closed all day
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'social':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 8px 0' }}>
              Enable and customize official social media channels. Enabled channels appear prominently on your public profile with official brand icons.
            </p>

            {profile.social_links.map(s => (
              <div 
                key={s.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 14,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  flexWrap: isMobile ? 'wrap' : 'nowrap'
                }}
              >
                <div style={{ width: 110, fontSize: 13.5, fontWeight: 700, color: '#0B1F3A', textTransform: 'capitalize' }}>
                  {s.platform}
                </div>

                <div style={{ flex: 1, minWidth: 200 }}>
                  <input
                    type="url"
                    style={{ ...styles.input, marginBottom: 0 }}
                    value={s.url}
                    placeholder={`https://${s.platform}.com/...`}
                    onChange={(e) => updateSocialUrl(s.id, e.target.value)}
                  />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={s.enabled}
                    onChange={() => toggleSocialLink(s.id)}
                  />
                  <span style={{ fontWeight: 600, color: s.enabled ? '#1565E8' : '#94A3B8' }}>
                    {s.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>
            ))}
          </div>
        );

      case 'services':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>
                Showcase bespoke offerings, pricing, and consultation packages.
              </span>
              <button
                onClick={addService}
                style={styles.addBtn}
              >
                <Plus size={15} /> Add Service
              </button>
            </div>

            {profile.services.map((serv, index) => (
              <div 
                key={serv.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#1565E8' }}>SERVICE #{index + 1}</span>
                  <button 
                    onClick={() => removeService(serv.id)} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF1D2D' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: 12 }}>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="Service Title"
                    value={serv.title}
                    onChange={(e) => updateService(serv.id, { title: e.target.value })}
                  />
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Starting Price (₹)"
                    value={serv.starting_price || ''}
                    onChange={(e) => updateService(serv.id, { starting_price: Number(e.target.value) })}
                  />
                </div>

                <textarea
                  rows={2}
                  style={{ ...styles.input, height: 'auto' }}
                  placeholder="Service description and scope..."
                  value={serv.description}
                  onChange={(e) => updateService(serv.id, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        );

      case 'shop':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{
              backgroundColor: '#EEF4FF',
              padding: 14,
              borderRadius: 10,
              fontSize: 13,
              color: '#0E4BB5',
              lineHeight: 1.5
            }}>
              <strong>CRM Connected Inventory:</strong> Select which products from your central CRM product database should be featured on the Digital Profile Shop. Enquiries submitted by visitors instantly generate CRM Leads with the product attached!
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {products.map(prod => {
                const isFeatured = profile.product_ids?.includes(prod.id);
                return (
                  <div 
                    key={prod.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: 12,
                      padding: 14,
                      border: `1px solid ${isFeatured ? '#1565E8' : '#E2E8F0'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img 
                        src={prod.image_url} 
                        alt={prod.name} 
                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }} 
                      />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0B1F3A' }}>
                          {prod.name}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#64748B' }}>
                          {prod.category} • ₹{(prod.discount_price || prod.unit_price).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>

                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={() => toggleProductInShop(prod.id)}
                      />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: isFeatured ? '#1565E8' : '#94A3B8' }}>
                        {isFeatured ? 'Featured in Shop' : 'Hidden'}
                      </span>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'offers':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>
                Create festive deals, flash sales, and limited-time bundle promotions.
              </span>
              <button onClick={addOffer} style={styles.addBtn}>
                <Plus size={15} /> Add Offer
              </button>
            </div>

            {(profile.offers || []).map(offer => (
              <div 
                key={offer.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#EF1D2D' }}>LIMITED OFFER</span>
                  <button 
                    onClick={() => removeOffer(offer.id)} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF1D2D' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <input
                  type="text"
                  style={styles.input}
                  placeholder="Offer Title"
                  value={offer.title}
                  onChange={(e) => updateOffer(offer.id, { title: e.target.value })}
                />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Original Price"
                    value={offer.original_price}
                    onChange={(e) => updateOffer(offer.id, { original_price: Number(e.target.value) })}
                  />
                  <input
                    type="number"
                    style={styles.input}
                    placeholder="Deal Price"
                    value={offer.offer_price}
                    onChange={(e) => updateOffer(offer.id, { offer_price: Number(e.target.value) })}
                  />
                  <input
                    type="date"
                    style={styles.input}
                    value={offer.valid_until.split('T')[0]}
                    onChange={(e) => updateOffer(offer.id, { valid_until: `${e.target.value}T23:59:59Z` })}
                  />
                </div>

                <textarea
                  rows={2}
                  style={{ ...styles.input, height: 'auto' }}
                  placeholder="Offer terms & description..."
                  value={offer.description}
                  onChange={(e) => updateOffer(offer.id, { description: e.target.value })}
                />
              </div>
            ))}
          </div>
        );

      case 'catalogue':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#64748B' }}>
                Upload or link downloadable company catalogues, brochures, and rate cards.
              </span>
              <button onClick={addCatalogue} style={styles.addBtn}>
                <Plus size={15} /> Add Catalogue
              </button>
            </div>

            {(profile.catalogues || []).map(cat => (
              <div 
                key={cat.id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  padding: 16,
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 800, color: '#D97706' }}>PDF DOCUMENT</span>
                  <button 
                    onClick={() => removeCatalogue(cat.id)} 
                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF1D2D' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <input
                  type="text"
                  style={styles.input}
                  placeholder="Catalogue Title"
                  value={cat.title}
                  onChange={(e) => updateCatalogue(cat.id, { title: e.target.value })}
                />

                <input
                  type="url"
                  style={styles.input}
                  placeholder="PDF Download / File URL"
                  value={cat.file_url}
                  onChange={(e) => updateCatalogue(cat.id, { file_url: e.target.value })}
                />
              </div>
            ))}
          </div>
        );

      case 'upi_wifi':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* UPI Section */}
            <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: '0 0 10px 0' }}>
                UPI Direct Settlement
              </h3>
              <p style={{ fontSize: 12.5, color: '#64748B', margin: '0 0 14px 0' }}>
                Allow profile visitors to transfer funds directly via Google Pay, PhonePe, Paytm, or BHIM.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                <div>
                  <label style={styles.label}>UPI ID / VPA *</label>
                  <input
                    type="text"
                    style={styles.input}
                    placeholder="company@hdfcbank"
                    value={profile.upi_id}
                    onChange={(e) => handleTextChange('upi_id', e.target.value)}
                  />
                </div>
                <div>
                  <label style={styles.label}>Payee / Registered Business Name</label>
                  <input
                    type="text"
                    style={styles.input}
                    value={profile.upi_name}
                    onChange={(e) => handleTextChange('upi_name', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Wi-Fi Section */}
            <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
                  Office Guest Wi-Fi Access
                </h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile.wifi_enabled}
                    onChange={(e) => handleTextChange('wifi_enabled', e.target.checked)}
                  />
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: profile.wifi_enabled ? '#00A86B' : '#94A3B8' }}>
                    {profile.wifi_enabled ? 'Displayed' : 'Hidden'}
                  </span>
                </label>
              </div>

              {profile.wifi_enabled && (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={styles.label}>Network SSID Name</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={profile.wifi_ssid}
                      onChange={(e) => handleTextChange('wifi_ssid', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Network Password</label>
                    <input
                      type="text"
                      style={styles.input}
                      value={profile.wifi_password}
                      onChange={(e) => handleTextChange('wifi_password', e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'theme_seo':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Theme Selector */}
            <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: '0 0 12px 0' }}>
                Profile Theme & Visual Identity
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: 10, marginBottom: 16 }}>
                {(['professional', 'minimal', 'corporate', 'modern', 'creative'] as ProfileTheme[]).map(t => {
                  const isSelected = profile.theme === t;
                  return (
                    <button
                      key={t}
                      onClick={() => handleTextChange('theme', t)}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 10,
                        border: `2px solid ${isSelected ? '#1565E8' : '#E2E8F0'}`,
                        backgroundColor: isSelected ? '#EEF4FF' : '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 800, color: isSelected ? '#1565E8' : '#0B1F3A', textTransform: 'capitalize' }}>
                        {t}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div>
                <label style={styles.label}>Primary Brand Color</label>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {['#1565E8', '#00A86B', '#0B1F3A', '#7C3AED', '#EA580C'].map(c => (
                    <button
                      key={c}
                      onClick={() => handleTextChange('primary_color', c)}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: profile.primary_color === c ? '3px solid #000' : 'none',
                        cursor: 'pointer'
                      }}
                    />
                  ))}
                  <input
                    type="text"
                    style={{ ...styles.input, width: 110, marginBottom: 0 }}
                    value={profile.primary_color}
                    onChange={(e) => handleTextChange('primary_color', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Custom URL Slug & SEO */}
            <div style={{ backgroundColor: '#FFFFFF', padding: 18, borderRadius: 12, border: '1px solid #E2E8F0' }}>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0B1F3A', margin: '0 0 12px 0' }}>
                Custom URL Slug & Search Engine Optimization
              </h3>

              <div style={{ marginBottom: 14 }}>
                <label style={styles.label}>Public Profile URL Slug *</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: '#F1F5F9',
                    padding: '10px 12px',
                    borderRadius: '8px 0 0 8px',
                    border: '1px solid #CBD5E1',
                    borderRight: 'none',
                    fontSize: 13,
                    color: '#64748B'
                  }}>
                    /p/
                  </span>
                  <input
                    type="text"
                    style={{ ...styles.input, borderRadius: '0 8px 8px 0', marginBottom: 0 }}
                    value={profile.slug}
                    onChange={(e) => handleTextChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ''))}
                  />
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={styles.label}>SEO Page Meta Title</label>
                <input
                  type="text"
                  style={styles.input}
                  value={profile.seo_title}
                  onChange={(e) => handleTextChange('seo_title', e.target.value)}
                />
              </div>

              <div>
                <label style={styles.label}>SEO Meta Description</label>
                <textarea
                  rows={2}
                  style={{ ...styles.input, height: 'auto' }}
                  value={profile.seo_description}
                  onChange={(e) => handleTextChange('seo_description', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ padding: 20, textAlign: 'center', color: '#64748B' }}>
            Section editor under development.
          </div>
        );
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      width: '100%',
      backgroundColor: '#F8FAFC',
      overflow: 'hidden'
    }}>
      {/* COLUMN 1: LEFT NAVIGATION (Desktop / Tablet) */}
      {!isMobile && (
        <div style={{
          width: 220,
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{ padding: '16px 14px 10px', fontSize: 11, fontWeight: 800, color: '#94A3B8', letterSpacing: 0.8 }}>
            PROFILE SECTIONS
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 16px' }}>
            {sections.map(sec => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.key;
              return (
                <button
                  key={sec.key}
                  onClick={() => setActiveSection(sec.key)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: isActive ? '#EEF4FF' : 'transparent',
                    color: isActive ? '#1565E8' : '#334155',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13,
                    cursor: 'pointer',
                    marginBottom: 3,
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Icon size={16} color={isActive ? '#1565E8' : '#64748B'} />
                    <span>{sec.label}</span>
                  </div>
                  {sec.count !== undefined && (
                    <span style={{
                      fontSize: 10.5,
                      fontWeight: 700,
                      backgroundColor: isActive ? '#1565E8' : '#F1F5F9',
                      color: isActive ? '#FFFFFF' : '#64748B',
                      padding: '2px 6px',
                      borderRadius: 10
                    }}>
                      {sec.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* COLUMN 2: CENTER FORM / SECTION EDITOR */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        borderRight: isMobile ? 'none' : '1px solid #E2E8F0'
      }}>
        {/* Editor Sub-Header */}
        <div style={{
          padding: '16px 20px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0B1F3A', margin: 0 }}>
              {sections.find(s => s.key === activeSection)?.label}
            </h3>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              Live reactivity enabled • Updates reflect in simulator immediately
            </span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {isMobile && (
              <button
                onClick={() => setMobilePreviewModal(true)}
                style={{
                  backgroundColor: '#0B1F3A',
                  color: '#FFFFFF',
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Smartphone size={14} /> Preview
              </button>
            )}

            {onPublish && (
              <button
                onClick={onPublish}
                style={{
                  backgroundColor: profile.status === 'published' ? '#00A86B' : '#1565E8',
                  color: '#FFFFFF',
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <CheckCircle size={15} />
                <span>{profile.status === 'published' ? 'Published' : 'Publish Profile'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Section Selector Tabs */}
        {isMobile && (
          <div style={{
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            padding: '10px 12px',
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0'
          }}>
            {sections.map(sec => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '6px 12px',
                  borderRadius: 16,
                  border: 'none',
                  fontSize: 12,
                  fontWeight: 700,
                  backgroundColor: activeSection === sec.key ? '#1565E8' : '#F1F5F9',
                  color: activeSection === sec.key ? '#FFFFFF' : '#475569'
                }}
              >
                {sec.label}
              </button>
            ))}
          </div>
        )}

        {/* Scrollable Form Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 14 : 24 }}>
          {renderEditorContent()}
        </div>
      </div>

      {/* COLUMN 3: RIGHT LIVE MOBILE PREVIEW (Desktop Only) */}
      {!isMobile && (
        <div style={{
          width: 440,
          backgroundColor: '#F1F5F9',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16px 12px',
          overflowY: 'auto',
          flexShrink: 0
        }}>
          {/* Top Preview Controls */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: 375,
            marginBottom: 10
          }}>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#64748B', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Smartphone size={15} color="#1565E8" /> LIVE MOBILE SIMULATOR
            </span>

            <a
              href={`/p/${profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1565E8',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>Public Link</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Simulated Mobile Device Frame (iPhone 14 / Android) */}
          <div style={{
            width: 375,
            height: 720,
            backgroundColor: '#FFFFFF',
            borderRadius: 36,
            boxShadow: '0 25px 60px -15px rgba(11, 31, 58, 0.35)',
            border: '10px solid #0B1F3A',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Top Phone Notch / Dynamic Island */}
            <div style={{
              height: 24,
              backgroundColor: '#0B1F3A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30
            }}>
              <div style={{
                width: 90,
                height: 16,
                backgroundColor: '#000000',
                borderRadius: 10
              }} />
            </div>

            {/* Inner Phone Screen Content with Realtime Reactive Component */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#F8FAFC',
              position: 'relative'
            }}>
              <PublicProfilePage
                profile={profile}
                products={products}
                isPreview={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* MOBILE PREVIEW MODAL */}
      {isMobile && mobilePreviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FFFFFF',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            height: 50,
            padding: '0 16px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#0B1F3A',
            color: '#FFFFFF'
          }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Mobile Live Preview</span>
            <button
              onClick={() => setMobilePreviewModal(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: 13
              }}
            >
              Close
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <PublicProfilePage
              profile={profile}
              products={products}
              isPreview={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  label: {
    display: 'block',
    fontSize: 12.5,
    fontWeight: 700,
    color: '#0F172A',
    marginBottom: 5,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #CBD5E1',
    backgroundColor: '#FFFFFF',
    fontSize: 13,
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box' as any,
  },
  thumbPreview: {
    width: '100%',
    height: 70,
    objectFit: 'cover' as any,
    borderRadius: 8,
    marginTop: 6,
    border: '1px solid #E2E8F0'
  },
  addBtn: {
    backgroundColor: '#1565E8',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: 8,
    padding: '7px 14px',
    fontSize: 12.5,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 4
  }
};
