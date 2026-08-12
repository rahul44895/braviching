import { useState } from 'react';
import { useCrudResource } from '../../hooks/useCrudResource';
import { useClientOptions } from '../../hooks/useClientOptions';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Select } from '../../components/FormField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { TaskFormModal } from './TaskFormModal';

const STATUSES = ['open', 'in_progress', 'done'];

export function TasksPage() {
  const { user } = useAuth();
  const [clientFilter, setClientFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { rows, loading, error, refresh, create, update, remove } = useCrudResource('/tasks', {
    client_id: clientFilter,
    status: statusFilter,
  });
  const clients = useClientOptions();
  const toast = useToast();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const clientName = (id) => clients.find((c) => c.id === id)?.company_name || `#${id}`;

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      if (editing.id) {
        await update(editing.id, values);
        toast.success('Task updated.');
      } else {
        await create(values);
        toast.success('Task created.');
      }
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    try {
      await remove(deleting.id);
      toast.success('Task deleted.');
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: 'title', header: 'Title' },
    { key: 'client_id', header: 'Client', render: (row) => clientName(row.client_id) },
    { key: 'category', header: 'Category' },
    {
      key: 'assigned_to',
      header: 'Assigned to',
      render: (row) =>
        row.assigned_to === user.id ? 'You' : row.assigned_to ? `User #${row.assigned_to}` : '—',
    },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
    { key: 'due_date', header: 'Due', render: (row) => row.due_date || '—' },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="table-actions">
          <Button variant="secondary" size="sm" onClick={() => setEditing(row)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => setDeleting(row)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Tasks"
        description="Day-to-day work items assigned to staff, scoped to a client."
        action={<Button onClick={() => setEditing({})}>New Task</Button>}
      />

      <div className="page-toolbar">
        <Select value={clientFilter} onChange={(e) => setClientFilter(e.target.value)}>
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company_name}
            </option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      {error && <div className="page-error">{error}</div>}

      <DataTable columns={columns} rows={rows} loading={loading} />

      {editing && (
        <TaskFormModal
          task={editing}
          clients={clients}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          message={`This will soft-delete "${deleting.title}".`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
