const { z } = require('zod');

const createSchema = z.object({
  company_name: z.string().min(1),
});

const updateSchema = createSchema.partial();

module.exports = { createSchema, updateSchema };
