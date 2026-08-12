const authService = require('./auth.service');
const env = require('../../config/env');
const { User } = require('../../models');
const ApiError = require('../../utils/ApiError');

// Must match the mount path in app.js (/api/auth) -- the browser only attaches a cookie to
// requests whose path starts with the cookie's Path attribute. This broke silent session
// restoration after /auth was moved to /api/auth (to stop colliding with the frontend's own
// /clients-style routes) until caught by an actual browser test.
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'strict',
  path: '/api/auth',
};

function setRefreshCookie(res, refreshToken) {
  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTS);
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken } = await authService.login(email, password);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const presentedToken = req.cookies && req.cookies.refreshToken;
    const { accessToken, refreshToken } = await authService.refresh(presentedToken);
    setRefreshCookie(res, refreshToken);
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    await authService.logout(req.user.id);
    res.clearCookie('refreshToken', { path: '/api/auth' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    // req.user (from auth.middleware) only carries id/role/department_id/manager_id/client_id --
    // enough for authorization checks, not enough to render "logged in as <name>" in the UI.
    const user = await User.findByPk(req.user.id);
    if (!user) throw new ApiError(404, 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout, me };
