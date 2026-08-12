const bcrypt = require('bcrypt');
const {
  User,
  UserPermission,
  DepartmentDefaultPermission,
  RefreshToken,
  sequelize,
} = require('../../models');

function findAllForManager(managerId) {
  return User.findAll({ where: { manager_id: managerId }, order: [['id', 'ASC']] });
}

function findAll() {
  return User.findAll({ order: [['id', 'ASC']] });
}

function findById(id) {
  return User.findByPk(id);
}

async function create(data) {
  const password_hash = await bcrypt.hash(data.password, 10);
  return User.create({
    name: data.name,
    email: data.email,
    password_hash,
    role: data.role,
    department_id: data.department_id ?? null,
    manager_id: data.manager_id ?? null,
    client_id: data.client_id ?? null,
  });
}

// Default (paranoid) scope -- only an ACTIVE row counts. Used to decide which branch
// setUserPermission takes; upsert/remove below do their own paranoid:false lookups.
function findActiveUserPermissionRow(userId, permissionId) {
  return UserPermission.findOne({ where: { user_id: userId, permission_id: permissionId } });
}

async function departmentHasDefault(departmentId, permissionId) {
  if (!departmentId) return false;
  const row = await DepartmentDefaultPermission.findOne({
    where: { department_id: departmentId, permission_id: permissionId },
  });
  return !!row;
}

// Batch versions of the above two, for rendering the full per-permission status list (one query
// each instead of one per catalog permission).
async function findDepartmentDefaultPermissionIds(departmentId) {
  if (!departmentId) return [];
  const rows = await DepartmentDefaultPermission.findAll({
    where: { department_id: departmentId },
    attributes: ['permission_id'],
  });
  return rows.map((r) => r.permission_id);
}

function findAllActiveUserPermissionRows(userId) {
  return UserPermission.findAll({ where: { user_id: userId } });
}

/**
 * Idempotent upsert: if a (user_id, permission_id) row was previously soft-deleted, restore it
 * instead of inserting a duplicate (the unique index covers soft-deleted rows too). Shared by
 * upsertGrant/upsertRevoke below -- only the `type` differs.
 */
async function upsertUserPermissionRow(userId, permissionId, actingUserId, type) {
  const existing = await UserPermission.findOne({
    where: { user_id: userId, permission_id: permissionId },
    paranoid: false,
  });

  if (existing) {
    if (existing.deleted_at) await existing.restore();
    existing.type = type;
    existing.granted_by = actingUserId;
    await existing.save();
    return existing;
  }

  return UserPermission.create({
    user_id: userId,
    permission_id: permissionId,
    granted_by: actingUserId,
    type,
  });
}

function upsertGrant(userId, permissionId, actingUserId) {
  return upsertUserPermissionRow(userId, permissionId, actingUserId, 'grant');
}

function upsertRevoke(userId, permissionId, actingUserId) {
  return upsertUserPermissionRow(userId, permissionId, actingUserId, 'revoke');
}

// `row` is already known to be an active row (from findActiveUserPermissionRow) -- soft-delete it.
function removeGrant(row) {
  return row.destroy();
}

function removeRevoke(row) {
  return row.destroy();
}

function findEmployeesOfManager(managerId, transaction) {
  return User.findAll({ where: { manager_id: managerId, role: 'employee' }, transaction });
}

async function setActive(user, isActive, transaction) {
  await user.update({ is_active: isActive }, { transaction });
}

async function revokeSession(userId, transaction) {
  await RefreshToken.destroy({ where: { user_id: userId }, transaction });
}

function runInTransaction(work) {
  return sequelize.transaction(work);
}

module.exports = {
  findAllForManager,
  findAll,
  findById,
  create,
  findActiveUserPermissionRow,
  departmentHasDefault,
  findDepartmentDefaultPermissionIds,
  findAllActiveUserPermissionRows,
  upsertGrant,
  upsertRevoke,
  removeGrant,
  removeRevoke,
  findEmployeesOfManager,
  setActive,
  revokeSession,
  runInTransaction,
};
