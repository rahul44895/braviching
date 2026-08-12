const { Router } = require('express');
const controller = require('./clients.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const permission = require('../../middleware/permission.middleware');
const clientScope = require('../../middleware/clientScope.middleware');
const validate = require('../../middleware/validate.middleware');
const { createSchema, updateSchema } = require('./clients.validation');
const { Client } = require('../../models');

const router = Router();

router.use(authMiddleware);

// List filters to accessible clients rather than gating the whole route (spec: "client-scope
// filter, not role gate") -- every role can hit this, results differ by scope.
router.get('/', permission('client', 'read'), controller.list);

router.post('/', validate(createSchema), permission('client', 'create'), controller.create);

router.get(
  '/:id',
  permission('client', 'read'),
  clientScope(clientScope.fromRecord(Client)),
  controller.getById,
);

router.patch(
  '/:id',
  validate(updateSchema),
  permission('client', 'update'),
  clientScope(clientScope.fromRecord(Client)),
  controller.update,
);

// Nested read aliases, equivalent to GET /<resource>?client_id=:id -- gated by the *nested*
// resource's own read permission, plus client-scope on the :id param itself.
router.get(
  '/:id/campaigns',
  permission('campaign', 'read'),
  clientScope(clientScope.fromParam('id')),
  controller.campaigns,
);
router.get(
  '/:id/tasks',
  permission('task', 'read'),
  clientScope(clientScope.fromParam('id')),
  controller.tasks,
);
router.get(
  '/:id/storefronts',
  permission('storefront', 'read'),
  clientScope(clientScope.fromParam('id')),
  controller.storefronts,
);
router.get(
  '/:id/marketplace-accounts',
  permission('marketplace_account', 'read'),
  clientScope(clientScope.fromParam('id')),
  controller.marketplaceAccounts,
);

module.exports = router;
