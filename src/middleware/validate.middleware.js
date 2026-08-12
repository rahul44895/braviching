const ApiError = require('../utils/ApiError');

function validate(schema, part = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
      return next(new ApiError(400, `Validation failed: ${issues.join('; ')}`));
    }
    req[part] = result.data;
    next();
  };
}

module.exports = validate;
