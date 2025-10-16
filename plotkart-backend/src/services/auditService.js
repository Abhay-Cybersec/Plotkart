const { AuditLog } = require('../models');

class AuditService {
  async log(userId, action, resource, resourceId, req, metadata = {}) {
    try {
      return await AuditLog.create({
        userId,
        action,
        resource,
        resourceId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        metadata
      });
    } catch (error) {
      console.error('Audit log failed:', error);
    }
  }
}

module.exports = new AuditService();
