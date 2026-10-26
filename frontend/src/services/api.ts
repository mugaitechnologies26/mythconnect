import axios from 'axios';

export const API_BASE_URL = 
  (import.meta as any).env?.VITE_API_URL 
  || (typeof process !== 'undefined' && process.env?.VITE_API_URL) 
  || (typeof window !== 'undefined' && (window as any).__API_URL__) 
  || (typeof window !== 'undefined' && window.location.hostname === 'localhost' && window.location.port === '3000'
      ? 'http://localhost:5000'
      : (typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'http://localhost:5000'));

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const leadsApi = {
  getAll: (params?: any) => apiClient.get('/leads', { params }).then(r => r.data.data),
  getById: (id: number) => apiClient.get(`/leads/${id}`).then(r => r.data.data),
  create: (data: any) => apiClient.post('/leads', data).then(r => r.data.data),
  update: (id: number, patch: any) => apiClient.patch(`/leads/${id}`, patch).then(r => r.data.data),
  updateStage: (id: number, status_code: string) => apiClient.patch(`/leads/${id}/stage`, { status_code }).then(r => r.data.data),
  delete: (id: number) => apiClient.delete(`/leads/${id}`).then(r => r.data),
  addNote: (id: number, note: string) => apiClient.post(`/leads/${id}/notes`, { note }).then(r => r.data.data),
  addFollowup: (id: number, data: any) => apiClient.post(`/leads/${id}/followups`, data).then(r => r.data.data),
  convertToCustomer: (id: number) => apiClient.post(`/leads/${id}/convert`).then(r => r.data.data),
};

export const customersApi = {
  getAll: (params?: any) => apiClient.get('/customers', { params }).then(r => r.data.data),
  getById: (id: number) => apiClient.get(`/customers/${id}`).then(r => r.data.data),
  create: (data: any) => apiClient.post('/customers', data).then(r => r.data.data),
  update: (id: number, data: any) => apiClient.put(`/customers/${id}`, data).then(r => r.data.data),
  delete: (id: number) => apiClient.delete(`/customers/${id}`).then(r => r.data),
  getHistory: (id: number) => apiClient.get(`/customers/${id}/history`).then(r => r.data.data),
};

export const quotationsApi = {
  getAll: (params?: any) => apiClient.get('/quotations', { params }).then(r => r.data.data),
  getById: (id: number) => apiClient.get(`/quotations/${id}`).then(r => r.data.data),
  create: (data: any) => apiClient.post('/quotations', data).then(r => r.data.data),
  updateStatus: (id: number, status: string) => apiClient.patch(`/quotations/${id}/status`, { status }).then(r => r.data.data),
  convertToInvoice: (id: number) => apiClient.post(`/quotations/${id}/convert-to-invoice`).then(r => r.data.data),
  send: (id: number) => apiClient.post(`/quotations/${id}/send`).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/quotations/${id}`).then(r => r.data),
};

export const invoicesApi = {
  getAll: (params?: any) => apiClient.get('/invoices', { params }).then(r => r.data.data),
  getById: (id: number) => apiClient.get(`/invoices/${id}`).then(r => r.data.data),
  create: (data: any) => apiClient.post('/invoices', data).then(r => r.data.data),
  recordPayment: (id: number, data: any) => apiClient.post(`/invoices/${id}/payments`, data).then(r => r.data.data),
  delete: (id: number) => apiClient.delete(`/invoices/${id}`).then(r => r.data),
};

export const paymentsApi = {
  getAll: (params?: any) => apiClient.get('/payments', { params }).then(r => r.data.data),
};

export const followupsApi = {
  getAll: (params?: any) => apiClient.get('/followups', { params }).then(r => r.data.data),
  create: (data: any) => apiClient.post('/followups', data).then(r => r.data.data),
  complete: (id: number, outcome?: string) => apiClient.patch(`/followups/${id}/complete`, { outcome }).then(r => r.data.data),
  delete: (id: number) => apiClient.delete(`/followups/${id}`).then(r => r.data),
};

export const authApi = {
  login: (data: { email: string }) => apiClient.post('/auth/login', data).then(r => r.data),
  getCurrentUser: () => apiClient.get('/auth/user').then(r => r.data.user),
  getUsers: () => apiClient.get('/auth/users').then(r => r.data.users),
  switchRole: (role: string) => apiClient.post('/auth/switch-role', { role }).then(r => r.data.user),
};

export const notificationsApi = {
  getAll: (params?: any) => apiClient.get('/notifications', { params }).then(r => r.data.data),
  markAsRead: (id: number) => apiClient.patch(`/notifications/${id}/read`).then(r => r.data.data),
  markAllAsRead: (userId?: number) => apiClient.post('/notifications/read-all', { user_id: userId }).then(r => r.data),
  create: (data: any) => apiClient.post('/notifications', data).then(r => r.data.data),
};

export const whatsappApi = {
  getConversations: () => apiClient.get('/whatsapp/conversations').then(r => r.data.data),
  getAllMessages: () => apiClient.get('/whatsapp/messages').then(r => r.data.data),
  getMessages: (conversationId: number) => apiClient.get(`/whatsapp/messages/${conversationId}`).then(r => r.data.data),
  sendMessage: (data: { phone: string; content: string; messageType?: string; conversation_id?: number }) => 
    apiClient.post('/whatsapp/messages', data).then(r => r.data.data),
  getTemplates: () => apiClient.get('/whatsapp/templates').then(r => r.data.data),
};

export const qrApi = {
  getAll: () => apiClient.get('/qr/codes').then(r => r.data.data),
  generate: (data: any) => apiClient.post('/qr/generate', data).then(r => r.data.data),
  update: (id: number, data: any) => apiClient.patch(`/qr/codes/${id}`, data).then(r => r.data.data),
  delete: (id: number) => apiClient.delete(`/qr/codes/${id}`).then(r => r.data),
};

export const reportsApi = {
  getKpis: () => apiClient.get('/reports/kpis').then(r => r.data.data),
  getSources: () => apiClient.get('/reports/sources').then(r => r.data.data),
  getFunnel: () => apiClient.get('/reports/funnel').then(r => r.data.data),
  getSalespeople: () => apiClient.get('/reports/salespeople').then(r => r.data.data),
};

export const digitalProfileApi = {
  getProfile: (slug?: string) => apiClient.get('/digital-profile', { params: { slug } }).then(r => r.data.data),
  updateProfile: (data: any) => apiClient.put('/digital-profile', data).then(r => r.data.data),
  trackEvent: (data: { event_type: string; target_id?: string; device?: string }) => 
    apiClient.post('/digital-profile/events', data).then(r => r.data.data),
  submitEnquiry: (data: any) => apiClient.post('/digital-profile/enquiries', data).then(r => r.data.data),
  getProducts: () => apiClient.get('/digital-profile/products').then(r => r.data.data),
  createProduct: (data: any) => apiClient.post('/digital-profile/products', data).then(r => r.data.data),
  updateProduct: (id: number, data: any) => apiClient.put(`/digital-profile/products/${id}`, data).then(r => r.data.data),
  deleteProduct: (id: number) => apiClient.delete(`/digital-profile/products/${id}`).then(r => r.data),
};

export const settingsApi = {
  getSettings: () => apiClient.get('/settings').then(r => r.data.data),
  updateSettings: (data: any) => apiClient.post('/settings', data).then(r => r.data.data),
};

export const simulationApi = {
  simulateMetaLead: async (data: {
    name: string;
    phone: string;
    email: string;
    company_name: string;
    campaign_name?: string;
    ad_name?: string;
    estimated_value?: number;
    city?: string;
    state?: string;
  }) => {
    return axios.post(`${API_BASE_URL}/simulation/meta-lead`, data);
  },

  simulateWhatsAppReply: async (data: {
    phone: string;
    name: string;
    content: string;
  }) => {
    return axios.post(`${API_BASE_URL}/simulation/whatsapp-reply`, data);
  },
};
