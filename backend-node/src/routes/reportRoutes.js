const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

router.get('/kpis', reportController.kpis);
router.get('/sources', reportController.sources);
router.get('/funnel', reportController.funnel);
router.get('/salespeople', reportController.salespeople);

module.exports = router;
