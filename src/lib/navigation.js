export const Roles = {
  ADMINISTRADOR: "ADMINISTRADOR",
  SUPERVISOR: "SUPERVISOR",
  ASISTENTE: "ASISTENTE",
};

// NOTE: In módulo 3 we'll persist role properly (server-side).
// For now, middleware will use a non-sensitive cookie `ues_role` when present.
export const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/dashboard",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR, Roles.ASISTENTE],
  },
  {
    label: "Programas",
    href: "/programas",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Planes de estudio",
    href: "/planes",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Estudiantes",
    href: "/estudiantes",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Códigos de detalle",
    href: "/codigos-detalle",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Reglas de cobro",
    href: "/reglas-cobro",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Generación de cobros",
    href: "/cobros",
    roles: [Roles.ADMINISTRADOR, Roles.ASISTENTE],
  },
  {
    label: "Cuenta corriente",
    href: "/cuenta-corriente",
    roles: [Roles.ADMINISTRADOR, Roles.ASISTENTE],
  },
  {
    label: "Pagos",
    href: "/pagos",
    roles: [Roles.ADMINISTRADOR, Roles.ASISTENTE],
  },
  {
    label: "Volante de matrícula (PDF)",
    href: "/volante",
    roles: [Roles.ADMINISTRADOR, Roles.ASISTENTE],
  },
  {
    label: "Reportes",
    href: "/reportes",
    roles: [Roles.ADMINISTRADOR],
  },
  {
    label: "Usuarios / Roles / Menús",
    href: "/admin/seguridad",
    roles: [Roles.ADMINISTRADOR],
  },
];

export function allowedNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function isPathAllowedForRole(pathname, role) {
  const item = NAV_ITEMS.find((x) => x.href === pathname);
  if (!item) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

