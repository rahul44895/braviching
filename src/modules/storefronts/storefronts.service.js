const repository = require('./storefronts.repository');
const getAccessibleClientIds = require('../../utils/getAccessibleClientIds');
const recordAudit = require('../../utils/recordAudit');

async function list(user, filters) {
  const accessibleClientIds = await getAccessibleClientIds(user);
  return repository.findAllForClients(accessibleClientIds, filters);
}

async function create(user, data) {
  const storefront = await repository.create(data);
  await recordAudit(user.id, 'storefront:create', 'storefront', storefront.id);
  return storefront;
}

async function update(user, storefront, data) {
  const updated = await repository.update(storefront, data);
  await recordAudit(user.id, 'storefront:update', 'storefront', storefront.id);
  return updated;
}

async function remove(user, storefront) {
  await repository.softDelete(storefront);
  await recordAudit(user.id, 'storefront:delete', 'storefront', storefront.id);
}

module.exports = { list, create, update, remove };
