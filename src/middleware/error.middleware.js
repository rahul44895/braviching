const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, next) {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Internal server error';

  const logPayload = {
    requestId: req.id,
    userId: req.user && req.user.id,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    message: err.message,
    stack: err.stack,
  };

  if (isApiError) {
    logger.warn('Request error', logPayload);
  } else {
    logger.error('Unhandled error', logPayload);
  }

  res.status(statusCode).json({ error: { message, requestId: req.id } });
}

module.exports = errorMiddleware;
