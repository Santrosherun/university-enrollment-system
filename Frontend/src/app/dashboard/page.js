import { cookies } from "next/headers";
import Link from "next/link";
import {
  Roles,
  dashboardCardMetaForHref,
  dashboardNavItemsForRole,
} from "@/lib/navigation";
import { MockDb } from "@/lib/mocks/db";

// Asignación de íconos representativos con alto atractivo visual
const ICON_BY_HREF = {
  "/programas": "🏛️",
  "/periodos": "📅",
  "/planes": "📑",
  "/asignaturas": "📚",
  "/estudiantes": "🎓",
  "/codigos-detalle": "🏷️",
  "/reglas-cobro": "⚖️",
  "/cobros": "💳",
  "/cuenta-corriente": "📊",
  "/pagos": "💰",
  "/reportes": "📈",
  "/admin/seguridad": "🔐",
  "/permisos": "🛡️",
};

function Card({ title, description, href, cta }) {
  const icon = ICON_BY_HREF[href] || "⚡";
  
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-app-border/80 bg-app-surface p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-app-accent/40 hover:shadow-xl">
      {/* Efecto de resplandor suave de fondo al hacer hover */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-app-accent/5 transition-all duration-500 group-hover:scale-150 group-hover:bg-app-accent/10" />

      <div>
        <div className="flex items-center justify-between">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-50 border border-zinc-100 text-2xl shadow-inner transition-transform group-hover:scale-110">
            {icon}
          </span>
          <span className="text-[10px] font-black uppercase tracking-wider text-app-muted/60">
            Módulo
          </span>
        </div>

        <h3 className="mt-5 text-base font-bold text-foreground group-hover:text-app-accent transition-colors">
          {title}
        </h3>
        
        <p className="mt-2 text-xs leading-relaxed text-app-muted line-clamp-2">
          {description}
        </p>
      </div>

      <div className="mt-7 pt-4 border-t border-app-border/40">
        <Link
          href={href}
          className="inline-flex w-full items-center justify-between rounded-xl bg-zinc-100 text-zinc-800 group-hover:bg-app-accent group-hover:text-white px-4 py-2.5 text-xs font-bold transition-all duration-200"
        >
          <span>{cta}</span>
          <span className="text-base leading-none transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </div>
  );
}

function safeRole(value) {
  return Object.values(Roles).includes(value) ? value : null;
}

async function getActiveUserRealName(tokenValue, currentRole, rawNameCookie) {
  if (rawNameCookie) return rawNameCookie;

  const useMocks =
    process.env.NEXT_PUBLIC_USE_MOCKS === "true" ||
    process.env.NEXT_PUBLIC_USE_MOCKS === "1";

  if (useMocks) {
    const list = MockDb.listUsuarios ? MockDb.listUsuarios() : [];
    const targetRole = currentRole === "ADMINISTRADOR" ? "ADMIN" : currentRole;
    const found = list.find(u => u.rol === targetRole || u.rol === currentRole);
    if (found && found.nombre) return found.nombre;
  } else if (tokenValue) {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiBaseUrl}/auth/me`, {
        headers: { "Authorization": `Bearer ${tokenValue}` },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.primer_nombre) {
          return `${data.primer_nombre} ${data.primer_apellido || ""}`.trim();
        }
      }
    } catch (err) {
      // Ignorar fallo de red y usar fallback
    }
  }

  return currentRole ? currentRole.charAt(0) + currentRole.slice(1).toLowerCase() : "Usuario";
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get("ues_role")?.value ?? null;
  const rawName = cookieStore.get("ues_name")?.value;
  const tokenVal = cookieStore.get("ues_session")?.value;
  const role = safeRole(rawRole);
  
  // Consulta exhaustiva: extrae el nombre real directamente desde la base de datos o el token si falta en la cookie
  const userName = await getActiveUserRealName(tokenVal, role, rawName);
  const navItems = dashboardNavItemsForRole(role);

  // Clasificar módulos por categorías para una barra/malla independiente altamente estructurada
  const academicItems = navItems.filter(i => ["/programas", "/periodos", "/planes", "/asignaturas"].includes(i.href));
  const studentItems = navItems.filter(i => ["/estudiantes", "/cuenta-corriente"].includes(i.href));
  const financeItems = navItems.filter(i => ["/codigos-detalle", "/reglas-cobro", "/cobros", "/pagos"].includes(i.href));
  const auditItems = navItems.filter(i => ["/reportes", "/admin/seguridad", "/permisos"].includes(i.href));

  return (
    <div className="space-y-10 px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto pb-16">
      {/* Banner Principal Premium con Efecto Glassmorphism y Gradiente */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-800 to-app-accent p-8 text-white shadow-xl md:p-10">
        {/* Elementos decorativos absolutos */}
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-40 w-40 rounded-full bg-app-accent/20 blur-xl" />

        <div className="relative z-10 flex flex-col justify-between gap-4">
          <div className="inline-flex self-start items-center gap-2 rounded-full bg-white/10 px-3 py-1 backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-200">
              Sesión Activa: {role || "Demo"}
            </span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl lg:text-5xl mt-2">
            ¡Hola, <span className="text-emerald-400">{userName}</span>!
          </h1>

          <p className="max-w-2xl text-xs md:text-sm leading-relaxed text-zinc-300 mt-1">
            Bienvenido al Sistema de Gestión Académica y Financiera Universitaria. Explora e interactúa de forma segura con los módulos operativos a continuación.
          </p>
        </div>
      </div>

      {/* Rejilla de Módulos (Organizada independientemente por Secciones/Categorías) */}
      {navItems.length === 0 ? (
        <div className="rounded-3xl border border-app-border bg-app-surface p-12 text-center text-sm text-app-muted shadow-sm">
          No hay módulos asignados para tu sesión. Cierra sesión e inicia de
          nuevo, o contacta al administrador.
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECCIÓN 1: Gestión Académica */}
          {academicItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-app-border pb-2">
                <span className="text-base">🎒</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-app-muted">Estructura Académica</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {academicItems.map(item => {
                  const meta = dashboardCardMetaForHref(item.href);
                  return <Card key={item.href} title={item.label} description={meta.description} href={item.href} cta={meta.cta} />;
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: Alumnado y Estado de Cuenta */}
          {studentItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-app-border pb-2">
                <span className="text-base">🧑‍🎓</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-app-muted">Gestión Estudiantil</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {studentItems.map(item => {
                  const meta = dashboardCardMetaForHref(item.href);
                  return <Card key={item.href} title={item.label} description={meta.description} href={item.href} cta={meta.cta} />;
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: Motor Financiero y Liquidación */}
          {financeItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-app-border pb-2">
                <span className="text-base">💳</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-app-muted">Tesorería y Facturación</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {financeItems.map(item => {
                  const meta = dashboardCardMetaForHref(item.href);
                  return <Card key={item.href} title={item.label} description={meta.description} href={item.href} cta={meta.cta} />;
                })}
              </div>
            </div>
          )}

          {/* SECCIÓN 4: Auditoría, Reportes y Seguridad */}
          {auditItems.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-app-border pb-2">
                <span className="text-base">🛡️</span>
                <h2 className="text-xs font-black uppercase tracking-widest text-app-muted">Auditoría y Configuración</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
                {auditItems.map(item => {
                  const meta = dashboardCardMetaForHref(item.href);
                  return <Card key={item.href} title={item.label} description={meta.description} href={item.href} cta={meta.cta} />;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
