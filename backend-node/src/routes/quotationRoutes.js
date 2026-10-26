const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

router.get('/', quotationController.index);
router.post('/', quotationController.store);
router.get('/:id', quotationController.show);
router.patch('/:id/status', quotationController.updateStatus);
router.post('/:id/convert-to-invoice', quotationController.convertToInvoice);
router.post('/:id/send', quotationController.sendQuotation);
router.delete('/:id', quotationController.destroy);

module.exports = router;
