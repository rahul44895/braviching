const { Router } = require('express');
const controller = require('./tasks.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const permission = require('../../middleware/permission.middleware');
const clientScope = require('../../middleware/clientScope.middleware');
const validate = require('../../middleware/validate.middleware');
const getEffectivePermissions = require('../../utils/getEffectivePermissions');
const ApiError = require('../../utils/ApiError');
const { createSchema, updateSchema, listQuerySchema } = require('./tasks.validation');
const { Task } = require('../../models');

const router = Router();

router.use(authMiddleware);

router.get('/', validate(listQuerySchema, 'query'), permission('task', 'read'), controller.list);

router.post(
  '/',
  validate(createSchema),
  permission('task', 'create'),
  clientScope(clientScope.fromBody('client_id')),
  controller.create,
);

router.get(
  '/:id',
  permission('task', 'read'),
  clientScope(clientScope.fromRecord(Task)),
  controller.getById,
);

// PATCH is allowed if the task is assigned to the requester OR they hold task:update -- clientScope
// still always applies regardless of which branch grants access (client-scope and permission
// checks are always kept separate, per the spec's core rule).
router.patch(
  '/:id',
  validate(updateSchema),
  clientScope(clientScope.fromRecord(Task)),
  async (req, res, next) => {
    try {
      if (req.resource.assigned_to === req.user.id) return next();
      if (req.user.role === 'superadmin') return next();
      if (req.user.role === 'client') throw new ApiError(403, 'Client accounts are read-only');

      const effective = await getEffectivePermissions(req.user.id);
      const hasPermission = effective.some((p) => p.resource === 'task' && p.action === 'update');
      if (!hasPermission) {
        throw new ApiError(403, 'Not assigned to this task and missing task:update permission');
      }
      next();
    } catch (err) {
      next(err);
    }
  },
  controller.update,
);

router.delete(
  '/:id',
  permission('task', 'delete'),
  clientScope(clientScope.fromRecord(Task)),
  controller.remove,
);

module.exports = router;
