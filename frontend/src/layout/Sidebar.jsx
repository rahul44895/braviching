import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from './navConfig';
import '../styles/sidebar.css';

export function Sidebar({ role, open, onNavigate }) {
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className={`sidebar ${open ? 'sidebar--open' : ''}`}>
      <nav>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
