import { useState } from 'react';
import { useCrudResource } from '../../hooks/useCrudResource';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { Input } from '../../components/FormField';

export function AuditLogsPage() {
  const [resourceFilter, setResourceFilter] = useState('');
  const { rows, loading, error } = useCrudResource('/audit-logs', { resource: resourceFilter });

  const columns = [
    {
      key: 'timestamp',
      header: 'When',
      render: (row) => new Date(row.timestamp).toLocaleString(),
    },
    { key: 'user_id', header: 'User ID' },
    { key: 'action', header: 'Action' },
    { key: 'resource', header: 'Resource' },
    { key: 'resource_id', header: 'Resource ID' },
  ];

  return (
    <div className="page">
      <PageHeader
        title="Audit Logs"
        description="Every mutation across the system, newest first."
      />

      <div className="page-toolbar">
        <Input
          placeholder="Filter by resource (e.g. campaign)"
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
        />
      </div>

      {error && <div className="page-error">{error}</div>}

      <DataTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyMessage="No audit entries yet."
      />
    </div>
  );
}
