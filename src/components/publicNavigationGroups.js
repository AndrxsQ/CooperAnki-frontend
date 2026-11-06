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
