const { Property, User, EKYC, Transaction } = require('../models');
const ledgerService = require('../services/ledgerService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

// Verify property
exports.verifyProperty = async (req, res, next) => {
  try {
    const { propertyId, approved, verificationNotes } = req.body;

    const property = await Property.findByPk(propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    property.status = approved ? 'listed' : 'rejected';
    property.verifiedBy = req.user.id;
    property.verifiedAt = new Date();
    property.verificationNotes = verificationNotes;
    await property.save();

    // Add to ledger
    await ledgerService.addEntry('property_verification', {
      propertyId: property.id,
      ownerId: property.ownerId,
      status: property.status,
      verifiedBy: req.user.id,
      timestamp: new Date()
    });

    // Send notification
    if (approved) {
      await notificationService.sendPropertyVerified(
        property.ownerId,
        property.id,
        property.title
      );
    } else {
      await notificationService.sendPropertyRejected(
        property.ownerId,
        property.id,
        property.title,
        verificationNotes
      );
    }

    await auditService.log(req.user.id, 'verify_property', 'property', property.id, req, { approved });

    res.json({
      message: `Property ${approved ? 'verified' : 'rejected'} successfully`,
      property
    });
  } catch (error) {
    next(error);
  }
};

// Get analytics
exports.getAnalytics = async (req, res, next) => {
  try {
    const totalProperties = await Property.count();
    const listedProperties = await Property.count({ where: { status: 'listed' } });
    const pendingProperties = await Property.count({ where: { status: 'pending_verification' } });
    const soldProperties = await Property.count({ where: { status: 'sold' } });

    const totalUsers = await User.count();
    const buyers = await User.count({ where: { role: 'buyer' } });
    const sellers = await User.count({ where: { role: 'seller' } });

    const pendingKYC = await EKYC.count({ where: { status: 'pending' } });
    const verifiedKYC = await EKYC.count({ where: { status: 'verified' } });

    const completedTransactions = await Transaction.count({ where: { status: 'completed' } });
    const pendingTransactions = await Transaction.count({ where: { status: 'pending' } });

    res.json({
      properties: {
        total: totalProperties,
        listed: listedProperties,
        pending: pendingProperties,
        sold: soldProperties
      },
      users: {
        total: totalUsers,
        buyers,
        sellers
      },
      kyc: {
        pending: pendingKYC,
        verified: verifiedKYC
      },
      transactions: {
        completed: completedTransactions,
        pending: pendingTransactions
      }
    });
  } catch (error) {
    next(error);
  }
};
