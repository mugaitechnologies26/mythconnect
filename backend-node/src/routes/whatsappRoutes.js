const express = require('express');
const router = express.Router();
const whatsappController = require('../controllers/whatsappController');

router.get('/conversations', whatsappController.conversations);
router.get('/messages', whatsappController.messages);
router.get('/messages/:conversationId', whatsappController.messages);
router.post('/messages', whatsappController.sendMessage);
router.get('/templates', whatsappController.templates);

module.exports = router;
