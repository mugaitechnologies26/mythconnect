const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.index);
router.post('/', customerController.store);
router.get('/:id', customerController.show);
router.put('/:id', customerController.update);
router.patch('/:id', customerController.update);
router.delete('/:id', customerController.destroy);
router.get('/:id/history', customerController.history);

module.exports = router;
