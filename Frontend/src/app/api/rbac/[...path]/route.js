import { proxyToBackend } from "@/lib/api-proxy";

// Mocks locales de soporte para la matriz RBAC
let mockRoles = [
  { id_rol: 1, nombre_rol: "ADMINISTRADOR", descripcion: "Acceso total a parametrización y auditoría", es_especial: true },
  { id_rol: 2, nombre_rol: "SUPERVISOR", descripcion: "Aprobación de liquidaciones y reportes de cartera", es_especial: false },
  { id_rol: 3, nombre_rol: "ASISTENTE", descripcion: "Generación de volantes individuales y consultas", es_especial: false }
];

let mockMenus = [
  { id_menu: 1, nombre_menu: "Dashboard", descripcion: "Acceso al módulo de Dashboard", ruta: "/", orden: 1, estado: "ACTIVO" },
  { id_menu: 2, nombre_menu: "Usuarios y Roles", descripcion: "Acceso al módulo de Usuarios y Roles", ruta: "/usuarios", orden: 2, estado: "ACTIVO" },
  { id_menu: 3, nombre_menu: "Matrícula de Estudiantes", descripcion: "Acceso al módulo de Matrícula de Estudiantes", ruta: "/estudiantes", orden: 3, estado: "ACTIVO" },
  { id_menu: 4, nombre_menu: "Estructura Académica", descripcion: "Acceso al módulo de Estructura Académica", ruta: "/programas", orden: 4, estado: "ACTIVO" },
  { id_menu: 5, nombre_menu: "Gestión de Periodos", descripcion: "Acceso al módulo de Gestión de Periodos", ruta: "/periodos", orden: 5, estado: "ACTIVO" },
  { id_menu: 6, nombre_menu: "Generación de Volantes", descripcion: "Acceso al módulo de Generación de Volantes", ruta: "/cobros", orden: 6, estado: "ACTIVO" },
  { id_menu: 7, nombre_menu: "Recaudos y Pagos", descripcion: "Acceso al módulo de Recaudos y Pagos", ruta: "/pagos", orden: 7, estado: "ACTIVO" },
  { id_menu: 8, nombre_menu: "Estado de Cuenta", descripcion: "Acceso al módulo de Estado de Cuenta", ruta: "/cuenta-corriente", orden: 8, estado: "ACTIVO" },
  { id_menu: 9, nombre_menu: "Reportes Estadísticos", descripcion: "Acceso al módulo de Reportes Estadísticos", ruta: "/reportes", orden: 9, estado: "ACTIVO" },
  { id_menu: 10, nombre_menu: "Matriz RBAC", descripcion: "Acceso al módulo de Matriz RBAC", ruta: "/permisos", orden: 10, estado: "ACTIVO" }
];

// Matriz inicial en memoria para mocks
let mockPermisos = [
  // Admin tiene todo
  ...mockMenus.map(m => ({ id_menu: m.id_menu, id_rol: 1, puede_ver: true, puede_crear: true, puede_editar: true, puede_eliminar: true, menu_nombre: m.nombre_menu, menu_ruta: m.ruta })),
  // Supervisor
  ...mockMenus.map(m => ({ id_menu: m.id_menu, id_rol: 2, puede_ver: true, puede_crear: [3, 6, 7].includes(m.id_menu), puede_editar: false, puede_eliminar: false, menu_nombre: m.nombre_menu, menu_ruta: m.ruta })),
  // Asistente
  ...mockMenus.map(m => ({ id_menu: m.id_menu, id_rol: 3, puede_ver: [1, 3, 6, 7, 8].includes(m.id_menu), puede_crear: [6].includes(m.id_menu), puede_editar: false, puede_eliminar: false, menu_nombre: m.nombre_menu, menu_ruta: m.ruta }))
];

export async function GET(request, { params }) {
  const { path } = await params;
  const fullPath = Array.isArray(path) ? path.join("/") : path;

  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (!useMocks) {
    return proxyToBackend(`/rbac/${fullPath}`);
  }

  // Lógica de Mocks locales
  if (fullPath === "roles") {
    return Response.json(mockRoles);
  }
  if (fullPath === "menus") {
    return Response.json(mockMenus);
  }
  if (fullPath.startsWith("permisos/")) {
    const rolId = parseInt(fullPath.split("/")[1], 10);
    const mapped = mockMenus.map(m => {
      const p = mockPermisos.find(x => x.id_menu === m.id_menu && x.id_rol === rolId);
      if (p) return p;
      return {
        id_menu: m.id_menu,
        id_rol: rolId,
        puede_ver: false,
        puede_crear: false,
        puede_editar: false,
        puede_eliminar: false,
        menu_nombre: m.nombre_menu,
        menu_ruta: m.ruta
      };
    });
    return Response.json(mapped);
  }

  return Response.json({ message: "Ruta RBAC no encontrada en mocks" }, { status: 404 });
}

export async function POST(request, { params }) {
  const { path } = await params;
  const fullPath = Array.isArray(path) ? path.join("/") : path;

  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  const body = await request.json().catch(() => null);

  if (!useMocks) {
    return proxyToBackend(`/rbac/${fullPath}`, "POST", body);
  }

  if (fullPath.startsWith("permisos/")) {
    const rolId = parseInt(fullPath.split("/")[1], 10);
    if (body && body.permisos) {
      // Limpiar anteriores de este rol
      mockPermisos = mockPermisos.filter(p => p.id_rol !== rolId);
      // Guardar nuevos
      body.permisos.forEach(item => {
        const m = mockMenus.find(x => x.id_menu === item.id_menu);
        mockPermisos.push({
          id_menu: item.id_menu,
          id_rol: rolId,
          puede_ver: item.puede_ver,
          puede_crear: item.puede_crear,
          puede_editar: item.puede_editar,
          puede_eliminar: item.puede_eliminar,
          menu_nombre: m ? m.nombre_menu : "Menú",
          menu_ruta: m ? m.ruta : "/"
        });
      });
      return Response.json({ message: "Permisos actualizados en mocks exitosamente." });
    }
    return Response.json({ message: "Cuerpo de petición malformado" }, { status: 400 });
  }

  return Response.json({ message: "Ruta de actualización no soportada en mocks" }, { status: 404 });
}
