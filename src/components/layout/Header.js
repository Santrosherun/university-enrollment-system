"use client";

import { useState } from "react";

export default function Header({ role }) {
  const [status, setStatus] = useState("idle");

  async function logout() {
    setStatus("loading");
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    window.location.href = "/login";
  }

  return (
    <header className="flex items-center justify-between gap-4 border-b border-zinc-200 bg-white px-4 py-3 md:px-6">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-zinc-900">
          Sistema de Gestión de Matrículas
        </div>
        <div className="truncate text-xs text-zinc-500">
          Rol: {role || "—"}
        </div>
      </div>

      <button
        onClick={logout}
        disabled={status === "loading"}
        className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 disabled:opacity-60"
      >
        {status === "loading" ? "Saliendo..." : "Cerrar sesión"}
      </button>
    </header>
  );
}

