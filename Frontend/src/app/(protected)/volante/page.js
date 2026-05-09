"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function VolanteMainPage() {
  const [ref, setRef] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (ref.trim()) {
      // Limpiar el prefijo si el usuario lo pega con REF-
      const cleanRef = ref.trim().replace("REF-", "cb_");
      window.open(`/api/cobros/${cleanRef}/pdf`, "_blank");
    }
  };


  return (
    <div className="flex h-[70vh] flex-col items-center justify-center space-y-8">
      <div className="max-w-md text-center space-y-2">
        <div className="text-4xl">📄</div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Buscador de Volantes
        </h1>
        <p className="text-sm text-app-muted">
          Ingresa la referencia del cobro para generar el volante oficial de matrícula listo para impresión.
        </p>
      </div>

      <form 
        onSubmit={handleSearch}
        className="w-full max-w-md rounded-2xl border border-app-border bg-app-surface p-8 shadow-xl space-y-4"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Referencia de Pago</label>
          <input
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-3 text-lg font-mono text-foreground placeholder:text-app-muted/50 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            placeholder="Ej: cb_001 o REF-001"
            required
          />
        </div>
        <Button type="submit" className="w-full py-4 text-base">
          Generar Volante para Impresión
        </Button>
      </form>

      <div className="text-xs text-app-muted flex items-center gap-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400"></span>
        También puedes imprimir volantes desde la pestaña de 
        <a href="/cobros" className="text-app-accent font-semibold hover:underline ml-1">Generación de Cobros</a>.
      </div>
    </div>
  );
}


