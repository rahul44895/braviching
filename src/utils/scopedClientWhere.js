const { Op } = require('sequelize');

/**
 * Builds the client_id clause for a list query given a user's accessible client ids and an
 * optional requested client_id filter. Never widens access: a requested client_id outside the
 * accessible set resolves to an impossible clause (empty result) rather than being honored or
 * silently dropped.
 */
function scopedClientWhere(accessibleClientIds, requestedClientId) {
  if (accessibleClientIds === 'ALL') {
    return requestedClientId ? { client_id: requestedClientId } : {};
  }

  if (requestedClientId) {
    return accessibleClientIds.includes(requestedClientId)
      ? { client_id: requestedClientId }
      : { client_id: -1 };
  }

  return { client_id: { [Op.in]: accessibleClientIds.length ? accessibleClientIds : [-1] } };
}

module.exports = scopedClientWhere;
