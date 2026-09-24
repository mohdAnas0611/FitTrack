const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/xp', userController.addXp);
router.post('/coins', userController.addCoins);
router.get('/badges', userController.getBadges);

module.exports = router;
