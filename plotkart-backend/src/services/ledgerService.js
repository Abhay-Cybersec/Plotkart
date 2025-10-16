const { Ledger } = require('../models');
const hashService = require('./hashService');

class LedgerService {
  async addEntry(eventType, payload) {
    try {
      // Get last block
      const lastBlock = await Ledger.findOne({
        order: [['blockIndex', 'DESC']]
      });

      const previousHash = lastBlock ? lastBlock.blockHash : '0';
      const blockIndex = lastBlock ? lastBlock.blockIndex + 1 : 0;

      // Calculate hashes
      const payloadHash = hashService.hashString(JSON.stringify(payload));
      const timestamp = new Date().toISOString();
      const blockHash = hashService.hashString(
        previousHash + payloadHash + timestamp
      );

      // Create ledger entry
      const entry = await Ledger.create({
        blockIndex,
        previousHash,
        payloadHash,
        blockHash,
        payload,
        eventType,
        timestamp
      });

      return entry;
    } catch (error) {
      console.error('Ledger entry creation failed:', error);
      throw error;
    }
  }

  async verifyChain(entryId) {
    const entry = await Ledger.findByPk(entryId);
    if (!entry) {
      throw new Error('Entry not found');
    }

    // Verify payload hash
    const payloadHash = hashService.hashString(JSON.stringify(entry.payload));
    if (payloadHash !== entry.payloadHash) {
      return { valid: false, message: 'Payload hash mismatch' };
    }

    // Verify block hash
    const blockHash = hashService.hashString(
      entry.previousHash + entry.payloadHash + entry.timestamp
    );
    if (blockHash !== entry.blockHash) {
      return { valid: false, message: 'Block hash mismatch' };
    }

    // Verify chain continuity
    if (entry.blockIndex > 0) {
      const previousBlock = await Ledger.findOne({
        where: { blockIndex: entry.blockIndex - 1 }
      });
      
      if (!previousBlock || previousBlock.blockHash !== entry.previousHash) {
        return { valid: false, message: 'Chain continuity broken' };
      }
    }

    return { valid: true, message: 'Entry verified successfully' };
  }
}

module.exports = new LedgerService();
