const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

router.get('/', leadController.index);
router.post('/', leadController.store);
router.get('/:id', leadController.show);
router.put('/:id', leadController.update);
router.patch('/:id', leadController.update);
router.delete('/:id', leadController.destroy);

router.patch('/:id/stage', leadController.updateStage);
router.post('/:id/followups', leadController.storeFollowup);
router.post('/:id/notes', leadController.storeNote);
router.post('/:id/convert', leadController.convertToCustomer);

module.exports = router;
