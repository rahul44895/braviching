import { useEffect, useState } from 'react';
import { api } from '../api/apiClient';
import { useAuth } from '../context/AuthContext';

// GET /users 403s for role=employee/client (see users.service.js#list) -- so an Employee creating
// a task simply can't pick "who to assign it to" from a fetched list. They can still self-assign
// (the form defaults assigned_to to their own id in that case); reassigning to someone else is a
// SuperAdmin/Manager action.
export function useAssignableUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (user.role !== 'superadmin' && user.role !== 'manager') return;
    api
      .get('/users')
      .then(setUsers)
      .catch(() => setUsers([]));
  }, [user.role]);

  return users;
}
