# Client Ops & Campaign Manager — RBAC Project Spec

Full-Stack Developer Assessment reference doc. Use this as the source of truth when building with Claude Code — paste relevant sections into prompts as needed.

---

## 1. Project Overview

An internal tool for an ecommerce ops agency to manage clients, marketplace accounts, ad campaigns, and tasks across staff with layered, delegatable permissions.

**Domain entities:**

- **Clients** — the ecommerce brands the agency serves (e.g. "Acme Sportswear")
- **Storefronts** — the client's actual customer-facing store (Shopify site, Amazon listing page) — the thing customers buy from
- **Marketplace Accounts** — the seller/account-level presence the agency manages on behalf of a client (Amazon Seller Central account, eBay shop, Walmart seller account)
- **Campaigns** — paid ad campaigns run for a client (Google, Meta, TikTok, email)
- **Tasks** — day-to-day work items assigned to staff, scoped to a client (e.g. "Fix checkout flow on Nova Skincare's Shopify storefront", "Set up Klaviyo abandoned-cart flow for Acme", "Audit Amazon listing images for Acme")

**Tech stack:**

- Frontend: React (Vite)
- Backend: Node.js + Express
- Database: MongoDB

---

## 2. Roles

| Role           | Scope                                                                                                                                                                                                                                                                                                    |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SuperAdmin** | All permissions, all clients, all users. Assigns clients to Managers. Can grant/modify any user's permissions.                                                                                                                                                                                           |
| **Manager**    | Default permissions inherited from their department. Sees only clients assigned to them by SuperAdmin. Can grant permissions to their own Employees — but only from the set of permissions the Manager themself holds (cannot grant a superset of their own access).                                     |
| **Employee**   | Belongs to a Manager (`manager_id`). Default permissions inherited from department, can be individually customized by their Manager (bounded by Manager's own permission set). Can only see clients their Manager has been assigned — no separate assignment table, always resolved through the Manager. |
| **Client**     | Read-only. Sees only their own account's campaigns, tasks, and reports.                                                                                                                                                                                                                                  |

**Core rule (permission delegation):** A user can never grant another user a permission they do not themselves hold. This applies SuperAdmin → Manager and Manager → Employee identically — same function, reused at both levels.

**Core rule (client-access cascade):** Client visibility is never duplicated down to the Employee level. An Employee's accessible clients = their Manager's assigned clients, resolved live via `manager_id` at query time. This guarantees an Employee can never see a client their own Manager cannot see, without a separate check.

---

## 3. Database Schema (MySQL)

```sql
departments
  id, name   -- e.g. 'marketplace_ops', 'paid_media', 'email_retention', 'storefront_craft'

users
  id, name, email, password_hash,
  role ENUM('superadmin','manager','employee','client'),
  department_id (FK -> departments.id, nullable — null for superadmin/client),
  manager_id (FK -> users.id, nullable — set for employees only),
  client_id (FK -> clients.id, nullable — set for client-role users only),
  created_at

permissions
  id, resource (e.g. 'client','campaign','task','marketplace_account'),
  action (e.g. 'create','read','update','delete')

department_default_permissions
  department_id (FK -> departments.id),
  permission_id (FK -> permissions.id)
  -- template: what any employee/manager in this department gets by default

user_permissions
  user_id (FK -> users.id),
  permission_id (FK -> permissions.id),
  granted_by (FK -> users.id)
  -- ADDITIVE ONLY: extra permissions layered on top of department defaults
  -- SuperAdmin uses this on Managers; Manager uses this on their Employees
  -- NOTE (documented limitation, not built): this table only supports granting
  -- extra permissions, not revoking a department default from one specific user.
  -- Production version would add a `type ENUM('grant','revoke')` column.

client_assignments
  manager_id (FK -> users.id),
  client_id (FK -> clients.id)
  -- SuperAdmin assigns clients to Managers here.
  -- Employees are NEVER given their own row — their access is resolved
  -- through this table via their manager_id (see section 5).

clients
  id, company_name, created_at

storefronts
  id, client_id (FK -> clients.id),
  platform ENUM('shopify','amazon','magento','headless'),
  url, status, created_at

marketplace_accounts
  id, client_id (FK -> clients.id),
  platform ENUM('amazon','ebay','walmart','shopify'),
  status, created_at

campaigns
  id, client_id (FK -> clients.id),
  channel ENUM('google','meta','tiktok','email'),
  name, budget, status, start_date, end_date

tasks
  id, client_id (FK -> clients.id),
  assigned_to (FK -> users.id),
  title, description,
  category ENUM('marketplace','paid_media','email','storefront'),
  status ENUM('open','in_progress','done'),
  due_date, created_at

audit_logs   -- bonus
  id, user_id, action, resource, resource_id, timestamp
```

**Indexes:**
`client_assignments(manager_id)`, `users(manager_id)`, `users(department_id)`,
`campaigns(client_id)`, `tasks(client_id)`, `tasks(assigned_to)`,
composite `tasks(client_id, status)` and `campaigns(client_id, status)` for filtered list views.

---

## 4. Permission Resolution

**Effective permissions for any user = union of:**

1. `department_default_permissions` where `department_id = user.department_id`
2. `user_permissions` where `user_id = user.id`

```sql
-- getEffectivePermissions(userId)
SELECT p.resource, p.action FROM permissions p
JOIN department_default_permissions ddp ON ddp.permission_id = p.id
WHERE ddp.department_id = (SELECT department_id FROM users WHERE id = :userId)

UNION

SELECT p.resource, p.action FROM permissions p
JOIN user_permissions up ON up.permission_id = p.id
WHERE up.user_id = :userId
```

**Delegation check (used both SuperAdmin→Manager and Manager→Employee):**

```js
async function canGrantPermission(granterId, permissionId) {
  const granterPerms = await getEffectivePermissions(granterId);
  return granterPerms.some((p) => p.id === permissionId);
}
// Reject the grant request with 403 if this returns false.
```

---

## 5. Client-Access Resolution

```js
// getAccessibleClientIds(user)
switch (user.role) {
  case 'superadmin':
    return 'ALL'; // no filter applied
  case 'manager':
    return db('client_assignments').where('manager_id', user.id).pluck('client_id');
  case 'employee':
    // resolved through the manager, not a separate table
    return db('client_assignments').where('manager_id', user.manager_id).pluck('client_id');
  case 'client':
    return [user.client_id];
}
```

Used in every controller that touches client-scoped data:

```js
const accessibleIds = await getAccessibleClientIds(req.user);
if (accessibleIds !== 'ALL' && !accessibleIds.includes(requestedClientId)) {
  throw new ApiError(403, 'Not authorized for this client');
}
```

**Keep this check separate from the permission check.** A Manager might hold `campaign:create` permission generally but still be blocked from a specific client they aren't assigned to. Run both checks as distinct middleware/service steps — don't conflate "can do this action" with "can see this client."

---

## 6. Folder Structure

```
src/
  config/                     # db connection, env validation
  middleware/
    auth.middleware.js        # verifies JWT, attaches req.user
    permission.middleware.js  # checks getEffectivePermissions against required (resource, action)
    clientScope.middleware.js # checks getAccessibleClientIds against requested client_id
    error.middleware.js       # centralized error handler
    validate.middleware.js    # request validation (express-validator or zod)
  modules/
    auth/
      auth.controller.js
      auth.service.js
      auth.routes.js
    users/
    departments/
    clients/
    storefronts/
    marketplaceAccounts/
    campaigns/
    tasks/
      # each module: controller.js / service.js / repository.js / routes.js / validation.js
  utils/
    logger.js
    ApiError.js
    getEffectivePermissions.js
    getAccessibleClientIds.js
  app.js
  server.js
```

Controllers stay thin: route → validate → service → response. Repository layer isolates raw SQL from business logic.

---

## 7. Auth Flow

1. `POST /auth/login` — verify bcrypt hash — issue access token (JWT, 15 min expiry, contains `userId`, `role`) + refresh token (7 days, httpOnly cookie, hashed copy stored in DB for revocation).
2. `auth.middleware` verifies access token on protected routes, attaches `req.user = { id, role, department_id, manager_id, client_id }`.
3. `permission.middleware(resource, action)` — runs after auth — checks effective permissions.
4. `clientScope.middleware` — runs on any client-scoped route — checks accessible client IDs.
5. `POST /auth/refresh` — rotates refresh token.

---

## 8. Sample API Route Map

| Route                    | Method | Roles                                                                        | Notes                                                                   |
| ------------------------ | ------ | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `/clients`               | GET    | superadmin, manager                                                          | Manager sees only assigned clients (client-scope filter, not role gate) |
| `/clients`               | POST   | superadmin                                                                   |                                                                         |
| `/clients/:id/campaigns` | GET    | superadmin, manager, employee, client                                        | client role restricted to own `client_id`                               |
| `/campaigns`             | POST   | superadmin, manager (if `campaign:create` in effective perms)                |                                                                         |
| `/tasks/:id`             | PATCH  | superadmin, manager, employee (if `assigned_to = self` or has `task:update`) |                                                                         |
| `/users/:id/permissions` | PATCH  | superadmin (any), manager (only if `canGrantPermission` passes)              | delegation check applies here                                           |
| `/managers/:id/clients`  | POST   | superadmin                                                                   | assigns a client to a manager via `client_assignments`                  |

---

## 9. Build Scope (6–10 hour budget)

**Build fully:**

- Full schema above, seeded with departments + sample permissions
- Auth (login/refresh/logout)
- Permission resolution (department defaults + user overrides)
- One level of delegation: SuperAdmin → Manager permission grants, with the `canGrantPermission` boundary check enforced
- Client-access cascade: SuperAdmin assigns clients to Managers, Employees resolve access through their Manager
- CRUD on clients, campaigns, tasks with both permission and client-scope checks applied
- Clean README

**Document as designed-but-not-implemented (state this explicitly in README):**

- Revocation of specific default permissions (`user_permissions` is additive-only by design; note the `type ENUM('grant','revoke')` extension)

Stating scope decisions explicitly is itself a signal of engineering judgment — call it out as a deliberate trade-off, not an oversight.

---

## 10. README Checklist (per assignment requirements)

- Project overview
- Technology stack
- Setup and installation instructions
- Default test credentials (one seeded user per role)
- Assumptions and design decisions — **include the permission-resolution model, the client-access cascade, and the scope trade-offs from section 9. Also use a flowchart/graph to represent the RBAC flow**
