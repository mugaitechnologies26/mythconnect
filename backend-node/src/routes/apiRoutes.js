const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const leadRoutes = require('./leadRoutes');
const customerRoutes = require('./customerRoutes');
const quotationRoutes = require('./quotationRoutes');
const invoiceRoutes = require('./invoiceRoutes');
const paymentRoutes = require('./paymentRoutes');
const followupRoutes = require('./followupRoutes');
const whatsappRoutes = require('./whatsappRoutes');
const qrRoutes = require('./qrRoutes');
const digitalProfileRoutes = require('./digitalProfileRoutes');
const reportRoutes = require('./reportRoutes');
const settingsRoutes = require('./settingsRoutes');
const notificationRoutes = require('./notificationRoutes');

const reportController = require('../controllers/reportController');

// System Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'Myth Connect.ai Enterprise Node.js Backend',
    database: 'MySQL 8.0+ / MariaDB',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// Direct alias for dashboard KPIs
router.get('/dashboard/kpis', reportController.kpis);

// Mount Modular Resource Routes
router.use('/auth', authRoutes);
router.use('/leads', leadRoutes);
router.use('/customers', customerRoutes);
router.use('/quotations', quotationRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/payments', paymentRoutes);
router.use('/followups', followupRoutes);
router.use('/whatsapp', whatsappRoutes);
router.use('/qr', qrRoutes);
router.use('/digital-profile', digitalProfileRoutes);
router.use('/reports', reportRoutes);
router.use('/settings', settingsRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
