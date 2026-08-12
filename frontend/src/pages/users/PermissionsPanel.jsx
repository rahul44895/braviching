import { useEffect, useState } from 'react';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import '../../styles/permissions.css';

// Permissions here are additive-only by backend design (see README's documented scope trade-off:
// no revocation of a specific grant). So this UI only ever has two states per permission: already
// held (checked, disabled -- nothing to do) or not held (unchecked, click to grant). There's no
// "uncheck" interaction because the API has no endpoint for it.
export function PermissionsPanel({ targetUser, onClose }) {
  const toast = useToast();
  const [catalog, setCatalog] = useState([]);
  const [effective, setEffective] = useState(null);
  const [granting, setGranting] = useState(null);
  const [loadError, setLoadError] = useState(null);

  async function load() {
    setLoadError(null);
    try {
      const [catalogRes, effectiveRes] = await Promise.all([
        api.get('/permissions'),
        api.get(`/users/${targetUser.id}/permissions`),
      ]);
      setCatalog(catalogRes);
      setEffective(effectiveRes);
    } catch (err) {
      setLoadError(err.message);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUser.id]);

  async function grant(permissionId) {
    setGranting(permissionId);
    try {
      await api.patch(`/users/${targetUser.id}/permissions`, { permission_id: permissionId });
      toast.success('Permission granted.');
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGranting(null);
    }
  }

  const heldIds = new Set((effective || []).map((p) => p.id));
  const byResource = catalog.reduce((acc, p) => {
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

      {effective === null && !loadError && <p>Loading…</p>}

      {effective !== null && (
        <div className="permissions-grid">
          {Object.entries(byResource).map(([resource, perms]) => (
            <div key={resource} className="permissions-group">
              <div className="permissions-group__title">{resource.replace('_', ' ')}</div>
              {perms.map((p) => {
                const held = heldIds.has(p.id);
                return (
                  <label
                    key={p.id}
                    className={`permission-row ${held ? 'permission-row--held' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={held}
                      disabled={held || granting === p.id}
                      onChange={() => !held && grant(p.id)}
                    />
                    <span>{p.action}</span>
                  </label>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <p className="permissions-note">
        Checked permissions are already held (via department default or a prior grant) and can't be
        revoked here -- that's a documented backend limitation, not a UI gap. Click an unchecked box
        to grant it; you can only grant permissions you hold yourself.
      </p>
    </Modal>
  );
}
