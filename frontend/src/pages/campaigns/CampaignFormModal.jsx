import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormField, Input, Select } from '../../components/FormField';

const CHANNELS = ['google', 'meta', 'tiktok', 'email'];

export function CampaignFormModal({ campaign, clients, submitting, onSubmit, onClose }) {
  const isNew = !campaign.id;
  const [form, setForm] = useState({
    client_id: campaign.client_id || '',
    channel: campaign.channel || CHANNELS[0],
    name: campaign.name || '',
    budget: campaign.budget ?? '',
    status: campaign.status || 'active',
    start_date: campaign.start_date || '',
    end_date: campaign.end_date || '',
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!isNew) delete payload.client_id; // backend rejects client_id changes on update
    if (payload.budget === '') delete payload.budget;
    else payload.budget = Number(payload.budget);
    if (!payload.start_date) payload.start_date = null;
    if (!payload.end_date) payload.end_date = null;
    onSubmit(payload);
  }

  return (
    <Modal
      title={isNew ? 'New Campaign' : `Edit ${campaign.name}`}
      onClose={onClose}
      width={560}
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

        <div className="form-row">
          <FormField label="Channel">
            <Select value={form.channel} onChange={set('channel')} required>
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Input value={form.status} onChange={set('status')} placeholder="active" />
          </FormField>
        </div>

        <FormField label="Name">
          <Input value={form.name} onChange={set('name')} required autoFocus={isNew} />
        </FormField>

        <FormField label="Budget (USD)">
          <Input type="number" min="0" step="0.01" value={form.budget} onChange={set('budget')} />
        </FormField>

        <div className="form-row">
          <FormField label="Start date">
            <Input type="date" value={form.start_date || ''} onChange={set('start_date')} />
          </FormField>
          <FormField label="End date">
            <Input type="date" value={form.end_date || ''} onChange={set('end_date')} />
          </FormField>
        </div>
      </form>
    </Modal>
  );
}
