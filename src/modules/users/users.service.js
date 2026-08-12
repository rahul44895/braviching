const repository = require('./users.repository');
const assertCanManageUser = require('../../utils/assertCanManageUser');
const canGrantPermission = require('../../utils/canGrantPermission');
const getEffectivePermissions = require('../../utils/getEffectivePermissions');
const recordAudit = require('../../utils/recordAudit');
const ApiError = require('../../utils/ApiError');

async function list(actingUser) {
  if (actingUser.role === 'superadmin') return repository.findAll();
  if (actingUser.role === 'manager') return repository.findAllForManager(actingUser.id);
  throw new ApiError(403, 'Not authorized to list users');
}

async function create(actingUser, data) {
  if (actingUser.role !== 'superadmin') {
    throw new ApiError(403, 'Only SuperAdmin can create user accounts');
  }
  const user = await repository.create(data);
  await recordAudit(actingUser.id, 'user:create', 'user', user.id);
  return user;
}

/**
 * Shared delegation endpoint for both SuperAdmin->Manager and Manager->Employee grants -- doesn't
 * branch on granter role beyond assertCanManageUser + canGrantPermission, per the spec's "same
 * function, reused at both levels" rule.
 */
async function grantPermission(actingUser, targetUserId, permissionId) {
  const targetUser = await repository.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  assertCanManageUser(actingUser, targetUser);

  const allowed = await canGrantPermission(actingUser.id, permissionId);
  if (!allowed) {
    throw new ApiError(403, 'Cannot grant a permission you do not yourself hold');
  }

  const grant = await repository.grantPermission(targetUserId, permissionId, actingUser.id);
  await recordAudit(actingUser.id, 'user:grant_permission', 'user', targetUserId);
  return grant;
}

/**
 * Deactivation cascade (see plan §3a): setting is_active=false on a Manager cascades to all their
 * Employees and revokes sessions for everyone touched; reactivation only ever flips the single
 * targeted user. All DB writes run in one transaction so a cascade never partially applies.
 */
async function setActiveStatus(actingUser, targetUserId, isActive) {
  const targetUser = await repository.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  assertCanManageUser(actingUser, targetUser);

  await repository.runInTransaction(async (transaction) => {
    await repository.setActive(targetUser, isActive, transaction);

    if (!isActive) {
      await repository.revokeSession(targetUser.id, transaction);

      if (targetUser.role === 'manager') {
        const employees = await repository.findEmployeesOfManager(targetUser.id, transaction);
        for (const employee of employees) {
          await repository.setActive(employee, false, transaction);
          await repository.revokeSession(employee.id, transaction);
        }
      }
    }
  });

  await recordAudit(
    actingUser.id,
    isActive ? 'user:activate' : 'user:deactivate',
    'user',
    targetUserId,
  );

  return repository.findById(targetUserId);
}

/**
 * Read-only: what does this user currently hold? Same visibility rule as viewing their user
 * record (GET /users/:id) -- self, their own Manager, or SuperAdmin. Not the same thing as
 * assertCanManageUser, which additionally requires role===employee -- a Manager can *view* their
 * own effective permissions (to know what they're able to delegate) even though nobody manages
 * a Manager's permissions but SuperAdmin.
 */
async function getEffectivePermissionsForUser(actingUser, targetUserId) {
  const targetUser = await repository.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const isSelf = targetUser.id === actingUser.id;
  const isOwnEmployee = actingUser.role === 'manager' && targetUser.manager_id === actingUser.id;
  if (actingUser.role !== 'superadmin' && !isSelf && !isOwnEmployee) {
    throw new ApiError(403, "Not authorized to view this user's permissions");
  }

  return getEffectivePermissions(targetUserId);
}

module.exports = { list, create, grantPermission, setActiveStatus, getEffectivePermissionsForUser };
