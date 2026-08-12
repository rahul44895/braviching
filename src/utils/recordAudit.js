const { AuditLog } = require('../models');
const logger = require('./logger');

// Fire-and-forget from the caller's perspective, but awaited so failures are visible in logs --
// an audit-write failure should never crash the request that triggered it.
async function recordAudit(userId, action, resource, resourceId) {
  try {
    await AuditLog.create({ user_id: userId, action, resource, resource_id: resourceId ?? null });
  } catch (err) {
    logger.error('Failed to record audit log', {
      userId,
      action,
      resource,
      resourceId,
      message: err.message,
    });
  }
}

module.exports = recordAudit;
