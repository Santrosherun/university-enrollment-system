import { cookies } from "next/headers";
import Link from "next/link";
import {
  Roles,
  dashboardCardMetaForHref,
  dashboardNavItemsForRole,
} from "@/lib/navigation";

function Card({ title, description, href, cta }) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
      <div className="text-sm font-semibold text-foreground">{title}</div>
      <div className="mt-1.5 text-sm leading-relaxed text-app-muted">
        {description}
      </div>
      {href ? (
        <div className="mt-5">
          <Link
            href={href}
            className="inline-flex items-center justify-center rounded-xl bg-app-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-app-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 active:opacity-95"
          >
            {cta}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function safeRole(value) {
  return Object.values(Roles).includes(value) ? value : null;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const rawRole = cookieStore.get("ues_role")?.value ?? null;
  const role = safeRole(rawRole);
  const navItems = dashboardNavItemsForRole(role);

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-app-border bg-app-surface p-7 shadow-sm md:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Dashboard
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-app-muted md:text-base">
            Bienvenido. Tu rol actual es{" "}
            <span className="font-semibold text-foreground">
              {role || "—"}
            </span>
            . Abajo solo verás los módulos que puedes usar con este rol.
          </p>
        </div>
      </div>

      {navItems.length === 0 ? (
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 text-sm text-app-muted shadow-sm">
          No hay módulos asignados para tu sesión. Cierra sesión e inicia de
          nuevo, o contacta al administrador.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {navItems.map((item) => {
            const meta = dashboardCardMetaForHref(item.href);
            return (
              <Card
                key={item.href}
                title={item.label}
                description={meta.description}
                href={item.href}
                cta={meta.cta}
              />
            );
          })}
        </div>
      )}

      <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm md:p-7">
        <div className="text-sm font-semibold text-foreground">
          Consejos para probar
        </div>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-app-muted">
          <li>
            Si intentas una ruta no permitida para tu rol, el sistema te envía a{" "}
            <span className="font-medium text-foreground">/denied</span>.
          </li>
          <li>
            Para cambiar de rol, usa{" "}
            <span className="font-medium text-foreground">
              Cerrar sesión
            </span>{" "}
            y vuelve a entrar en{" "}
            <span className="font-medium text-foreground">/login</span> (modo
            demo).
          </li>
        </ul>
      </div>
    </div>
  );
}
