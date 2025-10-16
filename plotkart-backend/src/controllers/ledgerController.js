const ledgerService = require('../services/ledgerService');
const { Ledger } = require('../models');

// Verify ledger entry
exports.verifyEntry = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await ledgerService.verifyChain(id);

    res.json({
      entryId: id,
      verification: result
    });
  } catch (error) {
    next(error);
  }
};

// Get ledger entries (admin only)
exports.getEntries = async (req, res, next) => {
  try {
    const { limit = 50, offset = 0, eventType } = req.query;

    const where = {};
    if (eventType) {
      where.eventType = eventType;
    }

    const entries = await Ledger.findAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['blockIndex', 'DESC']]
    });

    res.json({ entries, count: entries.length });
  } catch (error) {
    next(error);
  }
};

