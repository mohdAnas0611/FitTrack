const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.post('/session', trackingController.saveSession);
router.get('/history', trackingController.getHistory);
router.post('/step-sync', trackingController.syncSteps);

module.exports = router;
