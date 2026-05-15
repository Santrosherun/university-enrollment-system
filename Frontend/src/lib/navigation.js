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
    label: "Periodos académicos",
    href: "/periodos",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Planes de estudio",
    href: "/planes",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Asignaturas",
    href: "/asignaturas",
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
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR, Roles.ASISTENTE],
  },
  {
    label: "Reportes",
    href: "/reportes",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Usuarios / Roles / Menús",
    href: "/admin/seguridad",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
  {
    label: "Matriz RBAC",
    href: "/permisos",
    roles: [Roles.ADMINISTRADOR, Roles.SUPERVISOR],
  },
];

export function allowedNavItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}

export function filterNavItemsByRoutes(allowedRoutes) {
  if (!allowedRoutes || allowedRoutes.length === 0) return [NAV_ITEMS[0]];
  return NAV_ITEMS.filter((item) => allowedRoutes.includes(item.href));
}

/** Texto y CTA para las tarjetas del dashboard (misma lista de rutas que el menú). */
export const DASHBOARD_CARD_BY_HREF = {
  "/programas": {
    description:
      "Gestiona programas académicos, modalidades y su configuración general.",
    cta: "Ir a Programas",
  },
  "/periodos": {
    description:
      "Crea y configura los periodos académicos de matrícula, fechas y alcances temporales.",
    cta: "Ir a Periodos",
  },
  "/planes": {
    description:
      "Administra planes de estudio y su relación con periodos y programas.",
    cta: "Ir a Planes",
  },
  "/asignaturas": {
    description: "Catálogo de materias, créditos y tipos de asignatura.",
    cta: "Ir a Asignaturas",
  },
  "/estudiantes": {
    description: "Listado, creación y edición de estudiantes.",
    cta: "Ir a Estudiantes",
  },
  "/codigos-detalle": {
    description: "Mantén los códigos de detalle para cobros y pagos.",
    cta: "Ir a Códigos",
  },
  "/reglas-cobro": {
    description: "Define reglas por periodo, programa y modalidad.",
    cta: "Ir a Reglas",
  },
  "/cobros": {
    description: "Genera cobros individuales o masivos según las reglas.",
    cta: "Ir a Cobros",
  },
  "/cuenta-corriente": {
    description: "Consulta movimientos y balance por estudiante.",
    cta: "Ver cuenta corriente",
  },
  "/pagos": {
    description: "Simula pago en línea o registro por caja.",
    cta: "Ir a Pagos",
  },
  "/reportes": {
    description: "Listados, ingresos esperados, cartera y pendientes.",
    cta: "Ir a Reportes",
  },
  "/admin/seguridad": {
    description: "Usuarios, roles y menús (solo administración).",
    cta: "Ir a Seguridad",
  },
  "/permisos": {
    description: "Configura la matriz de permisos granular (Ver, Crear, Editar, Borrar) sobre cada menú del sistema.",
    cta: "Ir a Matriz RBAC",
  },
};

/** Ítems de menú permitidos para el rol, excluyendo el propio Dashboard (para las cards). */
export function dashboardNavItemsForRole(role) {
  if (!role) return [];
  return allowedNavItemsForRole(role).filter((item) => item.href !== "/dashboard");
}

export function dashboardCardMetaForHref(href) {
  return (
    DASHBOARD_CARD_BY_HREF[href] ?? {
      description: "Abre este módulo desde el menú lateral.",
      cta: "Abrir",
    }
  );
}

export function isPathAllowedForRole(pathname, role) {
  const item = NAV_ITEMS.find((x) => x.href === pathname);
  if (!item) return true;
  if (!role) return false;
  return item.roles.includes(role);
}

