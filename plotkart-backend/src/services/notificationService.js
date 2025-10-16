const { Notification } = require('../models');

class NotificationService {
  async create(userId, type, title, message, metadata = {}) {
    try {
      return await Notification.create({
        userId,
        type,
        title,
        message,
        metadata
      });
    } catch (error) {
      console.error('Notification creation failed:', error);
    }
  }

  async sendPropertyVerified(userId, propertyId, propertyTitle) {
    return this.create(
      userId,
      'property_verified',
      'Property Verified',
      `Your property "${propertyTitle}" has been verified and is now listed.`,
      { propertyId }
    );
  }

  async sendPropertyRejected(userId, propertyId, propertyTitle, reason) {
    return this.create(
      userId,
      'property_rejected',
      'Property Rejected',
      `Your property "${propertyTitle}" was rejected. Reason: ${reason}`,
      { propertyId, reason }
    );
  }

  async sendKYCVerified(userId) {
    return this.create(
      userId,
      'kyc_verified',
      'KYC Verified',
      'Your KYC documents have been verified successfully.',
      {}
    );
  }

  async sendTransactionComplete(userId, transactionId, propertyTitle) {
    return this.create(
      userId,
      'transaction_complete',
      'Transaction Completed',
      `Your purchase of "${propertyTitle}" is complete.`,
      { transactionId }
    );
  }
}

module.exports = new NotificationService();
