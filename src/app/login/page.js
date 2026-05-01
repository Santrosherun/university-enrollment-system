"use client";

import { useState } from "react";

export default function LoginPage() {
  const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS === "true";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.message ?? "No se pudo iniciar sesión.");
      setStatus("idle");
      return;
    }

    setStatus("idle");
    window.location.href = "/dashboard";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-app-bg px-6 py-10 md:px-10">
      <div className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-7 shadow-sm md:p-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Sistema de matrículas
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-app-muted md:text-base">
          Inicia sesión para continuar.
        </p>

        {useMocks ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <div className="font-medium">Modo demo activo</div>
            <div className="mt-1 grid gap-1 text-xs">
              <div>
                <span className="font-medium">ADMINISTRADOR</span>: admin / admin123
              </div>
              <div>
                <span className="font-medium">SUPERVISOR</span>: supervisor / super123
              </div>
              <div>
                <span className="font-medium">ASISTENTE</span>: asistente / asis123
              </div>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Usuario
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none ring-0 transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none ring-0 transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-xl bg-app-accent px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-app-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/40 active:opacity-95 disabled:opacity-60"
          >
            {status === "loading" ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

