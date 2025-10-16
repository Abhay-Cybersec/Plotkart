const express = require('express');
const router = express.Router();
const ekycController = require('../controllers/ekycController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { single } = require('../middleware/upload');
const { uuidParam, validate } = require('../middleware/validation');

// Upload KYC document
router.post('/upload', 
  authenticate, 
  single('document'), 
  ekycController.uploadKYC
);

// Get KYC status
router.get('/:id', 
  authenticate, 
  uuidParam('id'), 
  validate, 
  ekycController.getKYCStatus
);

// Get pending KYC (admin only)
router.get('/pending/list', 
  authenticate, 
  adminOnly, 
  ekycController.getPendingKYC
);

// Verify KYC (admin only)
router.post('/:id/verify', 
  authenticate, 
  adminOnly, 
  uuidParam('id'), 
  validate, 
  ekycController.verifyKYC
);

module.exports = router;
