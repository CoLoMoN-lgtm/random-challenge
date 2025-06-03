const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const { 
  validateChallenge,
  validateChallengeUpdate,
  validateRating
} = require('../validators/challengeValidator');

// Публічні роути
router.get('/', challengeController.getAllChallenges);
router.get('/random', challengeController.getRandomChallenge);
router.get('/:id', challengeController.getChallengeById);

// Роути з опціональною авторизацією
router.post('/',
  optionalAuth,
  validateChallenge,
  challengeController.createChallenge
);

// Захищені роути
router.put('/:id',
  auth,
  authorize('admin', 'moderator'),
  validateChallengeUpdate,
  challengeController.updateChallenge
);

router.delete('/:id',
  auth,
  authorize('admin'),
  challengeController.deleteChallenge
);

router.post('/:id/rate',
  auth,
  validateRating,
  challengeController.rateChallenge
);

module.exports = router;