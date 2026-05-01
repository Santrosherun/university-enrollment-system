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
    <header className="flex items-center justify-between gap-4 border-b border-app-border bg-app-surface px-5 py-4 md:px-8 md:py-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-foreground">
          Sistema de Gestión de Matrículas
        </div>
        <div className="truncate text-xs text-app-muted">
          Rol: {role || "—"}
        </div>
      </div>

      <button
        onClick={logout}
        disabled={status === "loading"}
        className="rounded-xl border border-app-border bg-app-surface px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-app-bg hover:border-app-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-accent/30 active:bg-app-bg disabled:opacity-60"
      >
        {status === "loading" ? "Saliendo..." : "Cerrar sesión"}
      </button>
    </header>
  );
}

