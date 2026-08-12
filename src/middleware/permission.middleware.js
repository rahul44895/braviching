const getEffectivePermissions = require('../utils/getEffectivePermissions');
const ApiError = require('../utils/ApiError');

function permission(resource, action) {
  return async (req, res, next) => {
    try {
      // SuperAdmin holds "all permissions" by role definition (see canGrantPermission.js for the
      // same reasoning) -- they have no department_id/user_permissions rows to derive it from.
      if (req.user.role === 'superadmin') return next();

      // Client-role users have no department_id and never receive user_permissions grants -- the
      // additive department/grant system doesn't apply to them at all. The spec's "Client:
      // Read-only" rule is enforced directly here instead: any read is allowed (client-scope
      // middleware still restricts them to their own client_id), anything else is rejected.
      if (req.user.role === 'client') {
        if (action === 'read') return next();
        throw new ApiError(403, 'Client accounts are read-only');
      }

      const effective = await getEffectivePermissions(req.user.id);
      const hasPermission = effective.some((p) => p.resource === resource && p.action === action);
      if (!hasPermission) {
        throw new ApiError(403, `Missing permission: ${resource}:${action}`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = permission;
