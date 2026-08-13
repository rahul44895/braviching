import { useState } from 'react';
import { useCrudResource } from '../../hooks/useCrudResource';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../api/apiClient';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { PermissionsPanel } from './PermissionsPanel';
import { NewUserFormModal } from './NewUserFormModal';

export function UsersPage() {
  const { user: me } = useAuth();
  const { rows, loading, error, refresh } = useCrudResource('/users');
  const toast = useToast();
  const [managingPermissionsFor, setManagingPermissionsFor] = useState(null);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState(null);

  async function toggleActive(row) {
    setTogglingId(row.id);
    try {
      await api.patch(`/users/${row.id}/status`, { is_active: !row.is_active });
      toast.success(`${row.name} is now ${row.is_active ? 'inactive' : 'active'}.`);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', render: (row) => <Badge tone="neutral">{row.role}</Badge> },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'active' : 'inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="table-actions">
          {row.role !== 'client' && (
            <Button variant="secondary" size="sm" onClick={() => setManagingPermissionsFor(row)}>
              Permissions
            </Button>
          )}
          {row.id !== me.id && (
            <Button
              variant={row.is_active ? 'danger' : 'primary'}
              size="sm"
              disabled={togglingId === row.id}
              onClick={() => toggleActive(row)}
            >
              {row.is_active ? 'Deactivate' : 'Activate'}
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Users & Permissions"
        description={
          me.role === 'superadmin' ? 'All staff accounts.' : 'Employees who report to you.'
        }
        action={
          me.role === 'superadmin' && <Button onClick={() => setCreating(true)}>New User</Button>
        }
      />

      {error && <div className="page-error">{error}</div>}

      <DataTable columns={columns} rows={rows} loading={loading} />

      {managingPermissionsFor && (
        <PermissionsPanel
          targetUser={managingPermissionsFor}
          onClose={() => setManagingPermissionsFor(null)}
        />
      )}

      {creating && (
        <NewUserFormModal
          onClose={() => setCreating(false)}
          onCreated={() => {
            setCreating(false);
            refresh();
          }}
        />
      )}
    </div>
  );
}
