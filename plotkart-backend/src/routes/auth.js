const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { 
  registerValidation, 
  loginValidation,
  roleValidation,
  validate 
} = require('../middleware/validation');

// Register
router.post('/register', registerValidation, validate, authController.register);

// Login
router.post('/login', loginValidation, validate, authController.login);

// Google OAuth
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
  }),
  authController.googleCallback
);

// Set role (protected)
router.post('/role', authenticate, roleValidation, validate, authController.setRole);

// Get current user (protected)
router.get('/me', authenticate, authController.getMe);

module.exports = router;
