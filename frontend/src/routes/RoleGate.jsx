import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Client-side hint only -- the backend is the real enforcement (see permission.middleware.js /
// role checks per module). This just avoids showing a nav link or route that would 403 anyway.
export function RoleGate({ roles, children }) {
  const { user } = useAuth();

  if (!roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
