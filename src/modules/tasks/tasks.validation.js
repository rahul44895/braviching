const { z } = require('zod');

const createSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  assigned_to: z.coerce.number().int().positive().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  category: z.enum(['marketplace', 'paid_media', 'email', 'storefront']),
  status: z.enum(['open', 'in_progress', 'done']).optional(),
  due_date: z.string().date().optional().nullable(),
});

const updateSchema = createSchema.partial().omit({ client_id: true });

const listQuerySchema = z.object({
  client_id: z.coerce.number().int().positive().optional(),
  assigned_to: z.coerce.number().int().positive().optional(),
  status: z.enum(['open', 'in_progress', 'done']).optional(),
});

module.exports = { createSchema, updateSchema, listQuerySchema };
