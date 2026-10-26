const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/user', authController.currentUser);
router.get('/users', authController.allUsers);
router.post('/logout', authController.logout);
router.post('/switch-role', authController.switchRole);

module.exports = router;
