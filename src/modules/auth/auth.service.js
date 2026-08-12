const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../../config/env');
const parseDuration = require('../../utils/parseDuration');
const ApiError = require('../../utils/ApiError');
const { User, RefreshToken } = require('../../models');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
  });
}

function signRefreshToken(user) {
  return jwt.sign({ userId: user.id }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_TTL,
  });
}

async function issueTokenPair(user) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + parseDuration(env.REFRESH_TOKEN_TTL));

  await RefreshToken.upsert({
    user_id: user.id,
    token_hash: hashToken(refreshToken),
    expires_at: expiresAt,
    revoked_at: null,
  });

  return { accessToken, refreshToken };
}

async function login(email, password) {
  const user = await User.scope('withPassword').findOne({ where: { email } });
  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (!user.is_active) throw new ApiError(401, 'User account is inactive');

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) throw new ApiError(401, 'Invalid email or password');

  return issueTokenPair(user);
}

async function refresh(presentedToken) {
  if (!presentedToken) throw new ApiError(401, 'Missing refresh token');

  let payload;
  try {
    payload = jwt.verify(presentedToken, env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const stored = await RefreshToken.findOne({ where: { user_id: payload.userId } });
  const presentedHash = hashToken(presentedToken);

  const valid =
    stored &&
    !stored.revoked_at &&
    stored.token_hash.length === presentedHash.length &&
    crypto.timingSafeEqual(Buffer.from(stored.token_hash), Buffer.from(presentedHash));

  if (!valid) {
    // Defensive: presented token didn't match what's on file -- possible reuse/theft, drop the
    // stored token so a stale/leaked refresh token can't be retried (basic reuse-defense, not
    // full token-family tracking).
    if (stored) await stored.destroy();
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await User.findByPk(payload.userId);
  if (!user || !user.is_active) throw new ApiError(401, 'User account is inactive');

  return issueTokenPair(user);
}

async function logout(userId) {
  await RefreshToken.destroy({ where: { user_id: userId } });
}

module.exports = { login, refresh, logout, hashToken };
