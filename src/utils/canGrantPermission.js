const { User } = require('../models');
const getEffectivePermissions = require('./getEffectivePermissions');

async function canGrantPermission(granterId, permissionId) {
  const granter = await User.findByPk(granterId);
  // SuperAdmin holds "all permissions" by role definition, not via department defaults or
  // user_permissions rows (they have neither) -- so the additive-union check doesn't apply to them.
  if (granter && granter.role === 'superadmin') return true;

  const granterPerms = await getEffectivePermissions(granterId);
  return granterPerms.some((p) => p.id === permissionId);
}

module.exports = canGrantPermission;
