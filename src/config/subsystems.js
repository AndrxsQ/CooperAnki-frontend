// Catálogo central de los subsistemas de Coopera2075, de los roles habilitados
// y de la navegación de cada subsistema. Toda la app deriva de aquí quién puede
// entrar a qué y a dónde se redirige tras iniciar sesión.

export const SUBSYSTEMS = {
  COOPERATION: {
    id: "COOPERATION",
    label: "Sistema de cooperación",
    shortLabel: "Cooperación",
    home: "/cooperacion",
  },
  INFORMATION: {
    id: "INFORMATION",
    label: "Sistema de gestión de información",
    shortLabel: "Gestión de información",
    home: "/informacion",
  },
  ACCOUNT: {
    id: "ACCOUNT",
    label: "Sistema de cuenta personal",
    shortLabel: "Cuenta personal",
    home: "/cuenta",
  },
};

// Únicos roles habilitados y validados en la aplicación.
export const ROLES = {
  ADMIN: {
    id: "ADMIN",
    label: "Administrador",
    subsystems: ["COOPERATION", "INFORMATION", "ACCOUNT"],
    defaultSubsystem: "COOPERATION",
    home: "/cooperacion",
  },
  GENERAL_EXE: {
    id: "GENERAL_EXE",
    label: "Ejecutivo general",
    subsystems: ["COOPERATION", "INFORMATION"],
    defaultSubsystem: "COOPERATION",
    home: "/cooperacion",
  },
  LEGAL_EXE: {
    id: "LEGAL_EXE",
    label: "Ejecutivo jurídico",
    subsystems: ["INFORMATION"],
    defaultSubsystem: "INFORMATION",
    home: "/informacion/juridica",
  },
  TERRITORIAL_EXE: {
    id: "TERRITORIAL_EXE",
    label: "Ejecutivo territorial",
    subsystems: ["INFORMATION"],
    defaultSubsystem: "INFORMATION",
    home: "/informacion",
  },
  CLIENT: {
    id: "CLIENT",
    label: "Cliente",
    subsystems: ["ACCOUNT"],
    defaultSubsystem: "ACCOUNT",
    home: "/cuenta",
  },
};

export const VALID_ROLE_IDS = Object.keys(ROLES);

export const normalizeRole = (role) => String(role ?? "").trim().toUpperCase();

export const getRoleConfig = (role) => ROLES[normalizeRole(role)] ?? null;

export const getSubsystemsForRole = (role) =>
  getRoleConfig(role)?.subsystems ?? [];

export const canAccessSubsystem = (role, subsystem) =>
  getSubsystemsForRole(role).includes(subsystem);

// Subsistema predeterminado del rol y ruta de aterrizaje tras el login.
export const getDefaultHome = (role) => getRoleConfig(role)?.home ?? null;

export const getAccessibleSubsystems = (role) =>
  getSubsystemsForRole(role).map((id) => SUBSYSTEMS[id]);

export const getSubsystemFromPath = (pathname = "") => {
  if (pathname.startsWith(SUBSYSTEMS.COOPERATION.home)) return "COOPERATION";
  if (pathname.startsWith(SUBSYSTEMS.INFORMATION.home)) return "INFORMATION";
  if (pathname.startsWith(SUBSYSTEMS.ACCOUNT.home)) return "ACCOUNT";
  return null;
};

// Navegación por subsistema. Un grupo puede limitarse a ciertos roles para
// diferenciar, por ejemplo, a LEGAL_EXE de TERRITORIAL_EXE dentro del
// subsistema de gestión de información.
export const SUBSYSTEM_NAVIGATION = {
  COOPERATION: [
    {
      id: "cooperation",
      label: "Cooperación",
      icon: "◈",
      items: [
        { to: "/cooperacion", label: "Proyectos", icon: "▦", end: true },
        {
          to: "/cooperacion/convocatorias",
          label: "Convocatorias y matching",
          icon: "⌕",
          end: true,
        },
        {
          to: "/cooperacion/convocatorias/catalogo",
          label: "Catálogo de convocatorias",
          icon: "☰",
        },
        {
          to: "/cooperacion/propuestas",
          label: "Formulación de propuestas",
          icon: "▤",
        },
        { to: "/cooperacion/pagos", label: "Pagos", icon: "$" },
      ],
    },
  ],
  INFORMATION: [
    {
      id: "territorial",
      label: "Gestión Territorial",
      icon: "▦",
      roles: ["ADMIN", "GENERAL_EXE", "TERRITORIAL_EXE"],
      items: [
        { to: "/informacion", label: "Dashboard", icon: "▦", end: true },
        { to: "/informacion/territorio", label: "Vista General", icon: "▤" },
      ],
    },
    {
      id: "legal",
      label: "Gestión Jurídica",
      icon: "§",
      roles: ["ADMIN", "GENERAL_EXE", "LEGAL_EXE"],
      items: [
        {
          to: "/informacion/juridica",
          label: "Inicio",
          icon: "⌂",
          end: true,
        },
        {
          to: "/informacion/juridica/clientes",
          label: "Clientes",
          icon: "♙",
        },
        {
          to: "/informacion/juridica/expedientes",
          label: "Expedientes",
          icon: "▤",
        },
      ],
    },
  ],
};

export const getNavigationForSubsystem = (subsystemId, role) => {
  const groups = SUBSYSTEM_NAVIGATION[subsystemId] ?? [];
  const normalized = normalizeRole(role);
  return groups.filter(
    (group) => !group.roles || group.roles.includes(normalized),
  );
};

// Navegación del subsistema de cuenta personal (portal propio del usuario).
export const ACCOUNT_NAVIGATION = [
  { to: "/cuenta", label: "Cuenta", end: true },
  { to: "/cuenta/informacion-juridica", label: "Información Jurídica" },
  { to: "/cuenta/cuentas", label: "Cuentas", roles: ["ADMIN"] },
  { to: "/cuenta/encuestas", label: "Encuestas", roles: ["ADMIN"] },
];

export const getAccountNavigation = (role) => {
  const normalized = normalizeRole(role);
  return ACCOUNT_NAVIGATION.filter(
    (item) => !item.roles || item.roles.includes(normalized),
  );
};
