const { Transaction, Property, EKYC, sequelize } = require('../models');
const ledgerService = require('../services/ledgerService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');
const crypto = require('crypto');

// Checkout property (purchase)
exports.checkout = async (req, res, next) => {
  const t = await sequelize.transaction();

  try {
    const { id: propertyId } = req.params;
    const buyerId = req.user.id;

    // Verify buyer KYC
    const buyerKYC = await EKYC.findOne({
      where: { userId: buyerId, status: 'verified' }
    });

    if (!buyerKYC) {
      await t.rollback();
      return res.status(403).json({ error: 'KYC verification required' });
    }

    // Lock property row to prevent concurrent purchases
    const property = await Property.findOne({
      where: { id: propertyId },
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!property) {
      await t.rollback();
      return res.status(404).json({ error: 'Property not found' });
    }

    if (property.status !== 'listed') {
      await t.rollback();
      return res.status(400).json({ error: 'Property is not available for purchase' });
    }

    if (property.ownerId === buyerId) {
      await t.rollback();
      return res.status(400).json({ error: 'Cannot purchase your own property' });
    }

    // Create transaction
    const transaction = await Transaction.create({
      propertyId: property.id,
      buyerId,
      sellerId: property.ownerId,
      amount: property.price,
      status: 'pending',
      paymentMethod: process.env.PAYMENT_MODE || 'mock',
      metadata: {
        propertyTitle: property.title,
        propertyLocation: property.locationText
      }
    }, { transaction: t });

    // Mock payment processing
    const paymentSuccess = await this.processPayment(transaction);

    if (paymentSuccess) {
      // Update transaction
      transaction.status = 'completed';
      transaction.completedAt = new Date();
      transaction.paymentId = `PAY_${Date.now()}`;
      transaction.txHash = crypto.randomBytes(32).toString('hex');
      await transaction.save({ transaction: t });

      // Transfer ownership
      property.ownerId = buyerId;
      property.status = 'sold';
      await property.save({ transaction: t });

      // Add to ledger
      await ledgerService.addEntry('ownership_transfer', {
        propertyId: property.id,
        previousOwnerId: property.ownerId,
        newOwnerId: buyerId,
        transactionId: transaction.id,
        amount: property.price,
        timestamp: new Date()
      });

      // Send notifications
      await notificationService.sendTransactionComplete(
        buyerId,
        transaction.id,
        property.title
      );

      await t.commit();

      await auditService.log(buyerId, 'purchase_property', 'transaction', transaction.id, req);

      res.json({
        message: 'Purchase completed successfully',
        transaction: {
          id: transaction.id,
          status: transaction.status,
          amount: transaction.amount,
          txHash: transaction.txHash,
          completedAt: transaction.completedAt
        },
        property: {
          id: property.id,
          title: property.title,
          newOwnerId: property.ownerId
        }
      });
    } else {
      await t.rollback();
      res.status(400).json({ error: 'Payment failed' });
    }
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

// Mock payment processing
exports.processPayment = async (transaction) => {
  return new Promise((resolve) => {
    // Simulate payment processing delay
    setTimeout(() => {
      // Mock: 95% success rate
      resolve(Math.random() > 0.05);
    }, 1000);
  });
};

// Get transaction by ID
exports.getTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findByPk(id, {
      include: [
        {
          model: Property,
          as: 'property',
          attributes: ['id', 'title', 'locationText']
        }
      ]
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check authorization
    if (
      transaction.buyerId !== req.user.id &&
      transaction.sellerId !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};
