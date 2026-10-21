import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/callProposal", label: "Convocatorias", icon: "▤" },
  { to: "/searching", label: "Búsqueda", icon: "⌕" },
  { to: "/payments", label: "Pagos", icon: "$" },
];

const Sidebar = ({
  isOpen,
  onClose,
  items,
}) => (
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
        className="grid content-start gap-1.5 px-3.5 py-[22px]"
      >
        <p className="mb-2.5 ml-2.5 text-[13px] font-bold tracking-normal text-[#b9d8e8]">
          Menú
        </p>
        {(items || navigationItems).map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
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

export default Sidebar;
