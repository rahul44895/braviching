const repository = require('./users.repository');
const assertCanManageUser = require('../../utils/assertCanManageUser');
const canGrantPermission = require('../../utils/canGrantPermission');
const recordAudit = require('../../utils/recordAudit');
const ApiError = require('../../utils/ApiError');
const { Permission } = require('../../models');

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
 * Shared delegation endpoint for both SuperAdmin->Manager and Manager->Employee, grant AND
 * revoke alike -- doesn't branch on granter role beyond assertCanManageUser (+ canGrantPermission,
 * only for the branch that actually expands access). See
 * docs/superpowers/specs/2026-08-13-permission-revocation-design.md for the full reasoning.
 *
 * `held` decides direction: true = "make sure this is held" (grant, or undo a prior revoke),
 * false = "make sure this is not held" (revoke, or undo a prior grant).
 */
async function setUserPermission(actingUser, targetUserId, permissionId, held) {
  const targetUser = await repository.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  assertCanManageUser(actingUser, targetUser);

  const deptHasDefault = await repository.departmentHasDefault(
    targetUser.department_id,
    permissionId,
  );
  const existingRow = await repository.findActiveUserPermissionRow(targetUserId, permissionId);

  if (held) {
    if (existingRow?.type === 'revoke') {
      await repository.removeRevoke(existingRow);
    } else if (!deptHasDefault) {
      // Only branch that expands access beyond what the department already provides -- the only
      // one bounded by canGrantPermission. Un-revoking (above) restores access the department
      // already intends for this user's role; it isn't a new grant.
      const allowed = await canGrantPermission(actingUser.id, permissionId);
      if (!allowed) {
        throw new ApiError(403, 'Cannot grant a permission you do not yourself hold');
      }
      await repository.upsertGrant(targetUserId, permissionId, actingUser.id);
    }
    // else: already held via department default, nothing to do (idempotent)
  } else {
    if (existingRow?.type === 'grant') {
      await repository.removeGrant(existingRow);
    } else if (deptHasDefault) {
      // Revocation is deliberately unrestricted (no canGrantPermission check) -- reducing access
      // carries no privilege-escalation risk, only assertCanManageUser's ownership rule applies.
      await repository.upsertRevoke(targetUserId, permissionId, actingUser.id);
    }
    // else: not held anyway, nothing to do (idempotent)
  }

  await recordAudit(
    actingUser.id,
    held ? 'user:grant_permission' : 'user:revoke_permission',
    'user',
    targetUserId,
  );
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
 * Read-only: for every permission in the catalog, where does this user currently stand?
 * 'department' | 'grant' | 'revoked' | 'none' -- see the design spec for what each means. Same
 * visibility rule as viewing the user record (GET /users/:id) -- self, their own Manager, or
 * SuperAdmin.
 *
 * SuperAdmin targets: they have no department_id and never receive user_permissions rows (their
 * access is role-derived, bypassing this whole model -- see permission.middleware.js), so every
 * permission mechanically resolves to 'none' here. That's correct given the underlying data, not
 * a bug -- the frontend already knows the target's role and disables the panel for SuperAdmin
 * targets rather than presenting a misleading "holds nothing" checklist.
 */
async function getEffectivePermissionsForUser(actingUser, targetUserId) {
  const targetUser = await repository.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  const isSelf = targetUser.id === actingUser.id;
  const isOwnEmployee = actingUser.role === 'manager' && targetUser.manager_id === actingUser.id;
  if (actingUser.role !== 'superadmin' && !isSelf && !isOwnEmployee) {
    throw new ApiError(403, "Not authorized to view this user's permissions");
  }

  const [catalog, defaultIds, rows] = await Promise.all([
    Permission.findAll({
      order: [
        ['resource', 'ASC'],
        ['action', 'ASC'],
      ],
    }),
    repository.findDepartmentDefaultPermissionIds(targetUser.department_id),
    repository.findAllActiveUserPermissionRows(targetUserId),
  ]);

  const defaultIdSet = new Set(defaultIds);
  const rowByPermissionId = new Map(rows.map((r) => [r.permission_id, r]));

  return catalog.map((permission) => {
    const row = rowByPermissionId.get(permission.id);
    const isDefault = defaultIdSet.has(permission.id);

    let source;
    if (row?.type === 'grant') source = 'grant';
    else if (row?.type === 'revoke') source = 'revoked';
    else if (isDefault) source = 'department';
    else source = 'none';

    return {
      id: permission.id,
      resource: permission.resource,
      action: permission.action,
      source,
    };
  });
}

module.exports = {
  list,
  create,
  setUserPermission,
  setActiveStatus,
  getEffectivePermissionsForUser,
};
