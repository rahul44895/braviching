const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(1),
});

module.exports = { createSchema };
