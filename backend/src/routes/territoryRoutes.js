const express = require('express');
const router = express.Router();
const territoryController = require('../controllers/territoryController');
const { optionalAuth, authenticate } = require('../middleware/auth');

router.get('/grid', territoryController.getGrid);
router.get('/stats', territoryController.getStats);
router.post('/claim', optionalAuth, territoryController.claimCell);
router.post('/ai-turn', territoryController.aiTurn);
router.post('/reset', authenticate, territoryController.resetGrid);

module.exports = router;
