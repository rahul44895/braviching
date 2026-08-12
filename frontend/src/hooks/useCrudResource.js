import { useState, useCallback, useEffect } from 'react';
import { api } from '../api/apiClient';

// Shared list+CRUD data logic for the resource modules (Clients, Campaigns, Tasks, Storefronts,
// Marketplace Accounts) -- they all follow the identical GET-list / POST / PATCH / DELETE shape
// against the same-named backend module, so this collapses five near-identical hooks into one.
export function useCrudResource(basePath, query) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const queryKey = JSON.stringify(query || {});

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = query
        ? Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ''))
        : {};
      const qs = Object.keys(params).length ? `?${new URLSearchParams(params).toString()}` : '';
      const data = await api.get(`${basePath}${qs}`);
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePath, queryKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback((body) => api.post(basePath, body), [basePath]);
  const update = useCallback((id, body) => api.patch(`${basePath}/${id}`, body), [basePath]);
  const remove = useCallback((id) => api.delete(`${basePath}/${id}`), [basePath]);

  return { rows, loading, error, refresh, create, update, remove };
}
