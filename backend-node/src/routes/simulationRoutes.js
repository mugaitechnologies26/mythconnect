const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');

router.post('/meta-lead', simulationController.simulateMetaLead);
router.post('/whatsapp-reply', simulationController.simulateIncomingWhatsApp);

module.exports = router;
