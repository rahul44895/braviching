const { MarketplaceAccount } = require('../../models');
const scopedClientWhere = require('../../utils/scopedClientWhere');

function findAllForClients(accessibleClientIds, filters) {
  const where = scopedClientWhere(accessibleClientIds, filters.client_id);
  return MarketplaceAccount.findAll({ where, order: [['id', 'ASC']] });
}

function create(data) {
  return MarketplaceAccount.create(data);
}

function update(account, data) {
  return account.update(data);
}

function softDelete(account) {
  return account.destroy();
}

module.exports = { findAllForClients, create, update, softDelete };
