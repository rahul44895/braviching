const { ClientAssignment } = require('../models');

async function getAccessibleClientIds(user) {
  switch (user.role) {
    case 'superadmin':
      return 'ALL';
    case 'manager':
      return (
        await ClientAssignment.findAll({
          where: { manager_id: user.id },
          attributes: ['client_id'],
        })
      ).map((r) => r.client_id);
    case 'employee':
      return (
        await ClientAssignment.findAll({
          where: { manager_id: user.manager_id },
          attributes: ['client_id'],
        })
      ).map((r) => r.client_id);
    case 'client':
      return [user.client_id];
    default:
      return [];
  }
}

module.exports = getAccessibleClientIds;
