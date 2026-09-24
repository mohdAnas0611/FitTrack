const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { optionalAuth, authenticate } = require('../middleware/auth');

router.get('/avatars', optionalAuth, shopController.getAvatars);
router.post('/buy', authenticate, shopController.buyAvatar);
router.post('/equip', authenticate, shopController.equipAvatar);

module.exports = router;
