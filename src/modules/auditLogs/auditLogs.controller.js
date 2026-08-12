const service = require('./auditLogs.service');

async function list(req, res, next) {
  try {
    res.json(await service.list(req.query));
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
