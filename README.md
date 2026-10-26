# Myth Connect.ai - Enterprise Omnichannel CRM & Realtime Sales Platform

[![Node.js Version](https://img.shields.io/badge/Node.js-18%2B%20%2F%2020%2B-green.svg)](https://nodejs.org/)
[![Vite + React](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-blue.svg)](https://vitejs.dev/)
[![Realtime](https://img.shields.io/badge/Realtime-WebSocket-purple.svg)](https://github.com/websockets/ws)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0%2B-orange.svg)](https://www.mysql.com/)

> **CONNECT | CONVERT | AUTOMATE | SALES**  
> Complete omnichannel CRM integrating Meta Lead Ads (Facebook & Instagram), WhatsApp Cloud API, dynamic trackable QR codes, sales pipelines, quotations, invoicing, and digital business profiles.

---

## 🚀 1-Step Live Deployment (Linux / Ubuntu / VPS)

To deploy or update live on any Linux VPS or server, simply run the automated deployment script:

```bash
# Clone and start the application in one command:
curl -sSL https://raw.githubusercontent.com/mugaitechnologies26/mythconnect/main/script/update.sh | bash
```

Or if you have already cloned the repository:

```bash
chmod +x script/update.sh
./script/update.sh
```

### What `script/update.sh` does automatically:
1. Detects or clones the repository from `https://github.com/mugaitechnologies26/mythconnect.git`.
2. Pulls the latest commits from the `main` branch.
3. Checks Node.js (18+) and npm.
4. Auto-configures `backend-node/.env` if not present.
5. Installs all backend and frontend dependencies cleanly (ignoring `node_modules` in git).
6. Builds the production frontend bundle into `frontend/dist`.
7. Auto-migrates and seeds the MySQL database schema (`mythconnect_crm`) if MySQL is running.
8. Launches or reloads the application using **PM2** (with zero-downtime cluster reload) or background process fallback.
9. Performs an automatic health check and prints active service URLs.

---

## 💻 Manual Setup & Local Running

### Prerequisites
- Node.js 18.x or 20.x
- npm 9+ or 10+
- MySQL 8.0+ or MariaDB 10.5+

### 1. Clone the Repository
```bash
git clone https://github.com/mugaitechnologies26/mythconnect.git
cd mythconnect
```

### 2. Install Dependencies
```bash
# Install backend and frontend dependencies
npm run install:all
```

### 3. Configure Environment Variables
Copy the sample environment file in `backend-node`:
```bash
cp backend-node/.env.example backend-node/.env
```
Edit `backend-node/.env` to configure your MySQL database credentials and Meta/WhatsApp API tokens:
```ini
PORT=5000
NODE_ENV=production
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=mythconnect_crm
```

### 4. Initialize Database
```bash
npm run db:init
```

### 5. Build and Start
```bash
# Build production frontend
npm run build

# Start the unified server (serves frontend + backend + WebSocket on port 5000)
npm start
```

Open your browser at: **`http://localhost:5000`**

---

## 🛠️ Production Process Management (PM2)

This repository includes a production-ready `ecosystem.config.js`:

```bash
# Start with PM2
pm2 start ecosystem.config.js

# Check status
pm2 status

# View live logs
pm2 logs mythconnect-server

# Zero-downtime reload
pm2 reload ecosystem.config.js

# Restart / Stop
pm2 restart mythconnect-server
pm2 stop mythconnect-server
```

---

## 🌐 Production Domain & SSL Setup (`mythconnect.mugaitechnologies.in`)

To connect your custom domain with HTTPS and WebSocket reverse proxy support:

### 1. Point DNS Records
In your DNS provider (e.g., Cloudflare, GoDaddy, Hostinger), add an `A` record:
- **Host / Name**: `mythconnect`
- **Type**: `A`
- **Value**: `<Your-VPS-Public-IP-Address>`

### 2. Auto-Install Nginx & Free SSL (Let's Encrypt)
On your Linux server, run the automated SSL setup script:
```bash
sudo bash script/setup-ssl.sh
```
This script automatically:
- Installs Nginx and Certbot
- Configures reverse proxying for port 5000 and WebSocket `/ws`
- Issues a free auto-renewing Let's Encrypt SSL certificate
- Reloads Nginx

Your webapp will then be live at **`https://mythconnect.mugaitechnologies.in`**!

---

## 📁 Repository Structure

```
mythconnect/
├── backend-node/               # Express + WebSocket Realtime API Server
│   ├── server.js               # Main server (serves API & SPA frontend)
│   ├── src/
│   │   ├── config/             # DB & Environment configurations
│   │   ├── controllers/        # REST route controllers
│   │   ├── models/             # Database data access layer
│   │   ├── routes/             # Express API routes
│   │   ├── scripts/initDb.js   # Automated DB migration & seeding runner
│   │   ├── services/           # Meta, WhatsApp & Realtime WebSocket services
│   │   └── utils/              # Loggers and cryptographic helpers
│   ├── .env.example            # Sample environment variables
│   └── package.json            # Backend dependencies
├── frontend/                   # Modern React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── screens/            # Screen views (CRM, WhatsApp, Pipeline, Leads, etc.)
│   │   ├── services/api.ts     # Dynamic API client
│   │   ├── services/socket.ts  # Dynamic Realtime WebSocket client
│   │   └── store/useAppStore.ts# State management
│   ├── vite.config.ts          # Vite build configuration
│   └── package.json            # Frontend dependencies
├── database/
│   ├── schema.sql              # Normalized MySQL 8.0+ DDL schema
│   └── seeds.sql               # Production seed data
├── docs/                       # Architecture & API documentation
├── script/
│   ├── update.sh               # Linux production deployment & auto-update bash script
│   └── update.ps1              # Windows startup PowerShell runner
├── .gitignore                  # Clean repository ignores (node_modules, dist, .env)
├── ecosystem.config.js         # PM2 production process configuration
├── package.json                # Workspace orchestration scripts
└── README.md                   # Platform documentation
```

---

## 🌐 Endpoints Overview

| Service | Endpoint | Description |
|---|---|---|
| **Web Application** | `GET /` | Complete React 18 Single Page Application |
| **System Health** | `GET /api/health` | Backend and database status |
| **API Directory** | `GET /api` | Discovery of all available REST endpoints |
| **Realtime Gateway** | `ws://host:5000/ws` | Live WebSocket updates for leads & chats |
| **Meta Webhook** | `GET/POST /webhooks/meta` | Facebook & Instagram Lead Ads webhook |
| **WhatsApp Webhook** | `GET/POST /webhooks/whatsapp` | WhatsApp Cloud API messaging webhook |
| **Dynamic Smart QR** | `GET /qr/:qrId` | Trackable dynamic QR code redirection |

---

## 🔒 Git Hygiene & Security

- All `node_modules/` and build artifacts (`dist/`) are strictly ignored via `.gitignore`.
- Production credentials in `.env` are protected and never committed.
- Pre-configured `.env.example` provides a safe blueprint for deployments.
