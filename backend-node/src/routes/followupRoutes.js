const express = require('express');
const router = express.Router();
const followupController = require('../controllers/followupController');

router.get('/', followupController.index);
router.post('/', followupController.store);
router.get('/:id', followupController.show);
router.patch('/:id/complete', followupController.complete);
router.put('/:id', followupController.update);
router.patch('/:id', followupController.update);
router.delete('/:id', followupController.destroy);

module.exports = router;
