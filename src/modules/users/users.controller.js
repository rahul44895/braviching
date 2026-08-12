const service = require('./users.service');
const ApiError = require('../../utils/ApiError');
const { findById } = require('./users.repository');

async function list(req, res, next) {
  try {
    res.json(await service.list(req.user));
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const user = await findById(req.params.id);
    if (!user) throw new ApiError(404, 'User not found');

    const isSelf = user.id === req.user.id;
    const isOwnEmployee = req.user.role === 'manager' && user.manager_id === req.user.id;
    if (req.user.role !== 'superadmin' && !isSelf && !isOwnEmployee) {
      throw new ApiError(403, 'Not authorized to view this user');
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const user = await service.create(req.user, req.body);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

async function grantPermission(req, res, next) {
  try {
    await service.setUserPermission(req.user, Number(req.params.id), req.body.permission_id, true);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function revokePermission(req, res, next) {
  try {
    await service.setUserPermission(
      req.user,
      Number(req.params.id),
      Number(req.params.permissionId),
      false,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function setStatus(req, res, next) {
  try {
    const user = await service.setActiveStatus(req.user, Number(req.params.id), req.body.is_active);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function getPermissions(req, res, next) {
  try {
    const permissions = await service.getEffectivePermissionsForUser(
      req.user,
      Number(req.params.id),
    );
    res.json(permissions);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  list,
  getById,
  create,
  grantPermission,
  revokePermission,
  setStatus,
  getPermissions,
};
