const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');

router.get('/', roleController.index);
router.get('/permissions', roleController.permissions);
router.get('/:id', roleController.show);
router.post('/', roleController.create);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.delete);

module.exports = router;
