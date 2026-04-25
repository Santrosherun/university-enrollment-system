import Link from "next/link";

export default function AccessDeniedPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Acceso denegado
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          No tienes permisos para ver esta pantalla.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Ir al inicio
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Volver al login
          </Link>
        </div>
      </div>
    </div>
  );
}

