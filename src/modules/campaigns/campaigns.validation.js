const { z } = require('zod');

const createSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  channel: z.enum(['google', 'meta', 'tiktok', 'email']),
  name: z.string().min(1),
  budget: z.coerce.number().nonnegative().optional(),
  status: z.string().min(1).optional(),
  start_date: z.string().date().optional().nullable(),
  end_date: z.string().date().optional().nullable(),
});

const updateSchema = createSchema.partial().omit({ client_id: true });

const listQuerySchema = z.object({
  client_id: z.coerce.number().int().positive().optional(),
  status: z.string().optional(),
});

module.exports = { createSchema, updateSchema, listQuerySchema };
