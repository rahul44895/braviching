const getAccessibleClientIds = require('../utils/getAccessibleClientIds');
const ApiError = require('../utils/ApiError');

/**
 * Factory: clientScope(resolveClientId) where resolveClientId(req) -> Promise<number|null>
 * returns the client_id the request targets. Never used on list endpoints -- those filter by
 * accessible ids in the repository layer instead (see plan: "filter, not role gate").
 */
function clientScope(resolveClientId) {
  return async (req, res, next) => {
    try {
      const clientId = await resolveClientId(req);
      const accessibleIds = await getAccessibleClientIds(req.user);
      if (accessibleIds !== 'ALL' && !accessibleIds.includes(clientId)) {
        throw new ApiError(403, 'Not authorized for this client');
      }
      req.clientId = clientId;
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Resolver helpers -----------------------------------------------------------

clientScope.fromParam = (field = 'id') => {
  return (req) => Number(req.params[field]);
};

clientScope.fromBody = (field = 'client_id') => {
  return (req) => Number(req.body[field]);
};

clientScope.fromQuery = (field = 'client_id') => {
  return (req) => Number(req.query[field]);
};

/**
 * For update/delete-by-id routes: fetches the record first (so the scope check reflects the
 * record's actual client_id, not a param an attacker could forge) and stashes it on req.resource
 * so the controller/service doesn't need to fetch it a second time.
 */
clientScope.fromRecord = (Model, paramField = 'id') => {
  return async (req) => {
    const record = await Model.findByPk(req.params[paramField]);
    if (!record) throw new ApiError(404, 'Resource not found');
    req.resource = record;
    return record.client_id;
  };
};

module.exports = clientScope;
