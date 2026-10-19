import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/callProposal", label: "Convocatorias", icon: "▤" },
  { to: "/searching", label: "Búsqueda", icon: "⌕" },
  { to: "/payments", label: "Pagos", icon: "$" },
];

const Sidebar = ({ user, isOpen, onClose }) => (
  <>
    {isOpen && (
      <button
        aria-label="Cerrar menú de navegación"
        className="sidebar-backdrop"
        onClick={onClose}
      />
    )}

    <aside className={`dashboard-sidebar${isOpen ? " is-open" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-mark" aria-hidden="true">C</span>
        <span>Coopera2075</span>
      </div>

      <nav aria-label="Navegación principal" className="sidebar-navigation">
        <p className="sidebar-section-label">MENÚ PRINCIPAL</p>
        {navigationItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " is-active" : ""}`
            }
          >
            <span aria-hidden="true" className="sidebar-link-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <span className="user-avatar" aria-hidden="true">
          {(user?.nombre || "U").charAt(0).toUpperCase()}
        </span>
        <div className="sidebar-user">
          <strong>{user?.nombre || "Usuario"}</strong>
          <span>{user?.role || "Cuenta"}</span>
        </div>
      </div>
    </aside>
  </>
);

export default Sidebar;
