import { useState } from 'react';
import { useCrudResource } from '../../hooks/useCrudResource';
import { useClientOptions } from '../../hooks/useClientOptions';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { Badge } from '../../components/Badge';
import { Select } from '../../components/FormField';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { CampaignFormModal } from './CampaignFormModal';

export function CampaignsPage() {
  const [clientFilter, setClientFilter] = useState('');
  const { rows, loading, error, refresh, create, update, remove } = useCrudResource('/campaigns', {
    client_id: clientFilter,
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
        toast.success('Campaign updated.');
      } else {
        await create(values);
        toast.success('Campaign created.');
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
      toast.success('Campaign deleted.');
      setDeleting(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  }

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'client_id', header: 'Client', render: (row) => clientName(row.client_id) },
    { key: 'channel', header: 'Channel' },
    {
      key: 'budget',
      header: 'Budget',
      render: (row) => (row.budget != null ? `$${Number(row.budget).toLocaleString()}` : '—'),
    },
    { key: 'status', header: 'Status', render: (row) => <Badge>{row.status}</Badge> },
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
        title="Campaigns"
        description="Paid ad campaigns run for a client."
        action={<Button onClick={() => setEditing({})}>New Campaign</Button>}
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
      </div>

      {error && <div className="page-error">{error}</div>}

      <DataTable columns={columns} rows={rows} loading={loading} />

      {editing && (
        <CampaignFormModal
          campaign={editing}
          clients={clients}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete campaign?"
          message={`This will soft-delete "${deleting.name}". It can be restored from the database if needed, but won't appear in any list.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
