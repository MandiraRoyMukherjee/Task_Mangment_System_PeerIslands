const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// Get notifications for current user
router.get('/', auth, notificationController.getNotifications);

module.exports = router;
