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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Sistema de matrículas
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
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
            <label className="text-sm font-medium text-zinc-900">
              Usuario
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
              autoComplete="username"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-900">
              Contraseña
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-0 focus:border-zinc-400"
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
            className="w-full rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {status === "loading" ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

