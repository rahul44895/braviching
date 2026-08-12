const { User, Permission, DepartmentDefaultPermission, UserPermission } = require('../models');
const ApiError = require('./ApiError');

async function getEffectivePermissions(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const [deptPerms, userPerms] = await Promise.all([
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
          where: { user_id: userId },
          attributes: [],
        },
      ],
    }),
  ]);

  const merged = new Map();
  [...deptPerms, ...userPerms].forEach((p) => merged.set(p.id, p));
  return [...merged.values()];
}

module.exports = getEffectivePermissions;
