const service = require('./campaigns.service');

async function list(req, res, next) {
  try {
    const campaigns = await service.list(req.user, req.query);
    res.json(campaigns);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    res.json(req.resource);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const campaign = await service.create(req.user, req.body);
    res.status(201).json(campaign);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const campaign = await service.update(req.user, req.resource, req.body);
    res.json(campaign);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    await service.remove(req.user, req.resource);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, getById, create, update, remove };
