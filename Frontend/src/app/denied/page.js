import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-6 py-10 md:px-10">
      <div className="w-full max-w-lg rounded-2xl border border-app-border bg-app-surface p-7 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Acceso denegado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-app-muted md:text-base">
          No tienes permisos para ver esta pantalla.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-app-accent px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-app-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 active:opacity-95"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-app-border bg-app-surface px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-app-bg hover:border-app-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/30 active:bg-app-bg"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}

