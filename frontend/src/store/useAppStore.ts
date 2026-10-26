import { create } from 'zustand';
import { 
  User, Lead, Customer, Quotation, Invoice, Payment, Followup, 
  WhatsAppConversation, WhatsAppMessage, WhatsAppTemplate, QrCodeRecord, 
  AppNotification, DashboardKPIs, Product, DigitalProfile, ProfileAnalyticsEvent 
} from '../types';
import { 
  leadsApi, customersApi, quotationsApi, invoicesApi, paymentsApi, 
  followupsApi, whatsappApi, qrApi, reportsApi, digitalProfileApi,
  authApi, notificationsApi, settingsApi
} from '../services/api';

export type ScreenType = 
  | 'dashboard' 
  | 'leads' 
  | 'lead_detail' 
  | 'whatsapp' 
  | 'followups' 
  | 'pipeline' 
  | 'customers' 
  | 'digital_profile'
  | 'quotations' 
  | 'invoices' 
  | 'billing' 
  | 'qr' 
  | 'reports' 
  | 'team' 
  | 'integrations' 
  | 'settings';

interface AppState {
  // Auth State
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (email: string, role?: string) => Promise<void>;
  logout: () => void;
  switchUserRole: (role: User['role']) => Promise<void>;

  // Navigation State
  activeScreen: ScreenType;
  setActiveScreen: (screen: ScreenType) => void;
  selectedLeadId: number | null;
  navigateToLeadDetail: (leadId: number) => void;
  isSidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileDrawerOpen: boolean;
  setMobileDrawerOpen: (open: boolean) => void;

  // Modals & Overlays
  isSearchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  isMetaSimModalOpen: boolean;
  setMetaSimModalOpen: (open: boolean) => void;
  activeSnackbar: { visible: boolean; message: string; type?: 'info' | 'success' | 'error' };
  showSnackbar: (message: string, type?: 'info' | 'success' | 'error') => void;
  hideSnackbar: () => void;

  // Domain Datasets (populated from MySQL database API)
  kpis: DashboardKPIs;
  leads: Lead[];
  customers: Customer[];
  followups: Followup[];
  quotations: Quotation[];
  invoices: Invoice[];
  payments: Payment[];
  conversations: WhatsAppConversation[];
  messages: Record<number, WhatsAppMessage[]>;
  templates: WhatsAppTemplate[];
  qrCodes: QrCodeRecord[];
  notifications: AppNotification[];
  products: Product[];
  digitalProfile: DigitalProfile;
  profileEvents: ProfileAnalyticsEvent[];
  settings: Record<string, any>;

  // Mutations
  addLead: (lead: Omit<Lead, 'id' | 'lead_code' | 'created_at'>) => Lead;
  updateLeadStatus: (leadId: number, status_code: Lead['status_code']) => void;
  updateLead: (leadId: number, patch: Partial<Lead>) => void;
  completeFollowup: (followupId: number) => void;
  addFollowup: (followup: Omit<Followup, 'id' | 'created_at'>) => void;
  sendWhatsAppMessage: (conversationId: number, content: string, templateName?: string) => void;
  receiveWhatsAppMessage: (phone: string, content: string, senderName?: string) => void;
  addQuotation: (quote: Omit<Quotation, 'id' | 'quotation_number' | 'created_at'>) => Quotation;
  convertQuoteToInvoice: (quotationId: number) => Invoice;
  recordPayment: (payment: Omit<Payment, 'id' | 'payment_number' | 'created_at'>) => void;
  generateQrCode: (qr: Omit<QrCodeRecord, 'id' | 'qr_code_id' | 'scan_count' | 'download_count' | 'created_at'>) => QrCodeRecord;
  deleteQrCode: (qrId: number) => void;
  renameQrCode: (qrId: number, newTitle: string) => void;
  markNotificationRead: (id: number) => void;
  markAllNotificationsRead: () => void;
  addNotification: (notification: Omit<AppNotification, 'id' | 'created_at' | 'is_read'>) => void;

  // Digital Profile & Products Mutations
  updateDigitalProfile: (patch: Partial<DigitalProfile>) => void;
  publishDigitalProfile: () => void;
  unpublishDigitalProfile: () => void;
  trackProfileEvent: (eventType: ProfileAnalyticsEvent['event_type'], targetId?: string) => void;
  submitProfileEnquiry: (data: { name: string; phone: string; email?: string; message: string; productId?: number; quantity?: number; source?: string }) => Lead;
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (productId: number, patch: Partial<Product>) => void;
  deleteProduct: (productId: number) => void;
  fetchInitialData: () => Promise<void>;
}

// Default empty profile structure
const emptyDigitalProfile: DigitalProfile = {
  id: 1,
  slug: '',
  status: 'published',
  business_name: '',
  person_name: '',
  designation: '',
  business_category: '',
  short_description: '',
  about: '',
  profile_photo_url: '',
  business_logo_url: '',
  cover_banner_url: '',
  phone: '',
  whatsapp: '',
  email: '',
  website: '',
  address: '',
  city: '',
  state: '',
  country: 'India',
  pincode: '',
  google_maps_url: '',
  google_review_url: '',
  business_hours: [],
  social_links: [],
  services: [],
  product_ids: [],
  catalogues: [],
  portfolio: [],
  testimonials: [],
  achievements: [],
  offers: [],
  custom_links: [],
  upi_id: '',
  upi_name: '',
  wifi_enabled: false,
  wifi_ssid: '',
  wifi_password: '',
  wifi_security: 'WPA2',
  play_store_url: '',
  app_store_url: '',
  theme: 'professional',
  primary_color: '#1565E8',
  secondary_color: '#0B1F3A',
  button_style: 'rounded',
  card_style: 'elevated',
  seo_title: '',
  seo_description: '',
  seo_og_image: '',
  seo_indexing: true,
  smart_qr_id: '',
  views_count: 0,
  unique_visitors: 0,
  qr_scans_count: 0,
  enquiries_count: 0,
  clicks_whatsapp: 0,
  clicks_call: 0,
  clicks_email: 0,
  clicks_website: 0,
  clicks_directions: 0,
  clicks_vcard: 0,
  clicks_share: 0,
  clicks_review: 0,
  clicks_catalogue: 0,
  clicks_shop: 0,
  clicks_upi: 0,
  clicks_wifi: 0,
  clicks_app_store: 0,
  clicks_social: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  users: [],
  isAuthenticated: true,

  login: async (email: string, role?: string) => {
    try {
      const res = await authApi.login({ email });
      if (res && res.user) {
        set({ currentUser: res.user, isAuthenticated: true });
        return;
      }
    } catch (e) {
      console.warn('API login notice:', e);
    }
    const currentUsers = get().users;
    const matched = currentUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      set({ currentUser: matched, isAuthenticated: true });
    }
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  switchUserRole: async (role: User['role']) => {
    try {
      const user = await authApi.switchRole(role);
      if (user) {
        set({ currentUser: user });
        return;
      }
    } catch (e) {
      console.warn('API switchRole notice:', e);
    }
    const currentUsers = get().users;
    const matched = currentUsers.find(u => u.role === role);
    if (matched) {
      set({ currentUser: matched });
    }
  },

  activeScreen: 'dashboard',
  setActiveScreen: (screen: ScreenType) => set({ activeScreen: screen, isMobileDrawerOpen: false }),
  selectedLeadId: 1,
  navigateToLeadDetail: (leadId: number) => set({ activeScreen: 'lead_detail', selectedLeadId: leadId, isMobileDrawerOpen: false }),

  isSidebarCollapsed: false,
  toggleSidebar: () => set(state => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed: boolean) => set({ isSidebarCollapsed: collapsed }),
  isMobileDrawerOpen: false,
  setMobileDrawerOpen: (open: boolean) => set({ isMobileDrawerOpen: open }),

  isSearchOpen: false,
  setSearchOpen: (open: boolean) => set({ isSearchOpen: open }),
  isMetaSimModalOpen: false,
  setMetaSimModalOpen: (open: boolean) => set({ isMetaSimModalOpen: open }),

  activeSnackbar: { visible: false, message: '', type: 'info' },
  showSnackbar: (message: string, type: 'info' | 'success' | 'error' = 'info') => 
    set({ activeSnackbar: { visible: true, message, type } }),
  hideSnackbar: () => set(state => ({ activeSnackbar: { ...state.activeSnackbar, visible: false } })),

  kpis: {
    totalLeads: 0,
    newLeads: 0,
    followupsToday: 0,
    convertedLeads: 0,
    conversionRate: 0,
    revenue: 0,
    pendingQuotations: 0,
    pendingPayments: 0
  },

  leads: [],
  customers: [],
  followups: [],
  quotations: [],
  invoices: [],
  payments: [],
  conversations: [],
  messages: {},
  templates: [],
  qrCodes: [],
  notifications: [],
  products: [],
  digitalProfile: emptyDigitalProfile,
  profileEvents: [],
  settings: {},

  fetchInitialData: async () => {
    try {
      const [
        kpis, leads, customers, quotations, invoices, payments,
        followups, conversations, allMessages, templates, qrCodes, digitalProfile, products,
        users, currentUser, notifications, settings
      ] = await Promise.all([
        reportsApi.getKpis().catch(() => null),
        leadsApi.getAll().catch(() => []),
        customersApi.getAll().catch(() => []),
        quotationsApi.getAll().catch(() => []),
        invoicesApi.getAll().catch(() => []),
        paymentsApi.getAll().catch(() => []),
        followupsApi.getAll().catch(() => []),
        whatsappApi.getConversations().catch(() => []),
        whatsappApi.getAllMessages().catch(() => []),
        whatsappApi.getTemplates().catch(() => []),
        qrApi.getAll().catch(() => []),
        digitalProfileApi.getProfile().catch(() => null),
        digitalProfileApi.getProducts().catch(() => []),
        authApi.getUsers().catch(() => []),
        authApi.getCurrentUser().catch(() => null),
        notificationsApi.getAll().catch(() => []),
        settingsApi.getSettings().catch(() => ({})),
      ]);

      // Group all messages by conversation_id
      const messagesMap: Record<number, WhatsAppMessage[]> = {};
      if (Array.isArray(allMessages)) {
        allMessages.forEach(msg => {
          if (!messagesMap[msg.conversation_id]) {
            messagesMap[msg.conversation_id] = [];
          }
          messagesMap[msg.conversation_id].push(msg);
        });
      }

      set(state => ({
        kpis: kpis || state.kpis,
        leads: Array.isArray(leads) ? leads : [],
        customers: Array.isArray(customers) ? customers : [],
        quotations: Array.isArray(quotations) ? quotations : [],
        invoices: Array.isArray(invoices) ? invoices : [],
        payments: Array.isArray(payments) ? payments : [],
        followups: Array.isArray(followups) ? followups : [],
        conversations: Array.isArray(conversations) ? conversations : [],
        messages: messagesMap,
        templates: Array.isArray(templates) ? templates : [],
        qrCodes: Array.isArray(qrCodes) ? qrCodes : [],
        digitalProfile: digitalProfile ? { ...state.digitalProfile, ...digitalProfile } : state.digitalProfile,
        products: Array.isArray(products) ? products : [],
        users: Array.isArray(users) ? users : [],
        currentUser: currentUser || (Array.isArray(users) && users.length > 0 ? users[0] : state.currentUser),
        notifications: Array.isArray(notifications) ? notifications : [],
        settings: settings || {},
      }));
    } catch (err) {
      console.warn('[Store] Initial data fetch notice:', err);
    }
  },

  addLead: (leadData) => {
    const currentLeads = get().leads;
    const tempId = Date.now();
    const newLead: Lead = {
      id: tempId,
      lead_code: `LEAD-2026-${String(currentLeads.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      ...leadData
    };

    set(state => ({
      leads: [newLead, ...state.leads],
      kpis: {
        ...state.kpis,
        totalLeads: state.kpis.totalLeads + 1,
        newLeads: state.kpis.newLeads + 1
      }
    }));

    // Asynchronously persist to MySQL database
    leadsApi.create(leadData).then(saved => {
      if (saved && saved.id) {
        set(state => ({
          leads: state.leads.map(l => l.id === tempId ? saved : l)
        }));
      }
    }).catch(e => console.warn('Failed to persist lead to DB:', e));

    return newLead;
  },

  updateLeadStatus: (leadId: number, status_code: Lead['status_code']) => {
    const statusMap: Record<Lead['status_code'], { name: string; color: string }> = {
      new: { name: 'New', color: '#1565E8' },
      contacted: { name: 'Contacted', color: '#3B82F6' },
      qualified: { name: 'Qualified', color: '#8B5CF6' },
      quotation: { name: 'Quotation', color: '#F5A000' },
      negotiation: { name: 'Negotiation', color: '#EC4899' },
      won: { name: 'Won', color: '#00A86B' },
      lost: { name: 'Lost', color: '#EF1D2D' }
    };

    const statusInfo = statusMap[status_code];

    set(state => {
      const updatedLeads = state.leads.map(l => {
        if (l.id === leadId) {
          return {
            ...l,
            status_code,
            status_name: statusInfo.name,
            status_color: statusInfo.color,
            last_activity_at: new Date().toISOString()
          };
        }
        return l;
      });

      const wonCount = updatedLeads.filter(l => l.status_code === 'won').length;
      return {
        leads: updatedLeads,
        kpis: {
          ...state.kpis,
          convertedLeads: wonCount,
          conversionRate: Number(((wonCount / updatedLeads.length) * 100).toFixed(1))
        }
      };
    });

    // Asynchronously update stage in MySQL
    leadsApi.updateStage(leadId, status_code).catch(e => console.warn('Failed to update lead stage in DB:', e));
  },

  updateLead: (leadId, patch) => {
    set(state => ({
      leads: state.leads.map(l => l.id === leadId ? { ...l, ...patch, last_activity_at: new Date().toISOString() } : l)
    }));
    leadsApi.update(leadId, patch).catch(e => console.warn('Failed to update lead in DB:', e));
  },

  completeFollowup: (followupId) => {
    set(state => ({
      followups: state.followups.map(f => f.id === followupId ? { ...f, status: 'completed' } : f)
    }));
    followupsApi.complete(followupId, 'Completed').catch(e => console.warn('Failed to complete followup in DB:', e));
  },

  addFollowup: (followupData) => {
    const currentFollowups = get().followups;
    const tempId = Date.now();
    const newFollowup: Followup = {
      id: tempId,
      created_at: new Date().toISOString(),
      ...followupData
    };
    set(state => ({
      followups: [newFollowup, ...state.followups]
    }));

    followupsApi.create(followupData).then(saved => {
      if (saved && saved.id) {
        set(state => ({
          followups: state.followups.map(f => f.id === tempId ? saved : f)
        }));
      }
    }).catch(e => console.warn('Failed to persist followup to DB:', e));
  },

  sendWhatsAppMessage: (conversationId, content, templateName) => {
    const newMsg: WhatsAppMessage = {
      id: Date.now(),
      conversation_id: conversationId,
      wamid: `wamid_out_${Date.now()}`,
      sender_type: templateName ? 'system' : 'agent',
      message_type: templateName ? 'template' : 'text',
      content,
      status: 'sent',
      created_at: new Date().toISOString()
    };

    set(state => {
      const convMsgs = state.messages[conversationId] || [];
      const updatedConvList = state.conversations.map(c => 
        c.id === conversationId ? { ...c, last_message: content, last_message_at: new Date().toISOString() } : c
      );
      return {
        messages: {
          ...state.messages,
          [conversationId]: [...convMsgs, newMsg]
        },
        conversations: updatedConvList
      };
    });

    const conv = get().conversations.find(c => c.id === conversationId);
    whatsappApi.sendMessage({
      conversation_id: conversationId,
      phone: conv?.phone || '+919830012345',
      content,
      messageType: templateName ? 'template' : 'text'
    }).catch(e => console.warn('Failed to send WhatsApp message via DB:', e));
  },

  receiveWhatsAppMessage: (phone, content, senderName) => {
    set(state => {
      const conv = state.conversations.find(c => c.phone === phone);
      const convId = conv ? conv.id : Date.now();
      let newConversations = [...state.conversations];

      if (!conv) {
        const newConv: WhatsAppConversation = {
          id: convId,
          phone,
          name: senderName || 'Incoming Contact',
          last_message: content,
          last_message_at: new Date().toISOString(),
          unread_count: 1,
          status: 'New Inquiry'
        };
        newConversations = [newConv, ...newConversations];
      } else {
        newConversations = newConversations.map(c => 
          c.id === convId ? { ...c, last_message: content, last_message_at: new Date().toISOString(), unread_count: c.unread_count + 1 } : c
        );
      }

      const newMsg: WhatsAppMessage = {
        id: Date.now(),
        conversation_id: convId,
        wamid: `wamid_inc_${Date.now()}`,
        sender_type: 'customer',
        sender_name: senderName || conv?.name || 'Customer',
        message_type: 'text',
        content,
        status: 'delivered',
        created_at: new Date().toISOString()
      };

      const existingMsgs = state.messages[convId] || [];

      return {
        conversations: newConversations,
        messages: {
          ...state.messages,
          [convId]: [...existingMsgs, newMsg]
        }
      };
    });
  },

  addQuotation: (quoteData) => {
    const quotes = get().quotations;
    const tempId = Date.now();
    const newQuote: Quotation = {
      id: tempId,
      quotation_number: `QT-2026-${String(quotes.length + 1).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      ...quoteData
    };

    set(state => ({
      quotations: [newQuote, ...state.quotations],
      kpis: {
        ...state.kpis,
        pendingQuotations: state.kpis.pendingQuotations + 1
      }
    }));

    quotationsApi.create(quoteData).then(saved => {
      if (saved && saved.id) {
        set(state => ({
          quotations: state.quotations.map(q => q.id === tempId ? saved : q)
        }));
      }
    }).catch(e => console.warn('Failed to persist quotation to DB:', e));

    return newQuote;
  },

  convertQuoteToInvoice: (quotationId) => {
    const quote = get().quotations.find(q => q.id === quotationId);
    if (!quote) throw new Error('Quotation not found');

    const invoices = get().invoices;
    const newInvId = invoices.length > 0 ? Math.max(...invoices.map(i => i.id)) + 1 : 1;
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const newInvoice: Invoice = {
      id: newInvId,
      invoice_number: `INV-2026-${String(newInvId).padStart(3, '0')}`,
      quotation_id: quote.id,
      customer_id: quote.customer_id || 1,
      customer_name: quote.customer_name,
      customer_company: quote.customer_company,
      customer_email: quote.customer_email,
      customer_phone: quote.customer_phone,
      customer_gstin: quote.customer_gstin,
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      subtotal: quote.subtotal,
      discount_amount: quote.discount_amount,
      tax_amount: quote.tax_amount,
      grand_total: quote.grand_total,
      paid_amount: 0,
      balance_amount: quote.grand_total,
      payment_status: 'sent',
      notes: `Converted from Quotation #${quote.quotation_number}`,
      items: quote.items,
      created_at: new Date().toISOString()
    };

    set(state => ({
      quotations: state.quotations.map(q => q.id === quotationId ? { ...q, status: 'accepted' } : q),
      invoices: [newInvoice, ...state.invoices],
      kpis: {
        ...state.kpis,
        pendingPayments: state.kpis.pendingPayments + newInvoice.grand_total
      }
    }));

    quotationsApi.convertToInvoice(quotationId).then(saved => {
      if (saved && saved.id) {
        set(state => ({
          invoices: state.invoices.map(i => i.id === newInvId ? saved : i)
        }));
      }
    }).catch(e => console.warn('Failed to convert quote in DB:', e));

    return newInvoice;
  },

  recordPayment: (paymentData) => {
    const payments = get().payments;
    const newPayId = payments.length > 0 ? Math.max(...payments.map(p => p.id)) + 1 : 1;
    const newPayment: Payment = {
      id: newPayId,
      payment_number: `PAY-2026-${String(newPayId).padStart(3, '0')}`,
      created_at: new Date().toISOString(),
      ...paymentData
    };

    set(state => {
      const updatedInvoices = state.invoices.map(inv => {
        if (inv.id === paymentData.invoice_id) {
          const newPaid = inv.paid_amount + paymentData.amount;
          const newBal = Math.max(0, inv.grand_total - newPaid);
          const newStatus: Invoice['payment_status'] = newBal <= 0 ? 'paid' : 'partially_paid';
          return {
            ...inv,
            paid_amount: newPaid,
            balance_amount: newBal,
            payment_status: newStatus
          };
        }
        return inv;
      });

      return {
        payments: [newPayment, ...state.payments],
        invoices: updatedInvoices,
        kpis: {
          ...state.kpis,
          revenue: state.kpis.revenue + paymentData.amount,
          pendingPayments: Math.max(0, state.kpis.pendingPayments - paymentData.amount)
        }
      };
    });

    invoicesApi.recordPayment(paymentData.invoice_id, paymentData).catch(e => console.warn('Failed to record payment in DB:', e));
  },

  generateQrCode: (qrData) => {
    const qrCodes = get().qrCodes;
    const tempId = Date.now();
    const newQr: QrCodeRecord = {
      id: tempId,
      qr_code_id: `QR-MCAI-${Date.now().toString().slice(-6)}`,
      scan_count: 0,
      download_count: 0,
      created_at: new Date().toISOString(),
      ...qrData
    };

    set(state => ({
      qrCodes: [newQr, ...state.qrCodes]
    }));

    qrApi.generate(qrData).then(saved => {
      if (saved && saved.id) {
        set(state => ({
          qrCodes: state.qrCodes.map(q => q.id === tempId ? saved : q)
        }));
      }
    }).catch(e => console.warn('Failed to persist QR code to DB:', e));

    return newQr;
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n)
    }));
    notificationsApi.markAsRead(id).catch(e => console.warn('Failed to mark notification read in DB:', e));
  },

  markAllNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true }))
    }));
    notificationsApi.markAllAsRead().catch(e => console.warn('Failed to mark all notifications read in DB:', e));
  },

  addNotification: (notification) => {
    const tempId = Date.now();
    const newNotif: AppNotification = {
      id: tempId,
      created_at: new Date().toISOString(),
      is_read: false,
      ...notification
    };
    set(state => ({
      notifications: [newNotif, ...state.notifications]
    }));
    notificationsApi.create(notification).catch(e => console.warn('Failed to create notification in DB:', e));
  },

  deleteQrCode: (qrId: number) => {
    set(state => ({
      qrCodes: state.qrCodes.filter(q => q.id !== qrId)
    }));
    qrApi.delete(qrId).catch(e => console.warn('Failed to delete QR from DB:', e));
  },

  renameQrCode: (qrId: number, newTitle: string) => {
    set(state => ({
      qrCodes: state.qrCodes.map(q => q.id === qrId ? { ...q, title: newTitle } : q)
    }));
    qrApi.update(qrId, { title: newTitle }).catch(e => console.warn('Failed to rename QR in DB:', e));
  },

  updateDigitalProfile: (patch: Partial<DigitalProfile>) => {
    set(state => ({
      digitalProfile: {
        ...state.digitalProfile,
        ...patch,
        updated_at: new Date().toISOString()
      }
    }));
    digitalProfileApi.updateProfile(patch).catch(e => console.warn('Failed to update digital profile in DB:', e));
  },

  publishDigitalProfile: () => {
    set(state => ({
      digitalProfile: {
        ...state.digitalProfile,
        status: 'published',
        updated_at: new Date().toISOString()
      }
    }));
    digitalProfileApi.updateProfile({ status: 'published' }).catch(e => console.warn('Failed to publish profile in DB:', e));
  },

  unpublishDigitalProfile: () => {
    set(state => ({
      digitalProfile: {
        ...state.digitalProfile,
        status: 'unpublished',
        updated_at: new Date().toISOString()
      }
    }));
    digitalProfileApi.updateProfile({ status: 'unpublished' }).catch(e => console.warn('Failed to unpublish profile in DB:', e));
  },

  trackProfileEvent: (eventType: ProfileAnalyticsEvent['event_type'], targetId?: string) => {
    const newEvent: ProfileAnalyticsEvent = {
      id: Date.now(),
      profile_id: get().digitalProfile.id,
      event_type: eventType,
      target_id: targetId,
      device: typeof window !== 'undefined' && window.innerWidth < 768 ? 'Mobile' : 'Desktop',
      timestamp: new Date().toISOString()
    };

    set(state => {
      const dp = { ...state.digitalProfile };
      if (eventType === 'view') {
        dp.views_count += 1;
        dp.unique_visitors += 1;
      } else if (eventType === 'qr_scan') {
        dp.qr_scans_count += 1;
        state.qrCodes = state.qrCodes.map(q => 
          q.qr_code_id === dp.smart_qr_id ? { ...q, scan_count: q.scan_count + 1 } : q
        );
      }
      return {
        digitalProfile: dp,
        profileEvents: [newEvent, ...state.profileEvents].slice(0, 500)
      };
    });

    digitalProfileApi.trackEvent({ event_type: eventType, target_id: targetId }).catch(e => console.warn('Failed to track event in DB:', e));
  },

  submitProfileEnquiry: (data) => {
    const currentLeads = get().leads;
    const tempId = Date.now();
    const isProduct = !!data.productId;
    const product = isProduct ? get().products.find(p => p.id === data.productId) : null;
    const dp = get().digitalProfile;

    const newLead: Lead = {
      id: tempId,
      lead_code: `LEAD-2026-${String(currentLeads.length + 1).padStart(3, '0')}`,
      name: data.name,
      phone: data.phone,
      email: data.email || `${data.name.toLowerCase().replace(/\s+/g, '')}@example.com`,
      company_name: isProduct ? `${data.name} (Enquiry: ${product?.name})` : `${data.name} (Digital Profile Visitor)`,
      source_id: 6,
      source_name: isProduct ? 'Digital Profile Shop' : 'Digital Profile',
      source_code: isProduct ? 'digital_profile_shop' : 'digital_profile',
      status_id: 1,
      status_code: 'new',
      status_name: 'New',
      status_color: '#1565E8',
      assigned_to: 4,
      assigned_user_name: 'Sneha Kulkarni',
      estimated_value: product ? (product.discount_price || product.unit_price) * (data.quantity || 1) : 45000,
      priority: 'high',
      attached_product_id: data.productId,
      attached_product_name: product?.name,
      enquiry_quantity: data.quantity || 1,
      profile_id: dp.id,
      qr_id: dp.smart_qr_id,
      public_url: `/p/${dp.slug}`,
      referrer: typeof document !== 'undefined' ? document.referrer || 'Direct Scan / Link' : 'Direct',
      created_at: new Date().toISOString(),
    };

    set(state => ({
      leads: [newLead, ...state.leads],
      digitalProfile: {
        ...state.digitalProfile,
        enquiries_count: state.digitalProfile.enquiries_count + 1
      },
      kpis: {
        ...state.kpis,
        totalLeads: state.kpis.totalLeads + 1,
        newLeads: state.kpis.newLeads + 1
      }
    }));

    digitalProfileApi.submitEnquiry(data).catch(e => console.warn('Failed to submit enquiry to DB:', e));

    return newLead;
  },

  addProduct: (productData) => {
    const tempId = Date.now();
    const newProduct: Product = {
      id: tempId,
      ...productData
    };
    set(state => ({
      products: [newProduct, ...state.products]
    }));

    digitalProfileApi.createProduct(productData).then(saved => {
      if (saved && saved.id) {
        set(state => ({
          products: state.products.map(p => p.id === tempId ? saved : p)
        }));
      }
    }).catch(e => console.warn('Failed to create product in DB:', e));

    return newProduct;
  },

  updateProduct: (productId, patch) => {
    set(state => ({
      products: state.products.map(p => p.id === productId ? { ...p, ...patch } : p)
    }));
    digitalProfileApi.updateProduct(productId, patch).catch(e => console.warn('Failed to update product in DB:', e));
  },

  deleteProduct: (productId) => {
    set(state => ({
      products: state.products.filter(p => p.id !== productId)
    }));
    digitalProfileApi.deleteProduct(productId).catch(e => console.warn('Failed to delete product in DB:', e));
  }
}));
