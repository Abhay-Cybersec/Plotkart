const { body, param, query, validationResult } = require('express-validator');

// Validation error handler
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

// User registration validation
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Login validation
exports.loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Property upload validation
exports.propertyValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('locationText').trim().notEmpty().withMessage('Location is required'),
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('area').trim().notEmpty().withMessage('Area is required'),
];

// Role selection validation
exports.roleValidation = [
  body('role')
    .isIn(['buyer', 'seller'])
    .withMessage('Role must be buyer or seller'),
];

// UUID parameter validation
exports.uuidParam = (paramName = 'id') => [
  param(paramName).isUUID().withMessage(`Invalid ${paramName} format`),
];
