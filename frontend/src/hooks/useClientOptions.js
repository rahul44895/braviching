import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';

// Shared across Campaigns/Tasks/Storefronts/Marketplace Accounts pages for the "which client"
// dropdown -- already scoped server-side (a Manager only gets their assigned clients back), so
// no client-side filtering needed on top of it.
export function useClientOptions() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    api
      .get('/clients')
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  return clients;
}
