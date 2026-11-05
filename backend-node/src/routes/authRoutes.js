const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.get('/user', authController.currentUser);
router.get('/users', authController.allUsers);
router.post('/users', authController.createUser);
router.put('/users/:id', authController.updateUser);
router.delete('/users/:id', authController.deleteUser);
router.get('/teams', authController.allTeams);
router.post('/logout', authController.logout);
router.post('/switch-role', authController.switchRole);

module.exports = router;
