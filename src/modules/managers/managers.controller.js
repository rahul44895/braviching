const service = require('./managers.service');

async function assignClient(req, res, next) {
  try {
    const assignment = await service.assignClient(
      req.user,
      Number(req.params.id),
      req.body.client_id,
    );
    res.status(201).json(assignment);
  } catch (err) {
    next(err);
  }
}

module.exports = { assignClient };
