const crypto = require('crypto');

// Mask Aadhaar number (show only last 4 digits)
exports.maskAadhaar = (aadhaar) => {
  if (!aadhaar) return null;
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length !== 12) return null;
  return 'XXXX-XXXX-' + cleaned.slice(-4);
};

// Generate random string
exports.generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format currency
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
};

// Calculate pagination
exports.getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return { limit, offset };
};

// Format pagination response
exports.formatPaginatedResponse = (data, page, limit, total) => {
  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
