import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

export const publicNavigationGroups = [
  {
    id: "territorial",
    label: "Gestión Territorial",
    icon: "▦",
    items: [
      { to: "/", label: "Dashboard", icon: "▦" },
      { to: "/detailed-view", label: "Vista General", icon: "▤" },
    ],
  },
  {
    id: "legal",
    label: "Gestión Jurídica",
    icon: "§",
    items: [
      { to: "/legal-management", label: "Inicio", icon: "⌂", end: true },
      {
        to: "/legal-management/clients",
        label: "Clientes",
        icon: "♙",
      },
      {
        to: "/legal-management/cases",
        label: "Expedientes",
        icon: "▤",
      },
    ],
  },
];

const Sidebar = ({ isOpen, onClose, showPublicGroups = false }) => {
  const location = useLocation();
  const [expandedGroups, setExpandedGroups] = useState({
    territorial: true,
    legal: location.pathname.startsWith("/legal-management"),
  });

  const toggleGroup = (groupId) => {
    setExpandedGroups((current) => ({
      ...current,
      [groupId]: !current[groupId],
    }));
  };

  return (
    <>
      {isOpen && (
        <button
          aria-label="Cerrar menú de navegación"
          className="fixed inset-0 z-30 border-0 bg-[#123b5d]/45 md:hidden"
          type="button"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-[#123b5d] text-white shadow-xl transition-transform duration-200 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-[76px] shrink-0 items-center gap-3 px-6 text-[17px] font-bold tracking-tight">
          <span
            className="grid h-[34px] w-[34px] place-items-center rounded-[10px] bg-[#42a7cf] text-lg text-white"
            aria-hidden="true"
          >
            C
          </span>
          <span>Coopera2075</span>
        </div>

        <nav
          aria-label="Navegación principal"
          className="grid content-start gap-1.5 overflow-y-auto px-3.5 py-[22px]"
        >
          <p className="mb-2.5 ml-2.5 text-[13px] font-bold tracking-normal text-[#b9d8e8]">
            Menú
          </p>
          {showPublicGroups
            ? publicNavigationGroups.map((group) => {
            const isExpanded = Boolean(expandedGroups[group.id]);

            return (
              <section className="grid gap-1" key={group.id}>
                <button
                  aria-expanded={isExpanded}
                  className="flex min-h-[46px] w-full items-center gap-[13px] rounded-lg border-0 bg-transparent px-3 text-left text-sm font-semibold text-[#e7f4fa] transition-colors hover:bg-[#087ca6] hover:text-white"
                  type="button"
                  onClick={() => toggleGroup(group.id)}
                >
                  <span
                    aria-hidden="true"
                    className="inline-grid w-[22px] shrink-0 place-items-center text-[19px] text-[#74c8e6]"
                  >
                    {group.icon}
                  </span>
                  <span className="min-w-0 flex-1">{group.label}</span>
                  <svg
                    aria-hidden="true"
                    className={`h-4 w-4 shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="ml-4 grid gap-1 border-l border-[#74c8e6]/40 pl-2">
                    {group.items.map(({ to, label, icon, end }) => (
                      <NavLink
                        key={to}
                        to={to}
                        end={end ?? to === "/"}
                        onClick={onClose}
                        className={({ isActive }) =>
                          `flex min-h-10 items-center gap-3 rounded-lg px-3 text-[13px] text-[#e7f4fa] no-underline transition-colors hover:bg-[#087ca6] hover:text-white ${
                            isActive
                              ? "bg-[#087ca6] text-white shadow-[inset_3px_0_#74c8e6]"
                              : ""
                          }`
                        }
                      >
                        <span
                          aria-hidden="true"
                          className="inline-grid w-[22px] shrink-0 place-items-center text-base text-[#74c8e6]"
                        >
                          {icon}
                        </span>
                        <span>{label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </section>
            );
          })
            : [
                { to: "/callProposal", label: "Convocatorias", icon: "▤" },
                { to: "/searching", label: "Búsqueda", icon: "⌕" },
                { to: "/payments", label: "Pagos", icon: "$" },
              ].map(({ to, label, icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex min-h-[46px] items-center gap-[13px] rounded-lg px-3 text-sm text-[#e7f4fa] no-underline transition-colors hover:bg-[#087ca6] hover:text-white ${
                      isActive
                        ? "bg-[#087ca6] text-white shadow-[inset_3px_0_#74c8e6]"
                        : ""
                    }`
                  }
                >
                  <span
                    aria-hidden="true"
                    className="inline-grid w-[22px] shrink-0 place-items-center text-[19px] text-[#74c8e6]"
                  >
                    {icon}
                  </span>
                  <span>{label}</span>
                </NavLink>
              ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
