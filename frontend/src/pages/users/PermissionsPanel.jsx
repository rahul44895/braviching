import { useEffect, useState } from 'react';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import '../../styles/permissions.css';

const SOURCE_LABEL = {
  department: 'Department default',
  grant: 'Granted',
  revoked: 'Revoked',
};

// Each permission is checked/unchecked based on `source` (department/grant = held, revoked/none =
// not held), and every checkbox is interactive -- checking calls PATCH (grant, or un-revoke if a
// revoke override exists), unchecking calls DELETE (revoke a default, or un-grant an explicit
// one). Which of those two actually happens is decided server-side; the UI just says "make this
// held" or "make this not held" and shows the resulting source next time it loads.
export function PermissionsPanel({ targetUser, onClose }) {
  const toast = useToast();
  const [permissions, setPermissions] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [loadError, setLoadError] = useState(null);

  const isSuperadmin = targetUser.role === 'superadmin';

  async function load() {
    setLoadError(null);
    try {
      setPermissions(await api.get(`/users/${targetUser.id}/permissions`));
    } catch (err) {
      setLoadError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUser.id]);

  async function toggle(permission, held) {
    setToggling(permission.id);
    try {
      if (held) {
        await api.patch(`/users/${targetUser.id}/permissions`, { permission_id: permission.id });
      } else {
        await api.delete(`/users/${targetUser.id}/permissions/${permission.id}`);
      }
      toast.success(held ? 'Permission granted.' : 'Permission revoked.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setToggling(null);
    }
  }

  const byResource = (permissions || []).reduce((acc, p) => {
    (acc[p.resource] ||= []).push(p);
    return acc;
  }, {});

  return (
    <Modal
      title={`Permissions -- ${targetUser.name}`}
      onClose={onClose}
      width={520}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {loadError && <div className="form-error-banner">{loadError}</div>}

      {isSuperadmin && (
        <p
          className="form-error-banner"
          style={{ background: 'var(--color-cream-dark)', color: 'var(--color-text)' }}
        >
          SuperAdmin holds all permissions by role, not by grant -- there's nothing to revoke or
          grant here.
        </p>
      )}

      {permissions === null && !loadError && <p>Loading…</p>}

      {permissions !== null && (
        <div className="permissions-grid">
          {Object.entries(byResource).map(([resource, perms]) => (
            <div key={resource} className="permissions-group">
              <div className="permissions-group__title">{resource.replace('_', ' ')}</div>
              {perms.map((p) => {
                const held = p.source === 'department' || p.source === 'grant';
                return (
                  <label
                    key={p.id}
                    className={`permission-row ${held ? 'permission-row--held' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={held}
                      disabled={isSuperadmin || toggling === p.id}
                      onChange={() => toggle(p, !held)}
                    />
                    <span>{p.action}</span>
                    {SOURCE_LABEL[p.source] && (
                      <span className="permission-row__source">{SOURCE_LABEL[p.source]}</span>
                    )}
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <p className="permissions-note">
        Unchecking a department-default permission creates a per-user override -- it doesn't change
        the department's template, and only affects {targetUser.name}. Unchecking an explicit grant
        simply removes it. Granting something new is still bounded by your own permissions; revoking
        is not.
      </p>
    </Modal>
  );
}
