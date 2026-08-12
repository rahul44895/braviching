const repository = require('./clients.repository');
const getAccessibleClientIds = require('../../utils/getAccessibleClientIds');
const recordAudit = require('../../utils/recordAudit');
const { Campaign, Task, Storefront, MarketplaceAccount } = require('../../models');

async function list(user) {
  const accessibleClientIds = await getAccessibleClientIds(user);
  return repository.findAllAccessible(accessibleClientIds);
}

async function create(user, data) {
  const client = await repository.create(data);
  await recordAudit(user.id, 'client:create', 'client', client.id);
  return client;
}

async function update(user, client, data) {
  const updated = await repository.update(client, data);
  await recordAudit(user.id, 'client:update', 'client', client.id);
  return updated;
}

// Nested read aliases -- equivalent to GET /<resource>?client_id=:id, scoped identically.
async function campaigns(clientId) {
  return Campaign.findAll({ where: { client_id: clientId }, order: [['id', 'ASC']] });
}

async function tasks(clientId) {
  return Task.findAll({ where: { client_id: clientId }, order: [['id', 'ASC']] });
}

async function storefronts(clientId) {
  return Storefront.findAll({ where: { client_id: clientId }, order: [['id', 'ASC']] });
}

async function marketplaceAccounts(clientId) {
  return MarketplaceAccount.findAll({ where: { client_id: clientId }, order: [['id', 'ASC']] });
}

module.exports = { list, create, update, campaigns, tasks, storefronts, marketplaceAccounts };
