const { Router } = require('express');
const controller = require('./storefronts.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const permission = require('../../middleware/permission.middleware');
const clientScope = require('../../middleware/clientScope.middleware');
const validate = require('../../middleware/validate.middleware');
const { createSchema, updateSchema, listQuerySchema } = require('./storefronts.validation');
const { Storefront } = require('../../models');

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validate(listQuerySchema, 'query'),
  permission('storefront', 'read'),
  controller.list,
);

router.post(
  '/',
  validate(createSchema),
  permission('storefront', 'create'),
  clientScope(clientScope.fromBody('client_id')),
  controller.create,
);

router.get(
  '/:id',
  permission('storefront', 'read'),
  clientScope(clientScope.fromRecord(Storefront)),
  controller.getById,
);

router.patch(
  '/:id',
  validate(updateSchema),
  permission('storefront', 'update'),
  clientScope(clientScope.fromRecord(Storefront)),
  controller.update,
);

router.delete(
  '/:id',
  permission('storefront', 'delete'),
  clientScope(clientScope.fromRecord(Storefront)),
  controller.remove,
);

module.exports = router;
