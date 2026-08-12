import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleGate } from './routes/RoleGate';
import { AppLayout } from './layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/clients/ClientsPage';
import { CampaignsPage } from './pages/campaigns/CampaignsPage';
import { TasksPage } from './pages/tasks/TasksPage';
import { StorefrontsPage } from './pages/storefronts/StorefrontsPage';
import { MarketplaceAccountsPage } from './pages/marketplaceAccounts/MarketplaceAccountsPage';
import { UsersPage } from './pages/users/UsersPage';
import { AuditLogsPage } from './pages/auditLogs/AuditLogsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/storefronts" element={<StorefrontsPage />} />
        <Route path="/marketplace-accounts" element={<MarketplaceAccountsPage />} />
        <Route
          path="/users"
          element={
            <RoleGate roles={['superadmin', 'manager']}>
              <UsersPage />
            </RoleGate>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <RoleGate roles={['superadmin']}>
              <AuditLogsPage />
            </RoleGate>
          }
        />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
