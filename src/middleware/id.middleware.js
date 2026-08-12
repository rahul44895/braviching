const { randomUUID } = require('crypto');

function idMiddleware(req, res, next) {
  req.id = randomUUID();
  next();
}

module.exports = idMiddleware;
