const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.get('/', invoiceController.index);
router.post('/', invoiceController.store);
router.get('/:id', invoiceController.show);
router.post('/:id/payments', invoiceController.recordPayment);
router.delete('/:id', invoiceController.destroy);

module.exports = router;
