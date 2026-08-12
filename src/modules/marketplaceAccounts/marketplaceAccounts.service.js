const repository = require('./marketplaceAccounts.repository');
const getAccessibleClientIds = require('../../utils/getAccessibleClientIds');
const recordAudit = require('../../utils/recordAudit');

async function list(user, filters) {
  const accessibleClientIds = await getAccessibleClientIds(user);
  return repository.findAllForClients(accessibleClientIds, filters);
}

async function create(user, data) {
  const account = await repository.create(data);
  await recordAudit(user.id, 'marketplace_account:create', 'marketplace_account', account.id);
  return account;
}

async function update(user, account, data) {
  const updated = await repository.update(account, data);
  await recordAudit(user.id, 'marketplace_account:update', 'marketplace_account', account.id);
  return updated;
}

async function remove(user, account) {
  await repository.softDelete(account);
  await recordAudit(user.id, 'marketplace_account:delete', 'marketplace_account', account.id);
}

module.exports = { list, create, update, remove };
