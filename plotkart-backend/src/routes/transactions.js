const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticate, authorize } = require('../middleware/auth');
const { uuidParam, validate } = require('../middleware/validation');

// Checkout property (buyer only)
router.post('/properties/:id/checkout',
  authenticate,
  authorize('buyer'),
  uuidParam('id'),
  validate,
  transactionController.checkout
);

// Get transaction by ID
router.get('/:id',
  authenticate,
  uuidParam('id'),
  validate,
  transactionController.getTransaction
);

module.exports = router;
