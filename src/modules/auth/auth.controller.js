const authService = require('./auth.service');
const env = require('../../config/env');

const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: env.COOKIE_SECURE,
  sameSite: 'strict',
  path: '/auth',
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
    res.clearCookie('refreshToken', { path: '/auth' });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { login, refresh, logout };
