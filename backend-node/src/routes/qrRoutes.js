const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');

router.get('/codes', qrController.index);
router.get('/codes/:id', qrController.show);
router.post('/generate', qrController.generate);
router.put('/codes/:id', qrController.update);
router.patch('/codes/:id', qrController.update);
router.delete('/codes/:id', qrController.destroy);

module.exports = router;
