const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const { multiple } = require('../middleware/upload');
const { propertyValidation, uuidParam, validate } = require('../middleware/validation');

// Upload property (seller only)
router.post('/upload',
  authenticate,
  authorize('seller'),
  multiple('documents', 10),
  propertyValidation,
  validate,
  propertyController.uploadProperty
);

// Get all properties (with filters)
router.get('/',
  optionalAuth,
  propertyController.getProperties
);

// Get property by ID
router.get('/:id',
  optionalAuth,
  uuidParam('id'),
  validate,
  propertyController.getPropertyById
);

// Get property location
router.get('/:id/location',
  authenticate,
  uuidParam('id'),
  validate,
  propertyController.getPropertyLocation
);

// Get pending properties (admin only)
router.get('/admin/pending',
  authenticate,
  authorize('admin', 'registrar'),
  propertyController.getPendingProperties
);

// Verify property (admin only) - NEW ROUTE
router.put('/:id/verify',
  authenticate,
  authorize('admin', 'registrar'),
  uuidParam('id'),
  validate,
  propertyController.verifyProperty
);

module.exports = router;
