const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const { authenticate } = require('../middleware/auth');

router.get('/daily', challengeController.getDailyChallenges);
router.post('/:id/claim', authenticate, challengeController.claimReward);

module.exports = router;
