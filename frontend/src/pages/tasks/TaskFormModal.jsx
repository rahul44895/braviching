import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormField, Input, Select, Textarea } from '../../components/FormField';
import { useAssignableUsers } from '../../hooks/useAssignableUsers';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = ['marketplace', 'paid_media', 'email', 'storefront'];
const STATUSES = ['open', 'in_progress', 'done'];

export function TaskFormModal({ task, clients, submitting, onSubmit, onClose }) {
  const isNew = !task.id;
  const { user } = useAuth();
  const assignableUsers = useAssignableUsers();

  const [form, setForm] = useState({
    client_id: task.client_id || '',
    assigned_to: task.assigned_to || (isNew ? user.id : ''),
    title: task.title || '',
    description: task.description || '',
    category: task.category || CATEGORIES[0],
    status: task.status || 'open',
    due_date: task.due_date || '',
  });

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form };
    if (!isNew) delete payload.client_id;
    if (payload.assigned_to) payload.assigned_to = Number(payload.assigned_to);
    else delete payload.assigned_to;
    if (!payload.due_date) payload.due_date = null;
    onSubmit(payload);
  }

  return (
    <Modal
      title={isNew ? 'New Task' : `Edit ${task.title}`}
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

        <FormField
          label="Assigned to"
          hint={
            assignableUsers.length === 0
              ? "You can only assign this to yourself -- listing other staff isn't available to your role."
              : undefined
          }
        >
          {assignableUsers.length > 0 ? (
            <Select value={form.assigned_to} onChange={set('assigned_to')}>
              <option value="">Unassigned</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          ) : (
            <Input value={`${user.name} (you)`} disabled />
          )}
        </FormField>

        <FormField label="Title">
          <Input value={form.title} onChange={set('title')} required autoFocus={isNew} />
        </FormField>

        <FormField label="Description">
          <Textarea value={form.description} onChange={set('description')} />
        </FormField>

        <div className="form-row">
          <FormField label="Category">
            <Select value={form.category} onChange={set('category')} required>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status">
            <Select value={form.status} onChange={set('status')} required>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <FormField label="Due date">
          <Input type="date" value={form.due_date || ''} onChange={set('due_date')} />
        </FormField>
      </form>
    </Modal>
  );
}
