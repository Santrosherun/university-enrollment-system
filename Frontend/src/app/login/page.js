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
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] px-6 py-10">
      <div className="w-full max-w-md">
        {/* Logo / Title Section */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-app-accent text-3xl shadow-lg shadow-app-accent/20">

          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">
            LOREM <span className="text-app-accent">IPSUM</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sistema de Gestión de Matrículas y Cartera
          </p>
        </div>

        {/* Login Card */}
        <div className="overflow-hidden rounded-3xl border border-white bg-white/70 p-8 shadow-2xl shadow-zinc-200/50 backdrop-blur-xl md:p-10">
          <h2 className="text-xl font-bold text-zinc-800">Bienvenido de nuevo</h2>
          <p className="mb-8 text-sm text-zinc-500">Ingresa tus credenciales de funcionario.</p>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Email o Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ejemplo@ues.edu.co o usuario"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Contraseña
                </label>
              </div>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-all placeholder:text-zinc-300 focus:border-app-accent focus:ring-4 focus:ring-app-accent/10"
                autoComplete="current-password"
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-600 border border-red-100 animate-shake">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "loading"}
              className="group relative w-full overflow-hidden rounded-xl bg-zinc-900 py-3.5 text-sm font-bold text-white transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70"
            >
              <span className={status === "loading" ? "opacity-0" : "opacity-100"}>
                Acceder al Sistema
              </span>
              {status === "loading" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                </div>
              )}
            </button>
          </form>

          {/* Demo Info Box */}
          {useMocks && (
            <div className="mt-10 rounded-2xl border border-amber-100 bg-amber-50/50 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-tighter text-amber-800">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
                Credenciales de acceso rápido
              </div>
              <div className="grid gap-3 text-xs">
                <div className="flex justify-between border-b border-amber-200/50 pb-2">
                  <span className="text-amber-700/70">ADMINISTRADOR</span>
                  <button
                    onClick={() => { setUsername("admin@ues.edu.co"); setPassword("admin123"); }}
                    className="font-mono font-bold text-amber-900 hover:underline"
                  >
                    admin@ues.edu.co
                  </button>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700/70">ASISTENTE</span>
                  <button
                    onClick={() => { setUsername("asistente@ues.edu.co"); setPassword("asistente123"); }}
                    className="font-mono font-bold text-amber-900 hover:underline"
                  >
                    asistente@ues.edu.co
                  </button>
                </div>
              </div>
              <div className="mt-3 text-[10px] text-amber-600 italic">
                * Haz clic en el correo para autocompletar.
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-xs text-zinc-400">
          &copy; 2024 University Enrollment System. <br />
          Todos los derechos reservados.
        </p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}


