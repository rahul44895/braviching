import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormField, Input, Select } from '../../components/FormField';

const PLATFORMS = ['amazon', 'ebay', 'walmart', 'shopify'];

export function MarketplaceAccountFormModal({ account, clients, submitting, onSubmit, onClose }) {
  const isNew = !account.id;
  const [form, setForm] = useState({
    client_id: account.client_id || '',
    platform: account.platform || PLATFORMS[0],
    status: account.status || 'active',
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!isNew) delete payload.client_id;
    onSubmit(payload);
  }

  return (
    <Modal
      title={isNew ? 'New Marketplace Account' : 'Edit Marketplace Account'}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <FormField label="Client">
          <Select value={form.client_id} onChange={set('client_id')} required disabled={!isNew}>
            <option value="" disabled>
              Select a client…
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Platform">
          <Select value={form.platform} onChange={set('platform')} required>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Status">
          <Input value={form.status} onChange={set('status')} placeholder="active" autoFocus />
        </FormField>
      </form>
    </Modal>
  );
}
