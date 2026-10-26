const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.index);
router.get('/:id', paymentController.show);

module.exports = router;
