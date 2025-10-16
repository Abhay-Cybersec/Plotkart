const express = require('express');
const router = express.Router();
const ledgerController = require('../controllers/ledgerController');
const { authenticate, adminOnly } = require('../middleware/auth');
const { uuidParam, validate } = require('../middleware/validation');

// Verify ledger entry
router.get('/verify/:id',
  authenticate,
  uuidParam('id'),
  validate,
  ledgerController.verifyEntry
);

// Get ledger entries (admin only)
router.get('/entries',
  authenticate,
  adminOnly,
  ledgerController.getEntries
);

module.exports = router;
