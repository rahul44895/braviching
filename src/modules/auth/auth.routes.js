const { Router } = require('express');
const controller = require('./auth.controller');
const validate = require('../../middleware/validate.middleware');
const authMiddleware = require('../../middleware/auth.middleware');
const { loginSchema } = require('./auth.validation');

const router = Router();

router.post('/login', validate(loginSchema), controller.login);
router.post('/refresh', controller.refresh);
router.post('/logout', authMiddleware, controller.logout);

module.exports = router;
