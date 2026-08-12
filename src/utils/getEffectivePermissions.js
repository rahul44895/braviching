const { User, Permission, DepartmentDefaultPermission, UserPermission } = require('../models');
const ApiError = require('./ApiError');

// effective = (department_defaults ∪ grant_rows) − revoke_rows
// See docs/superpowers/specs/2026-08-13-permission-revocation-design.md.
async function getEffectivePermissions(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const [deptPerms, grantPerms, revokePerms] = await Promise.all([
    user.department_id
      ? Permission.findAll({
          include: [
            {
              model: DepartmentDefaultPermission,
              where: { department_id: user.department_id },
              attributes: [],
            },
          ],
        })
      : [],
    Permission.findAll({
      include: [
        {
          model: UserPermission,
          where: { user_id: userId, type: 'grant' },
          attributes: [],
        },
      ],
    }),
    Permission.findAll({
      include: [
        {
          model: UserPermission,
          where: { user_id: userId, type: 'revoke' },
          attributes: [],
        },
      ],
    }),
  ]);

  const revokedIds = new Set(revokePerms.map((p) => p.id));

  const merged = new Map();
  [...deptPerms, ...grantPerms].forEach((p) => {
    if (!revokedIds.has(p.id)) merged.set(p.id, p);
  });
  return [...merged.values()];
}

module.exports = getEffectivePermissions;
