const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validatePasswordChange,
  validateProfileUpdate
} = require('../validators/authValidator');

// Публічні роути
router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Захищені роути
router.post('/logout', auth, authController.logout);
router.post('/logout-all', auth, authController.logoutAll);
router.get('/profile', auth, authController.getProfile);
router.patch('/profile', auth, validateProfileUpdate, authController.updateProfile);
router.post('/change-password', auth, validatePasswordChange, authController.changePassword);

module.exports = router;