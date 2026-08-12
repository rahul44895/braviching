const ApiError = require('./ApiError');

/**
 * Shared guard for anything a Manager does to another user's account (permission grants,
 * active/inactive status). A Manager may only ever target their own Employees -- never another
 * Manager, a SuperAdmin, or a Client. SuperAdmin bypasses this check entirely.
 */
function assertCanManageUser(actingUser, targetUser) {
  if (actingUser.role === 'superadmin') return;

  if (actingUser.role === 'manager') {
    if (targetUser.role === 'employee' && targetUser.manager_id === actingUser.id) return;
    throw new ApiError(403, 'Managers may only manage their own employees');
  }

  throw new ApiError(403, 'Not authorized to manage users');
}

module.exports = assertCanManageUser;
