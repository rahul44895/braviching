import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import '../styles/topbar.css';

export function Topbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          ☰
        </button>
        <span className="topbar__brand">Braviching</span>
      </div>
      <div className="topbar__right">
        {user && (
          <span className="topbar__user">
            {user.name} <span className="topbar__role">{user.role}</span>
          </span>
        )}
        <Button variant="ghost" size="sm" onClick={logout}>
          Log out
        </Button>
      </div>
    </header>
  );
}
