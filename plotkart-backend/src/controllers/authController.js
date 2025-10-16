const bcrypt = require('bcrypt');
const { User } = require('../models');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const auditService = require('../services/auditService');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_ROUNDS || 10)
    );

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      role: null
    });

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log action
    await auditService.log(user.id, 'register', 'user', user.id, req);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if active
    if (!user.isActive) {
      return res.status(403).json({ error: 'Account is disabled' });
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log action
    await auditService.log(user.id, 'login', 'user', user.id, req);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        profilePicture: user.profilePicture
      },
      token,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
exports.googleCallback = async (req, res, next) => {
  try {
    const user = req.user;

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    await auditService.log(user.id, 'google_login', 'user', user.id, req);

    // Redirect to frontend with token
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/callback?token=${token}&refresh=${refreshToken}`
    );
  } catch (error) {
    next(error);
  }
};

// Set user role
exports.setRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = req.user;

    if (!['buyer', 'seller'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    user.role = role;
    await user.save();

    await auditService.log(user.id, 'set_role', 'user', user.id, req, { role });

    res.json({
      message: 'Role set successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({ user });
  } catch (error) {
    next(error);
  }
};
