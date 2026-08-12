const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { User } = require('../models');
const ApiError = require('../utils/ApiError');

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new ApiError(401, 'Missing or malformed Authorization header');
    }

    let payload;
    try {
      payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    } catch {
      throw new ApiError(401, 'Invalid or expired access token');
    }

    const user = await User.findByPk(payload.userId);
    if (!user) throw new ApiError(401, 'User no longer exists');
    // Live re-check, not just token revocation: closes the "still-valid access token" gap for a
    // user deactivated after this token was issued (see users deactivation cascade).
    if (!user.is_active) throw new ApiError(401, 'User account is inactive');

    req.user = {
      id: user.id,
      role: user.role,
      department_id: user.department_id,
      manager_id: user.manager_id,
      client_id: user.client_id,
    };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
