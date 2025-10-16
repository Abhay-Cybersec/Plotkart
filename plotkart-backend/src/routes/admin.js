const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, adminOnly } = require('../middleware/auth');

// Verify property
router.post('/verify-property',
  authenticate,
  adminOnly,
  adminController.verifyProperty
);

// Get analytics
router.get('/analytics',
  authenticate,
  adminOnly,
  adminController.getAnalytics
);

module.exports = router;
