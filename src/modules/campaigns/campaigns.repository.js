const { Campaign } = require('../../models');
const scopedClientWhere = require('../../utils/scopedClientWhere');

function findAllForClients(accessibleClientIds, filters) {
  const where = { ...scopedClientWhere(accessibleClientIds, filters.client_id) };
  if (filters.status) where.status = filters.status;
  return Campaign.findAll({ where, order: [['id', 'ASC']] });
}

function findById(id) {
  return Campaign.findByPk(id);
}

function create(data) {
  return Campaign.create(data);
}

function update(campaign, data) {
  return campaign.update(data);
}

function softDelete(campaign) {
  return campaign.destroy();
}

module.exports = { findAllForClients, findById, create, update, softDelete };
