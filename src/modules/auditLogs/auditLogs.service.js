const { AuditLog } = require('../../models');

async function list(filters) {
  const where = {};
  if (filters.resource) where.resource = filters.resource;
  if (filters.user_id) where.user_id = filters.user_id;
  return AuditLog.findAll({ where, order: [['id', 'DESC']], limit: 200 });
}

module.exports = { list };
