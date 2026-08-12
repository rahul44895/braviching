const repository = require('./campaigns.repository');
const getAccessibleClientIds = require('../../utils/getAccessibleClientIds');
const recordAudit = require('../../utils/recordAudit');

async function list(user, filters) {
  const accessibleClientIds = await getAccessibleClientIds(user);
  return repository.findAllForClients(accessibleClientIds, filters);
}

async function create(user, data) {
  const campaign = await repository.create(data);
  await recordAudit(user.id, 'campaign:create', 'campaign', campaign.id);
  return campaign;
}

async function update(user, campaign, data) {
  const updated = await repository.update(campaign, data);
  await recordAudit(user.id, 'campaign:update', 'campaign', campaign.id);
  return updated;
}

async function remove(user, campaign) {
  await repository.softDelete(campaign);
  await recordAudit(user.id, 'campaign:delete', 'campaign', campaign.id);
}

module.exports = { list, create, update, remove };
