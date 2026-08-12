const { Storefront } = require('../../models');
const scopedClientWhere = require('../../utils/scopedClientWhere');

function findAllForClients(accessibleClientIds, filters) {
  const where = scopedClientWhere(accessibleClientIds, filters.client_id);
  return Storefront.findAll({ where, order: [['id', 'ASC']] });
}

function create(data) {
  return Storefront.create(data);
}

function update(storefront, data) {
  return storefront.update(data);
}

function softDelete(storefront) {
  return storefront.destroy();
}

module.exports = { findAllForClients, create, update, softDelete };
