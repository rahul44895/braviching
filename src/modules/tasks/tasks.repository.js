const { Task } = require('../../models');
const scopedClientWhere = require('../../utils/scopedClientWhere');

function findAllForClients(accessibleClientIds, filters) {
  const where = { ...scopedClientWhere(accessibleClientIds, filters.client_id) };
  if (filters.assigned_to) where.assigned_to = filters.assigned_to;
  if (filters.status) where.status = filters.status;
  return Task.findAll({ where, order: [['id', 'ASC']] });
}

function create(data) {
  return Task.create(data);
}

function update(task, data) {
  return task.update(data);
}

function softDelete(task) {
  return task.destroy();
}

module.exports = { findAllForClients, create, update, softDelete };
