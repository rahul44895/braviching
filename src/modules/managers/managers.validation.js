const { z } = require('zod');

const assignClientSchema = z.object({
  client_id: z.coerce.number().int().positive(),
});

module.exports = { assignClientSchema };
