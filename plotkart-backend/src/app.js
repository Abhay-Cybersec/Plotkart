const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const ekycRoutes = require('./routes/ekyc');
const propertyRoutes = require('./routes/properties');
const adminRoutes = require('./routes/admin');
const transactionRoutes = require('./routes/transactions');
const ledgerRoutes = require('./routes/ledger');

const { errorHandler } = require('./middleware/errorHandler');
const rateLimiter = require('./middleware/rateLimit');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Rate limiting - ONLY in production
if (process.env.NODE_ENV === 'production') {
  app.use('/api/', rateLimiter);
  console.log('✓ Rate limiting enabled');
} else {
  console.log('✓ Rate limiting disabled (development mode)');
}

// Passport initialization
require('./config/passport');
app.use(passport.initialize());

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ekyc', ekycRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ledger', ledgerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use(errorHandler);

// Database and server start
const { sequelize } = require('./models');
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connection established');
    
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✓ Database models synchronized');
    }
    
    app.listen(PORT, () => {
      console.log(`✓ PlotKart Backend running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ API Base URL: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
