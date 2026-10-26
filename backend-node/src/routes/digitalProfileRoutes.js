const express = require('express');
const router = express.Router();
const digitalProfileController = require('../controllers/digitalProfileController');

router.get('/', digitalProfileController.getProfile);
router.put('/', digitalProfileController.updateProfile);
router.post('/events', digitalProfileController.trackEvent);
router.post('/enquiries', digitalProfileController.submitEnquiry);

router.get('/products', digitalProfileController.getProducts);
router.post('/products', digitalProfileController.createProduct);
router.put('/products/:id', digitalProfileController.updateProduct);
router.delete('/products/:id', digitalProfileController.deleteProduct);

module.exports = router;
