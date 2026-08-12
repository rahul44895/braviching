const service = require('./clients.service');

async function list(req, res, next) {
  try {
    res.json(await service.list(req.user));
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
    const client = await service.create(req.user, req.body);
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    res.json(await service.update(req.user, req.resource, req.body));
  } catch (err) {
    next(err);
  }
}

async function campaigns(req, res, next) {
  try {
    res.json(await service.campaigns(req.clientId));
  } catch (err) {
    next(err);
  }
}

async function tasks(req, res, next) {
  try {
    res.json(await service.tasks(req.clientId));
  } catch (err) {
    next(err);
  }
}

async function storefronts(req, res, next) {
  try {
    res.json(await service.storefronts(req.clientId));
  } catch (err) {
    next(err);
  }
}

async function marketplaceAccounts(req, res, next) {
  try {
    res.json(await service.marketplaceAccounts(req.clientId));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  update,
  campaigns,
  tasks,
  storefronts,
  marketplaceAccounts,
};
