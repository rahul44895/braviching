const { User, ClientAssignment } = require('../../models');
const recordAudit = require('../../utils/recordAudit');
const ApiError = require('../../utils/ApiError');

async function assignClient(actingUser, managerId, clientId) {
  const manager = await User.findByPk(managerId);
  if (!manager || manager.role !== 'manager') {
    throw new ApiError(404, 'Manager not found');
  }

  // Soft-delete-aware: restore a previously-unassigned pairing instead of inserting a duplicate
  // (same pattern as user_permissions -- the unique index covers soft-deleted rows too).
  const existing = await ClientAssignment.findOne({
    where: { manager_id: managerId, client_id: clientId },
    paranoid: false,
  });

  let assignment;
  if (existing) {
    if (existing.deleted_at) await existing.restore();
    assignment = existing;
  } else {
    assignment = await ClientAssignment.create({ manager_id: managerId, client_id: clientId });
  }

  await recordAudit(actingUser.id, 'client_assignment:create', 'client_assignment', assignment.id);
  return assignment;
}

module.exports = { assignClient };
