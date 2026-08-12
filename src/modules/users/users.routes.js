const { Router } = require('express');
const controller = require('./users.controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { createSchema, grantPermissionSchema, statusSchema } = require('./users.validation');

const router = Router();

router.use(authMiddleware);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', validate(createSchema), controller.create);
router.patch('/:id/permissions', validate(grantPermissionSchema), controller.grantPermission);
router.patch('/:id/status', validate(statusSchema), controller.setStatus);

module.exports = router;
