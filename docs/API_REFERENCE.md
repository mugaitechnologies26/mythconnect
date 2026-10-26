# Myth Connect.ai — REST API & Webhook Reference

All endpoints return JSON responses. Standard HTTP response codes (200, 201, 400, 401, 403, 422, 500) are utilized.

---

## 1. Webhook Endpoints (Node.js Engine :5000)

### `GET /webhooks/meta`
Meta Lead Ads challenge handshake verification.
- **Parameters**: `hub.mode`, `hub.verify_token`, `hub.challenge`
- **Response**: `200 OK (challenge text)`

### `POST /webhooks/meta`
Ingests Meta Lead Ads leadgen events.
- **Headers**: `X-Hub-Signature-256: sha256={hmac}`
- **Payload**: Standard Facebook Leadgen change event.

### `GET /webhooks/whatsapp`
WhatsApp Cloud API challenge handshake verification.
- **Parameters**: `hub.mode`, `hub.verify_token`, `hub.challenge`

### `POST /webhooks/whatsapp`
Ingests incoming WhatsApp messages and status transitions (`sent`, `delivered`, `read`).

### `POST /simulation/meta-lead`
Developer simulation endpoint to test the entire end-to-end pipeline without live Meta ad spend.
```json
{
  "name": "Vikramaditya Rao",
  "phone": "+919876543299",
  "email": "vikram.rao@b2bindia.com",
  "company_name": "Rao TechLogistics Ltd",
  "campaign_name": "Facebook Lead Ads - Diwali B2B Enterprise Growth",
  "ad_name": "Video Ad - Automated CRM Demo",
  "estimated_value": 145000,
  "city": "Bengaluru",
  "state": "Karnataka"
}
```

---

## 2. Core CRM API Endpoints (Laravel :8000 / Node Gateway :5000)

### Leads
- `GET /api/leads` — List leads with filters (`source`, `status`, `assigned_to`, `search`, `page`)
- `POST /api/leads` — Create lead manually or from API
- `GET /api/leads/{id}` — Lead details, timeline, and quotations
- `PATCH /api/leads/{id}/stage` — Move lead across Kanban stages
- `POST /api/leads/{id}/followups` — Schedule follow-up for lead
- `POST /api/leads/{id}/notes` — Add internal note to lead

### WhatsApp CRM
- `GET /api/whatsapp/conversations` — Active chat threads with unread counts
- `GET /api/whatsapp/messages/{conversationId}` — Full chat message history
- `POST /api/whatsapp/messages` — Send outgoing WhatsApp text or approved template
- `GET /api/whatsapp/templates` — Fetch Meta-approved WhatsApp message templates

### Quotations & Proposals
- `GET /api/quotations` — List quotations
- `POST /api/quotations` — Create quotation with line items, rates, and 18% GST tax
- `POST /api/quotations/{id}/convert-to-invoice` — 1-click conversion to formal tax invoice
- `GET /api/quotations/{id}/pdf` — Generate printable formal proposal

### Invoices & Billing
- `GET /api/invoices` — List invoices and collection statuses
- `POST /api/invoices` — Issue formal GST invoice
- `POST /api/invoices/{id}/payments` — Book payment settlement (UPI, NEFT, Card, Cash)
- `GET /api/payments` — Complete payment ledger

### QR Generator
- `GET /api/qr/codes` — List generated dynamic QR codes with scan metrics
- `POST /api/qr/generate` — Generate branded dynamic QR code
