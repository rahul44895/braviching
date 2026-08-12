import { useEffect, useState } from 'react';
import { api } from '../../api/apiClient';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormField, Input, Select } from '../../components/FormField';

const ROLES = ['superadmin', 'manager', 'employee', 'client'];

export function NewUserFormModal({ onClose, onCreated }) {
  const toast = useToast();
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [clients, setClients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department_id: '',
    manager_id: '',
    client_id: '',
  });

  useEffect(() => {
    api
      .get('/departments')
      .then(setDepartments)
      .catch(() => setDepartments([]));
    api
      .get('/users')
      .then((users) => setManagers(users.filter((u) => u.role === 'manager')))
      .catch(() => setManagers([]));
    api
      .get('/clients')
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  function set(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      if (['manager', 'employee'].includes(form.role)) {
        payload.department_id = Number(form.department_id);
      }
      if (form.role === 'employee') {
        payload.manager_id = Number(form.manager_id);
      }
      if (form.role === 'client') {
        payload.client_id = Number(form.client_id);
      }
      await api.post('/users', payload);
      toast.success('User created.');
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="New User"
      onClose={onClose}
      width={480}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        {error && <div className="form-error-banner">{error}</div>}

        <FormField label="Name">
          <Input value={form.name} onChange={set('name')} required autoFocus />
        </FormField>

        <FormField label="Email">
          <Input type="email" value={form.email} onChange={set('email')} required />
        </FormField>

        <FormField label="Password" hint="At least 8 characters.">
          <Input
            type="password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={8}
          />
        </FormField>

        <FormField label="Role">
          <Select value={form.role} onChange={set('role')} required>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </FormField>

        {['manager', 'employee'].includes(form.role) && (
          <FormField label="Department">
            <Select value={form.department_id} onChange={set('department_id')} required>
              <option value="" disabled>
                Select a department…
              </option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        {form.role === 'employee' && (
          <FormField label="Reports to (Manager)">
            <Select value={form.manager_id} onChange={set('manager_id')} required>
              <option value="" disabled>
                Select a manager…
              </option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </FormField>
        )}

        {form.role === 'client' && (
          <FormField label="Client account">
            <Select value={form.client_id} onChange={set('client_id')} required>
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
        )}
      </form>
    </Modal>
  );
}
