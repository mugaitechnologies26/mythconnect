// Myth Connect.ai - Core Domain Models & Types

export type RoleType = 'super_admin' | 'admin' | 'sales_manager' | 'sales_executive' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: RoleType;
  role_display: string;
  avatar_url?: string;
  team_name?: string;
  is_active: boolean;
}

export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Lead {
  id: number;
  lead_code: string;
  name: string;
  phone: string;
  email: string;
  company_name: string;
  source_id: number;
  source_name: string;
  source_code: 'meta' | 'whatsapp' | 'website' | 'referral' | 'manual' | 'digital_profile' | 'digital_profile_shop' | 'qr';
  status_id: number;
  status_code: 'new' | 'contacted' | 'qualified' | 'quotation' | 'negotiation' | 'won' | 'lost';
  status_name: string;
  status_color: string;
  assigned_to: number;
  assigned_user_name: string;
  assigned_user_avatar?: string;
  estimated_value: number;
  priority: LeadPriority;
  city?: string;
  state?: string;
  meta_lead_id?: string;
  meta_campaign_name?: string;
  meta_ad_name?: string;
  customer_id?: number;
  attached_product_id?: number;
  attached_product_name?: string;
  enquiry_quantity?: number;
  profile_id?: number;
  qr_id?: string;
  public_url?: string;
  referrer?: string;
  created_at: string;
  last_activity_at?: string;
  next_followup_at?: string;
}

export interface LeadActivity {
  id: number;
  lead_id: number;
  user_name: string;
  type: 'lead_created' | 'whatsapp_sent' | 'whatsapp_received' | 'call_made' | 'quote_sent' | 'quote_accepted' | 'deal_won' | 'status_changed' | 'note_added';
  title: string;
  description: string;
  created_at: string;
}

export interface Customer {
  id: number;
  customer_code: string;
  name: string;
  company_name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gstin?: string;
  total_orders: number;
  total_revenue: number;
  outstanding_balance: number;
  assigned_to?: number;
  assigned_user_name?: string;
  created_at: string;
}

export type FollowupType = 'call' | 'whatsapp' | 'meeting' | 'email' | 'other';
export type FollowupStatus = 'pending' | 'completed' | 'cancelled';

export interface Followup {
  id: number;
  lead_id: number;
  lead_name: string;
  lead_phone: string;
  lead_company: string;
  assigned_to: number;
  assigned_user_name: string;
  scheduled_at: string;
  type: FollowupType;
  status: FollowupStatus;
  notes: string;
  created_at: string;
}

export interface QuotationItem {
  id?: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  discount_percent: number;
  tax_rate: number;
  total: number;
}

export type QuotationStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired';

export interface Quotation {
  id: number;
  quotation_number: string;
  lead_id?: number;
  lead_name?: string;
  customer_id?: number;
  customer_name: string;
  customer_company: string;
  customer_email: string;
  customer_phone: string;
  customer_address?: string;
  customer_gstin?: string;
  quotation_date: string;
  valid_until: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  status: QuotationStatus;
  notes?: string;
  terms_and_conditions?: string;
  items: QuotationItem[];
  created_at: string;
}

export type InvoicePaymentStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: number;
  invoice_number: string;
  quotation_id?: number;
  customer_id: number;
  customer_name: string;
  customer_company: string;
  customer_email: string;
  customer_phone: string;
  customer_gstin?: string;
  invoice_date: string;
  due_date: string;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  grand_total: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: InvoicePaymentStatus;
  notes?: string;
  items: QuotationItem[];
  created_at: string;
}

export interface Payment {
  id: number;
  payment_number: string;
  invoice_id: number;
  invoice_number: string;
  customer_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'upi' | 'bank_transfer' | 'card' | 'other';
  reference_number?: string;
  notes?: string;
  recorded_by_name: string;
  created_at: string;
}

export type WhatsAppMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface WhatsAppMessage {
  id: number;
  conversation_id: number;
  wamid: string;
  sender_type: 'customer' | 'agent' | 'system';
  sender_id?: number;
  sender_name?: string;
  phone?: string;
  message_type: 'text' | 'template' | 'image' | 'document' | 'interactive';
  content: string;
  media_url?: string;
  status: WhatsAppMessageStatus;
  created_at: string;
}

export interface WhatsAppConversation {
  id: number;
  phone: string;
  name: string;
  lead_id?: number;
  customer_id?: number;
  assigned_to?: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  status?: string;
  avatar?: string;
}

export interface WhatsAppTemplate {
  id: number;
  name: string;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  body_text: string;
  footer_text?: string;
  variables: string[];
}

export type QrType = 'website' | 'whatsapp' | 'phone' | 'email' | 'text' | 'upi' | 'lead_form' | 'custom_url' | 'digital_profile';

export interface QrCodeRecord {
  id: number;
  qr_code_id: string;
  title: string;
  qr_type: QrType;
  payload_data: string;
  target_url?: string;
  profile_id?: number;
  scan_count: number;
  download_count: number;
  foreground_color: string;
  background_color: string;
  created_at: string;
}

export interface AppNotification {
  id: number;
  user_id?: number;
  type: string;
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardKPIs {
  totalLeads: number;
  newLeads: number;
  followupsToday: number;
  convertedLeads: number;
  conversionRate: number;
  revenue: number;
  pendingQuotations: number;
  pendingPayments: number;
}

// -------------------------------------------------------------
// PRODUCT SYSTEM (CRM REUSABLE PRODUCT MODEL)
// -------------------------------------------------------------
export interface Product {
  id: number;
  item_code: string;
  name: string;
  type: 'product' | 'service';
  description: string;
  unit: string;
  unit_price: number;
  discount_price?: number;
  tax_rate: number;
  hsn_sac?: string;
  image_url: string;
  gallery_images?: string[];
  category: string;
  in_stock: boolean;
  is_active: boolean;
}

// -------------------------------------------------------------
// DIGITAL PROFILE DOMAIN MODELS
// -------------------------------------------------------------
export type ProfileTheme = 'professional' | 'minimal' | 'corporate' | 'modern' | 'creative';
export type ProfileStatus = 'draft' | 'published' | 'unpublished';

export interface SocialLink {
  id: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'linkedin' | 'twitter' | 'whatsapp' | 'website' | 'custom';
  url: string;
  display_name: string;
  enabled: boolean;
  display_order: number;
}

export interface BusinessHourDay {
  day: string;
  is_closed: boolean;
  open_time: string;
  close_time: string;
}

export interface ProfileService {
  id: string;
  title: string;
  description: string;
  starting_price?: number;
  icon_name?: string;
  image_url?: string;
  cta_text?: string;
  enabled: boolean;
}

export interface ProfileCatalogue {
  id: string;
  title: string;
  description: string;
  file_url: string;
  cover_image?: string;
  file_size?: string;
  enabled: boolean;
}

export interface ProfilePortfolioItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: string;
  url?: string;
  enabled: boolean;
}

export interface ProfileTestimonial {
  id: string;
  customer_name: string;
  designation: string;
  photo_url?: string;
  review: string;
  rating: number;
  enabled: boolean;
}

export interface ProfileAchievement {
  id: string;
  title: string;
  value: string;
  description: string;
  icon_name?: string;
  enabled: boolean;
}

export interface ProfileOffer {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  original_price: number;
  offer_price: number;
  valid_until: string;
  cta_text: string;
  enabled: boolean;
}

export interface ProfileCustomLink {
  id: string;
  title: string;
  url: string;
  icon?: string;
  description?: string;
  enabled: boolean;
}

export interface DigitalProfile {
  id: number;
  slug: string;
  status: ProfileStatus;
  business_name: string;
  person_name: string;
  designation: string;
  business_category: string;
  short_description: string;
  about: string;
  profile_photo_url: string;
  business_logo_url: string;
  cover_banner_url: string;
  
  // Contact
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  
  // Address & Maps
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  google_maps_url: string;
  google_review_url: string;
  
  // Business hours
  business_hours: BusinessHourDay[];
  
  // Sections
  social_links: SocialLink[];
  services: ProfileService[];
  product_ids: number[];
  catalogues: ProfileCatalogue[];
  portfolio: ProfilePortfolioItem[];
  testimonials: ProfileTestimonial[];
  achievements: ProfileAchievement[];
  offers: ProfileOffer[];
  custom_links: ProfileCustomLink[];
  
  // UPI
  upi_id: string;
  upi_name: string;
  
  // Wi-Fi
  wifi_enabled: boolean;
  wifi_ssid: string;
  wifi_password: string;
  wifi_security: 'WPA2' | 'WPA3' | 'WEP' | 'Open';
  
  // Apps
  play_store_url: string;
  app_store_url: string;
  
  // Customization & Theme
  theme: ProfileTheme;
  primary_color: string;
  secondary_color: string;
  button_style: 'rounded' | 'pill' | 'sharp';
  card_style: 'elevated' | 'bordered' | 'glassmorphic';
  
  // SEO
  seo_title: string;
  seo_description: string;
  seo_og_image: string;
  seo_indexing: boolean;
  
  // QR Integration
  smart_qr_id: string;
  
  // Analytics Counters
  views_count: number;
  unique_visitors: number;
  qr_scans_count: number;
  enquiries_count: number;
  
  // CTA Clicks Breakdown
  clicks_whatsapp: number;
  clicks_call: number;
  clicks_email: number;
  clicks_website: number;
  clicks_directions: number;
  clicks_vcard: number;
  clicks_share: number;
  clicks_review: number;
  clicks_catalogue: number;
  clicks_shop: number;
  clicks_upi: number;
  clicks_wifi: number;
  clicks_app_store: number;
  clicks_social: number;
  
  created_at: string;
  updated_at: string;
}

export interface ProfileAnalyticsEvent {
  id: number;
  profile_id: number;
  event_type: 
    | 'view' 
    | 'qr_scan' 
    | 'whatsapp_click' 
    | 'call_click' 
    | 'email_click' 
    | 'website_click' 
    | 'map_click' 
    | 'vcard_click' 
    | 'share_click' 
    | 'review_click' 
    | 'catalogue_view' 
    | 'catalogue_click' 
    | 'shop_view' 
    | 'product_view' 
    | 'product_enquiry' 
    | 'profile_enquiry' 
    | 'upi_click' 
    | 'wifi_click' 
    | 'app_download_click' 
    | 'social_click';
  target_id?: string;
  device?: string;
  timestamp: string;
}
