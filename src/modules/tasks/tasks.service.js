const repository = require('./tasks.repository');
const getAccessibleClientIds = require('../../utils/getAccessibleClientIds');
const recordAudit = require('../../utils/recordAudit');

async function list(user, filters) {
  const accessibleClientIds = await getAccessibleClientIds(user);
  return repository.findAllForClients(accessibleClientIds, filters);
}

async function create(user, data) {
  const task = await repository.create(data);
  await recordAudit(user.id, 'task:create', 'task', task.id);
  return task;
}

async function update(user, task, data) {
  const updated = await repository.update(task, data);
  await recordAudit(user.id, 'task:update', 'task', task.id);
  return updated;
}

async function remove(user, task) {
  await repository.softDelete(task);
  await recordAudit(user.id, 'task:delete', 'task', task.id);
}

module.exports = { list, create, update, remove };
