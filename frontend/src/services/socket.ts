import { useAppStore } from '../store/useAppStore';

class RealtimeSocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private getUrl(): string {
    if (typeof window === 'undefined') return 'ws://localhost:5000/ws';
    if ((import.meta as any).env?.VITE_WS_URL) return (import.meta as any).env.VITE_WS_URL;
    if ((window as any).__WS_URL__) return (window as any).__WS_URL__;

    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      return 'ws://localhost:5000/ws';
    }
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const socketUrl = this.getUrl();
      this.ws = new WebSocket(socketUrl);

      this.ws.onopen = () => {
        console.log('[Realtime] WebSocket connected to Myth Connect.ai Engine');
      };

      this.ws.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          this.handleEvent(packet);
        } catch (err) {
          console.error('[Realtime] Failed parsing packet:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[Realtime] WebSocket disconnected. Auto-reconnecting in 3s...');
        this.scheduleReconnect();
      };

      this.ws.onerror = (err) => {
        console.warn('[Realtime] WebSocket notice:', err);
        this.ws?.close();
      };
    } catch (e) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, 3000);
  }

  private handleEvent(packet: { event: string; data: any }) {
    const store = useAppStore.getState();

    switch (packet.event) {
      case 'lead.new': {
        const lead = packet.data.lead;
        if (lead) {
          store.addLead({
            name: lead.name,
            phone: lead.phone,
            email: lead.email,
            company_name: lead.company_name,
            source_id: 1,
            source_name: 'Meta Lead Ads',
            source_code: 'meta',
            status_id: 1,
            status_code: 'new',
            status_name: 'New',
            status_color: '#1565E8',
            assigned_to: 4,
            assigned_user_name: 'Sneha Kulkarni',
            estimated_value: lead.estimated_value || 85000,
            priority: 'high',
            city: lead.city,
            state: lead.state,
            meta_lead_id: lead.meta_lead_id,
            meta_campaign_name: lead.campaign_name,
            meta_ad_name: lead.ad_name,
          });

          store.showSnackbar(`🔥 Meta Lead Ingested: ${lead.name} (${lead.phone})`, 'success');
        }
        break;
      }

      case 'whatsapp.message': {
        const msg = packet.data.message;
        if (msg) {
          if (msg.sender_type === 'customer') {
            store.receiveWhatsAppMessage(msg.phone, msg.content, msg.sender_name);
            store.showSnackbar(`💬 WhatsApp from ${msg.sender_name || msg.phone}: "${msg.content.slice(0, 30)}..."`, 'info');
          }
        }
        break;
      }

      case 'notification.new': {
        const notif = packet.data;
        if (notif) {
          store.addNotification({
            type: notif.type,
            title: notif.title,
            message: notif.message,
            action_url: notif.action_url,
          });
        }
        break;
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const realtimeSocket = new RealtimeSocket();
