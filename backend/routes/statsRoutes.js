const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { auth } = require('../middleware/auth');

// Публічні роути
router.get('/general', statsController.getGeneralStats);

// Захищені роути
router.get('/user', auth, statsController.getUserStats);

module.exports = router;