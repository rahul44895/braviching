import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import '../styles/layout.css';

export function AppLayout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Topbar onToggleSidebar={() => setSidebarOpen((v) => !v)} />
      <div className="app-shell__body">
        <Sidebar role={user.role} open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        {sidebarOpen && <div className="app-shell__scrim" onClick={() => setSidebarOpen(false)} />}
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
