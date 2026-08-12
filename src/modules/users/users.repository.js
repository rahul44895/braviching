const bcrypt = require('bcrypt');
const { User, UserPermission, RefreshToken, sequelize } = require('../../models');

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

/**
 * Idempotent grant: if a (user_id, permission_id) row was previously soft-deleted, restore it
 * instead of inserting a duplicate (the unique index covers soft-deleted rows too -- see the
 * soft-delete design note in the plan for why "re-grant after soft-delete" means restore).
 */
async function grantPermission(userId, permissionId, grantedBy) {
  const existing = await UserPermission.findOne({
    where: { user_id: userId, permission_id: permissionId },
    paranoid: false,
  });

  if (existing) {
    if (existing.deleted_at) await existing.restore();
    existing.granted_by = grantedBy;
    await existing.save();
    return existing;
  }

  return UserPermission.create({
    user_id: userId,
    permission_id: permissionId,
    granted_by: grantedBy,
  });
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
  grantPermission,
  findEmployeesOfManager,
  setActive,
  revokeSession,
  runInTransaction,
};
