import { useState } from "react";
import { Link } from "react-router-dom";

export const Header = ({
  user,
  onLogout,
  onOpenSidebar,
  variant = "dashboard",
  isDark = false,
  onLogin,
  onToggleTheme,
  loginLabel,
}) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  if (variant === "landing") {
    return (
      <header className="landing-header">
        <Link aria-label="Coopera2075, página de inicio" className="landing-brand" to="/">
          <span className="landing-brand-mark" aria-hidden="true">
            <span>Coopera</span>
            <span>2075</span>
          </span>
          <span className="landing-brand-name">Coopera2075</span>
        </Link>
        <div className="landing-header-actions">
          {onLogin && (
            <button className="landing-login-button" type="button" onClick={onLogin}>
              {loginLabel || (user ? "Ir al sistema" : "Iniciar sesión")}
            </button>
          )}
          <button
            aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            aria-pressed={isDark}
            className="landing-theme-button"
            type="button"
            onClick={onToggleTheme}
          >
            {isDark ? (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
              </svg>
            )}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="dashboard-header">
      <div className="header-title">
        <button
          aria-label="Abrir menú de navegación"
          className="icon-button sidebar-toggle"
          onClick={onOpenSidebar}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span>Coopera2075</span>
      </div>

      <div className="header-actions">
        <button
          aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
          aria-pressed={isDark}
          className="icon-button"
          type="button"
          onClick={onToggleTheme}
        >
          {isDark ? (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z" />
            </svg>
          )}
        </button>
        <div className="header-menu">
          <button
            aria-label="Notificaciones"
            aria-expanded={notificationsOpen}
            className="icon-button notification-button"
            onClick={() => {
              setNotificationsOpen(!notificationsOpen);
              setProfileOpen(false);
            }}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
            </svg>
          </button>
          {notificationsOpen && (
            <div className="header-popover notification-popover">
              <strong>Notificaciones</strong>
              <p>No tienes notificaciones nuevas.</p>
            </div>
          )}
        </div>

        <div className="header-menu">
          <button
            aria-expanded={profileOpen}
            className="profile-button"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotificationsOpen(false);
            }}
          >
            <span className="user-avatar" aria-hidden="true">
              {(user?.nombre || "U").charAt(0).toUpperCase()}
            </span>
            <span className="profile-name">{user?.nombre || "Usuario"}</span>
            <svg className="chevron-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {profileOpen && (
            <div className="header-popover profile-popover">
              <div className="profile-details">
                <strong>{user?.nombre || "Usuario"}</strong>
                <span>{user?.email || ""}</span>
              </div>
              <button className="logout-button" onClick={onLogout}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
