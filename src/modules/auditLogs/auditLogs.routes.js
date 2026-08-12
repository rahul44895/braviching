const { Router } = require('express');
const controller = require('./auditLogs.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const ApiError = require('../../utils/ApiError');

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  (req, res, next) => {
    if (req.user.role !== 'superadmin') return next(new ApiError(403, 'SuperAdmin only'));
    next();
  },
  controller.list,
);

module.exports = router;
