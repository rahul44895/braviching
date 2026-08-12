const { Router } = require('express');
const controller = require('./managers.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const ApiError = require('../../utils/ApiError');
const { assignClientSchema } = require('./managers.validation');

const router = Router();

router.use(authMiddleware);

router.post(
  '/:id/clients',
  validate(assignClientSchema),
  (req, res, next) => {
    if (req.user.role !== 'superadmin') return next(new ApiError(403, 'SuperAdmin only'));
    next();
  },
  controller.assignClient,
);

module.exports = router;
