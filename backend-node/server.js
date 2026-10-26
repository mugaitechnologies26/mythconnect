const http = require('http');
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const config = require('./src/config');
const db = require('./src/config/db');
const logger = require('./src/utils/logger');
const socketManager = require('./src/services/realtime/socketManager');
const webhookRoutes = require('./src/routes/webhookRoutes');
const simulationRoutes = require('./src/routes/simulationRoutes');
const apiRoutes = require('./src/routes/apiRoutes');
const qrController = require('./src/controllers/qrController');
const DigitalProfileModel = require('./src/models/DigitalProfileModel');

const app = express();
const server = http.createServer(app);

// Enable Cross-Origin Resource Sharing
app.use(cors({ origin: config.corsOrigin, credentials: true }));

// Capture raw body buffer for HMAC-SHA256 signature verification on Webhook requests
app.use(express.json({
  verify: (req, res, buf, encoding) => {
    if (buf && buf.length) {
      req.rawBody = buf;
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info('HTTP', `${req.method} ${req.path}`);
  next();
});

// Initialize WebSocket Realtime Gateway
socketManager.init(server);

// Dynamic QR Redirection route
app.get('/qr/:qrId', qrController.redirect);

// Register Route Handlers
app.use('/webhooks', webhookRoutes);
app.use('/simulation', simulationRoutes);
app.use('/api', apiRoutes);

const apiWelcomePayload = {
  name: 'Myth Connect.ai Enterprise Node.js Backend & Realtime Engine',
  version: '2.0.0',
  brand: 'CONNECT | CONVERT | AUTOMATE | SALES',
  endpoints: {
    health: 'GET /api/health',
    dashboardKpis: 'GET /api/dashboard/kpis',
    leads: 'GET /api/leads',
    customers: 'GET /api/customers',
    quotations: 'GET /api/quotations',
    invoices: 'GET /api/invoices',
    payments: 'GET /api/payments',
    followups: 'GET /api/followups',
    whatsapp: 'GET /api/whatsapp/conversations',
    digitalProfile: 'GET /api/digital-profile',
    qrCodes: 'GET /api/qr/codes',
    reports: 'GET /api/reports/kpis',
    realtimeWebSocket: 'ws://localhost:5000/ws',
    simulationMetaLead: 'POST /simulation/meta-lead',
    simulationWhatsApp: 'POST /simulation/whatsapp-reply'
  }
};

// API Info Endpoint
app.get('/api', (req, res) => res.json(apiWelcomePayload));

// Serve Frontend Webapp in Production if built
const frontendDistPath = path.resolve(__dirname, '../frontend/dist');
const hasFrontendBuild = fs.existsSync(path.join(frontendDistPath, 'index.html'));

if (hasFrontendBuild) {
  logger.info('STATIC', `Serving production frontend assets from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));

  // SPA fallback for frontend client-side routes
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/webhooks') ||
      req.path.startsWith('/simulation') ||
      req.path.startsWith('/qr')
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  // If frontend is not built, root serves API welcome info
  app.get('/', (req, res) => res.json(apiWelcomePayload));
}

// Centralized error handling middleware
app.use((err, req, res, next) => {
  logger.error('SERVER', `Unhandled error: ${err.message}`, { stack: err.stack });
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error: err.name || 'InternalServerError',
    message: err.message
  });
});

// Start Server & verify database connection
const PORT = config.port;
server.listen(PORT, async () => {
  logger.success('STARTUP', `Myth Connect.ai Node Server running on http://localhost:${PORT}`);
  logger.info('STARTUP', `WebSocket Gateway ready on ws://localhost:${PORT}/ws`);
  logger.info('STARTUP', `Meta Webhooks ready on http://localhost:${PORT}/webhooks/meta`);
  logger.info('STARTUP', `WhatsApp Webhooks ready on http://localhost:${PORT}/webhooks/whatsapp`);

  // Verify DB
  const dbOk = await db.testConnection();
  if (dbOk) {
    try {
      await DigitalProfileModel.ensureDefaultProfile();
      logger.success('STARTUP', 'Default digital profile validated in database.');
    } catch (e) {
      logger.warn('STARTUP', `Profile check: ${e.message}`);
    }
  }
});
