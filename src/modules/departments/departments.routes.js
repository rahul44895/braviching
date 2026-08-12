const { Router } = require('express');
const controller = require('./departments.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const ApiError = require('../../utils/ApiError');
const { createSchema } = require('./departments.validation');

const router = Router();

router.use(authMiddleware);

// Not a modeled permission resource (departments/permissions are the admin scaffolding *behind*
// the permission system, not a domain resource within it) -- role-gated directly, like `users`.
router.get('/', controller.list);

router.post(
  '/',
  validate(createSchema),
  (req, res, next) => {
    if (req.user.role !== 'superadmin') return next(new ApiError(403, 'SuperAdmin only'));
    next();
  },
  controller.create,
);

module.exports = router;
