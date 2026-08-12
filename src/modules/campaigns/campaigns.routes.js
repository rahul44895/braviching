const { Router } = require('express');
const controller = require('./campaigns.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const permission = require('../../middleware/permission.middleware');
const clientScope = require('../../middleware/clientScope.middleware');
const validate = require('../../middleware/validate.middleware');
const { createSchema, updateSchema, listQuerySchema } = require('./campaigns.validation');
const { Campaign } = require('../../models');

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validate(listQuerySchema, 'query'),
  permission('campaign', 'read'),
  controller.list,
);

router.post(
  '/',
  validate(createSchema),
  permission('campaign', 'create'),
  clientScope(clientScope.fromBody('client_id')),
  controller.create,
);

router.get(
  '/:id',
  permission('campaign', 'read'),
  clientScope(clientScope.fromRecord(Campaign)),
  controller.getById,
);

router.patch(
  '/:id',
  validate(updateSchema),
  permission('campaign', 'update'),
  clientScope(clientScope.fromRecord(Campaign)),
  controller.update,
);

router.delete(
  '/:id',
  permission('campaign', 'delete'),
  clientScope(clientScope.fromRecord(Campaign)),
  controller.remove,
);

module.exports = router;
