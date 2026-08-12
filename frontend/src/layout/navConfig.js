// Single source of truth for the sidebar -- each item's `roles` mirrors what the backend actually
// gates that resource to (see README's permission model), so the nav doesn't offer a link that
// would just 403.
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', roles: ['superadmin', 'manager', 'employee'] },
  { to: '/clients', label: 'Clients', roles: ['superadmin', 'manager', 'employee'] },
  { to: '/campaigns', label: 'Campaigns', roles: ['superadmin', 'manager', 'employee'] },
  { to: '/tasks', label: 'Tasks', roles: ['superadmin', 'manager', 'employee'] },
  { to: '/storefronts', label: 'Storefronts', roles: ['superadmin', 'manager', 'employee'] },
  {
    to: '/marketplace-accounts',
    label: 'Marketplace Accounts',
    roles: ['superadmin', 'manager', 'employee'],
  },
  { to: '/users', label: 'Users & Permissions', roles: ['superadmin', 'manager'] },
  { to: '/audit-logs', label: 'Audit Logs', roles: ['superadmin'] },
];
