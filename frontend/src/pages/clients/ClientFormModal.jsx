import { useState } from 'react';
import { Modal } from '../../components/Modal';
import { Button } from '../../components/Button';
import { FormField, Input } from '../../components/FormField';

export function ClientFormModal({ client, submitting, onSubmit, onClose }) {
  const isNew = !client.id;
  const [companyName, setCompanyName] = useState(client.company_name || '');

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ company_name: companyName });
  }

  return (
    <Modal
      title={isNew ? 'New Client' : `Edit ${client.company_name}`}
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
        <FormField label="Company name">
          <Input
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            autoFocus
          />
        </FormField>
      </form>
    </Modal>
  );
}
