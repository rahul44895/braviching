const { Router } = require('express');
const controller = require('./marketplaceAccounts.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const permission = require('../../middleware/permission.middleware');
const clientScope = require('../../middleware/clientScope.middleware');
const validate = require('../../middleware/validate.middleware');
const { createSchema, updateSchema, listQuerySchema } = require('./marketplaceAccounts.validation');
const { MarketplaceAccount } = require('../../models');

const router = Router();

router.use(authMiddleware);

router.get(
  '/',
  validate(listQuerySchema, 'query'),
  permission('marketplace_account', 'read'),
  controller.list,
);

router.post(
  '/',
  validate(createSchema),
  permission('marketplace_account', 'create'),
  clientScope(clientScope.fromBody('client_id')),
  controller.create,
);

router.get(
  '/:id',
  permission('marketplace_account', 'read'),
  clientScope(clientScope.fromRecord(MarketplaceAccount)),
  controller.getById,
);

router.patch(
  '/:id',
  validate(updateSchema),
  permission('marketplace_account', 'update'),
  clientScope(clientScope.fromRecord(MarketplaceAccount)),
  controller.update,
);

router.delete(
  '/:id',
  permission('marketplace_account', 'delete'),
  clientScope(clientScope.fromRecord(MarketplaceAccount)),
  controller.remove,
);

module.exports = router;
