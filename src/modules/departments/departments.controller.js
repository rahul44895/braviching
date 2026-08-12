const service = require('./departments.service');

async function list(req, res, next) {
  try {
    res.json(await service.list());
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const department = await service.create(req.user, req.body);
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
