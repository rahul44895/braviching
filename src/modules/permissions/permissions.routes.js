const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const { Permission } = require('../../models');

const router = Router();

router.use(authMiddleware);

// The permission catalog itself (id/resource/action) isn't sensitive -- it's the set of things
// that *could* be granted, not who holds what. Any authenticated staff role can read it; it's
// needed to render a grant UI at all.
router.get('/', async (req, res, next) => {
  try {
    const permissions = await Permission.findAll({
      order: [
        ['resource', 'ASC'],
        ['action', 'ASC'],
      ],
    });
    res.json(permissions);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
