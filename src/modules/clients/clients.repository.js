const { Client } = require('../../models');
const { Op } = require('sequelize');

function findAllAccessible(accessibleClientIds) {
  const where =
    accessibleClientIds === 'ALL'
      ? {}
      : { id: { [Op.in]: accessibleClientIds.length ? accessibleClientIds : [-1] } };
  return Client.findAll({ where, order: [['id', 'ASC']] });
}

function create(data) {
  return Client.create(data);
}

function update(client, data) {
  return client.update(data);
}

module.exports = { findAllAccessible, create, update };
