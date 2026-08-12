const { z } = require('zod');

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['superadmin', 'manager', 'employee', 'client']),
  department_id: z.coerce.number().int().positive().optional().nullable(),
  manager_id: z.coerce.number().int().positive().optional().nullable(),
  client_id: z.coerce.number().int().positive().optional().nullable(),
});

const grantPermissionSchema = z.object({
  permission_id: z.coerce.number().int().positive(),
});

const statusSchema = z.object({
  is_active: z.boolean(),
});

module.exports = { createSchema, grantPermissionSchema, statusSchema };
