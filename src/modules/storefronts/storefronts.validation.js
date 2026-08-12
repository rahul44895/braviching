const { z } = require('zod');

const createSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  platform: z.enum(['shopify', 'amazon', 'magento', 'headless']),
  url: z.string().url(),
  status: z.string().min(1).optional(),
});

const updateSchema = createSchema.partial().omit({ client_id: true });

const listQuerySchema = z.object({
  client_id: z.coerce.number().int().positive().optional(),
});

module.exports = { createSchema, updateSchema, listQuerySchema };
