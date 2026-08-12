import { useState } from 'react';
import { useCrudResource } from '../../hooks/useCrudResource';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Button } from '../../components/Button';
import { ClientFormModal } from './ClientFormModal';

export function ClientsPage() {
  const { rows, loading, error, refresh, create, update } = useCrudResource('/clients');
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null = closed, {} = new, {...client} = editing
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values) {
    setSubmitting(true);
    try {
      if (editing.id) {
        await update(editing.id, values);
        toast.success('Client updated.');
      } else {
        await create(values);
        toast.success('Client created.');
      }
      setEditing(null);
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'company_name', header: 'Company' },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => (row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <Button variant="secondary" size="sm" onClick={() => setEditing(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Clients"
        description="The ecommerce brands this agency manages."
        action={<Button onClick={() => setEditing({})}>New Client</Button>}
      />

      {error && <div className="page-error">{error}</div>}

      <DataTable columns={columns} rows={rows} loading={loading} />

      {editing && (
        <ClientFormModal
          client={editing}
          submitting={submitting}
          onSubmit={handleSubmit}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}
