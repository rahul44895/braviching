# Permission Revocation Design

## Context

The backend's permission model has, since it was first built, been documented as **additive-only
by design**: a Manager (or SuperAdmin) can grant a permission to their Employee (or Manager)
beyond department defaults, but there was no way to revoke a specific department-default
permission from one individual user without affecting the whole department. This was called out
explicitly in the README (§5.8) as a deliberate scope trade-off, matching the original project
spec's own documented limitation:

> `user_permissions` is additive-only by design ... Production version would add a `type
> ENUM('grant', 'revoke')` column to `user_permissions` so an override could subtract as well as
> add.

Using the newly-built Users & Permissions frontend page, it became clear this limitation is a real
usability gap, not just a documented curiosity: a Manager looking at an Employee's permissions
panel has no way to act on what they see — every checked box is disabled. This spec implements the
extension the original spec already anticipated: permissions can now be revoked as well as
granted, scoped to one individual user, without touching the department-wide template.

Two decisions were made before this design, in brainstorming:

1. **Revocation is unrestricted** for a Manager acting on their own Employee — a Manager can
   revoke *any* permission from their Employee, even one the Manager doesn't hold themselves.
   There's no privilege-escalation risk in reducing someone's access, only in expanding it, so the
   existing `canGrantPermission` bound (which exists specifically to prevent escalation) doesn't
   apply here. Revocation is still bounded by the existing ownership rule (`assertCanManageUser`)
   — a Manager can only act on their own Employees, never another Manager's, and never a peer
   Manager or SuperAdmin.
2. **The UI shows *why* a permission is currently held** (department default vs. an explicit
   grant vs. previously revoked) rather than just checked/unchecked, since unchecking a
   department-derived permission and unchecking an explicitly-granted one are different actions
   under the hood, and a Manager should be able to tell which one they're doing.

## Data Model

Add one column to the existing `user_permissions` table:

```
user_permissions
  ...(unchanged: user_id, permission_id, granted_by, granted_at, deleted_at)
  type ENUM('grant', 'revoke') NOT NULL DEFAULT 'grant'
```

- **No index changes.** The existing unique index on `(user_id, permission_id)` continues to hold:
  for a given user and permission, only one override row is ever needed at a time — either "add
  this beyond default" (`grant`) or "remove this specific default" (`revoke`). The two states are
  mutually exclusive for the same pair, so there's never a need for both a grant row and a revoke
  row for the same `(user_id, permission_id)` simultaneously.
- **Existing seeded rows** (manager1's and employee1's `task:delete` grants) become `type='grant'`
  automatically via the column default — no data migration/backfill needed beyond adding the
  column.
- The soft-delete (`paranoid: true`) behavior already on this table is what makes "undo a grant"
  and "undo a revoke" both simple `.destroy()` / `.restore()` calls rather than needing new
  lifecycle machinery.

## Effective Permissions Algorithm

Changes from:

```
effective = department_defaults ∪ user_permissions
```

to:

```
effective = (department_defaults ∪ grant_rows) − revoke_rows
```

`getEffectivePermissions(userId)` (`src/utils/getEffectivePermissions.js`) is updated to fetch
department defaults, `type='grant'` rows, and `type='revoke'` rows as three separate sets, union
the first two, then filter out anything present in the revoke set by permission id.

**SuperAdmin is unaffected.** `permission.middleware.js` and `canGrantPermission.js` already
short-circuit SuperAdmin to "always allowed" by role, never consulting this algorithm at all — so
a revoke row against a SuperAdmin target would be structurally inert (SuperAdmin's access isn't
data-driven). Rather than allow a UI interaction that silently does nothing, the Users &
Permissions panel disables all checkboxes when the target user's role is `superadmin`, with a
short explanation, instead of allowing a no-op click.

## Toggle Logic (one unified action, not four)

A single service function decides what to do based on current state, rather than the frontend or
controller needing to know about rows/types directly:

```js
async function setUserPermission(actingUser, targetUserId, permissionId, held) {
  const targetUser = await repository.findById(targetUserId);
  if (!targetUser) throw new ApiError(404, 'User not found');

  assertCanManageUser(actingUser, targetUser); // ownership -- applies to grant, revoke, and un-revoke alike

  const deptHasDefault = await repository.departmentHasDefault(targetUser.department_id, permissionId);
  // Default (paranoid) scope -- only an ACTIVE row counts for deciding which branch to take below.
  // upsertGrant/upsertRevoke/removeGrant/removeRevoke each do their own paranoid:false lookup
  // internally to restore a previously soft-deleted row of the matching type instead of inserting
  // a duplicate (same restore-over-insert pattern as the existing grantPermission repository
  // function) -- that internal lookup is a separate concern from this one.
  const existingRow = await repository.findActiveUserPermissionRow(targetUserId, permissionId);

  if (held) {
    if (existingRow?.type === 'revoke') {
      await repository.removeRevoke(existingRow); // un-revoke: restore department-default access
    } else if (!deptHasDefault) {
      // Genuinely new grant beyond what the department already provides -- the only branch that
      // needs the canGrantPermission bound, since this is the only branch that expands access.
      const allowed = await canGrantPermission(actingUser.id, permissionId);
      if (!allowed) throw new ApiError(403, 'Cannot grant a permission you do not yourself hold');
      await repository.upsertGrant(targetUserId, permissionId, actingUser.id);
    }
    // else: already held via department default, nothing to do (idempotent)
  } else {
    if (existingRow?.type === 'grant') {
      await repository.removeGrant(existingRow); // undo an explicit grant
    } else if (deptHasDefault) {
      await repository.upsertRevoke(targetUserId, permissionId, actingUser.id); // override the default
    }
    // else: not held anyway, nothing to do (idempotent)
  }

  await recordAudit(
    actingUser.id,
    held ? 'user:grant_permission' : 'user:revoke_permission',
    'user',
    targetUserId,
  );
}
```

**Known edge case, not specially handled**: if a permission somehow has both a department default
AND a redundant explicit `grant` row for the same user (not something the seed data or normal UI
flow creates, since the UI never offers "grant" on an already-held permission), unchecking it would
remove the grant row but the permission would remain held via the department default. This is
arguably correct (removing a redundant explicit grant shouldn't remove department-derived access)
but may look like a no-op to the person clicking. Not worth special-casing for this pass.

`grantPermission` (existing) and the new revoke path both funnel through this one function with
`held=true` / `held=false` rather than being maintained as separate, divergent code paths.

## API Changes

| Method & Path | Change | Behavior |
|---|---|---|
| `PATCH /api/users/:id/permissions` | Unchanged contract | Body `{ permission_id }` → `setUserPermission(..., held=true)` |
| `DELETE /api/users/:id/permissions/:permissionId` | **New** | → `setUserPermission(..., held=false)` |
| `GET /api/users/:id/permissions` | **Response shape changes** | See below |

`GET /api/users/:id/permissions` currently returns a flat array of effective `{id, resource,
action}`. It changes to return **all 20 catalog permissions**, each annotated with where it
currently stands for this user:

```json
[
  { "id": 13, "resource": "campaign", "action": "create", "source": "department" },
  { "id": 20, "resource": "task", "action": "delete", "source": "grant" },
  { "id": 1, "resource": "client", "action": "create", "source": "none" },
  { "id": 9, "resource": "marketplace_account", "action": "create", "source": "revoked" }
]
```

- `department` -- held via department default, no override.
- `grant` -- held via an explicit grant (not a department default for this user, or held
  regardless of default).
- `revoked` -- would be a department default, but a revoke row overrides it for this user
  specifically. **Not currently held.**
- `none` -- not held, no department default, no rows.

This lets the frontend render the whole panel (checked state + source label) from one response,
without a separate merge step against the `/api/permissions` catalog endpoint (which remains
unchanged/still used elsewhere as the generic catalog listing).

Authorization for `GET .../permissions` is unchanged (self, own Manager, or SuperAdmin — see
`getEffectivePermissionsForUser`), just extended to compute the fuller per-permission status
instead of only the effective subset.

## Audit Logging

New action string `user:revoke_permission`, recorded the same way `user:grant_permission` already
is -- one `recordAudit` call at the end of `setUserPermission`, action chosen by `held`.

## Frontend Changes (`PermissionsPanel.jsx`)

- Checkboxes become fully interactive for every permission, not just unchecked ones. Checking
  calls `PATCH`, unchecking calls `DELETE`.
- Each permission row gets a small source tag next to it: "Department default" / "Granted" /
  "Revoked" (muted/neutral styling) -- `none` gets no tag.
- If the target user's role is `superadmin`, all checkboxes render disabled with a short
  explanation ("SuperAdmin holds all permissions by role, not by grant -- nothing to revoke
  here"), rather than allowing clicks that would structurally do nothing.
- The footer note changes from "can't be revoked here" to something reflecting the new behavior
  (e.g., noting that revocation is a per-user override, not a change to the department template).
- No changes needed to `UsersPage.jsx` or `NewUserFormModal.jsx` -- this is scoped entirely to the
  permissions panel and its two supporting endpoints.

## Migration Plan

One new migration: `ALTER TABLE user_permissions ADD COLUMN type ENUM('grant','revoke') NOT NULL
DEFAULT 'grant'`, placed after the existing `create-user-permissions` migration in sequence.
Existing local/deployed databases pick this up via the normal `npm run db:migrate` /
`render-start` flow already in place -- no seed changes required (existing seeded grant rows are
correct as `type='grant'` by default).

## Documentation Updates

- README §5.8 ("Scope trade-off: revocation ... designed, not built") is removed/rewritten to
  describe what's actually built now, rather than describing a limitation that no longer exists.
- README §4 (API Overview) gains the new `DELETE /api/users/:id/permissions/:permissionId` route
  and a note on the changed `GET .../permissions` response shape.
- README §9 (Frontend) gets a short addition describing the interactive permissions panel.
- `requests.http` gains a couple of illustrative revoke/un-revoke requests alongside the existing
  grant examples.

## Verification Plan

Consistent with how the rest of this project has been verified (no automated test suite; manual
`requests.http` + an actual browser pass for anything UI-facing):

1. Migrate, then hit `GET /api/users/:id/permissions` for a seeded user and confirm the
   `source` field is correct for a department-default permission, a granted one (e.g. employee1's
   seeded `task:delete`), and one held not at all.
2. Revoke a department-default permission from an Employee via `DELETE`, confirm
   `getEffectivePermissions` (and therefore `permission.middleware`) actually excludes it on a
   real subsequent request against a route gated by that permission.
3. Un-revoke it, confirm access is restored.
4. Confirm a Manager can revoke a permission from their Employee that the Manager does **not**
   hold themselves (this is the whole point of "unrestricted revoke" -- must be explicitly
   checked, not assumed).
5. Confirm a Manager still cannot grant a permission they don't hold (existing rule, must not have
   regressed).
6. Confirm a Manager cannot revoke anything from another Manager or from SuperAdmin (ownership
   rule, must not have regressed).
7. Browser pass: open the permissions panel for a seeded Employee as their Manager, toggle a
   department-default permission off and on, toggle a from-scratch grant on and off, confirm the
   source tags update correctly and the toast/audit trail reflect it.
