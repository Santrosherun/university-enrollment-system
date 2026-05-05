"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";

const formatCurrency = (val) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(val);
};

export default function ReportesPage() {
  const [data, setData] = useState(null);
  const [periodo, setPeriodo] = useState("2024-1");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/reportes/financieros?periodo=${periodo}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [periodo]);

  if (!data && loading) return <div className="p-10 text-app-muted">Cargando reportes...</div>;

  const maxFacturado = Math.max(...(data?.porPrograma.map(p => p.facturado) || [1]));

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Reportes Financieros
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Análisis de facturación, recaudos y efectividad por periodo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-app-muted uppercase">Periodo:</label>
          <select 
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-foreground outline-none focus:border-app-accent"
          >
            <option value="2024-1">2024-1</option>
            <option value="2023-2">2023-2</option>
            <option value="">Histórico Total</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Total Facturado</div>
          <div className="mt-1 text-2xl font-bold text-foreground">{formatCurrency(data?.summary.totalFacturado || 0)}</div>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Total Recaudado</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrency(data?.summary.totalRecaudado || 0)}</div>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Cartera Pendiente</div>
          <div className="mt-1 text-2xl font-bold text-red-600">{formatCurrency(data?.summary.carteraPendiente || 0)}</div>
        </div>
        <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">Efectividad Recaudo</div>
          <div className="mt-1 text-2xl font-bold text-app-accent">{(data?.summary.efectividad || 0).toFixed(1)}%</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
            <div 
              className="h-full bg-app-accent transition-all duration-500" 
              style={{ width: `${data?.summary.efectividad || 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart: Facturación por Programa */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground mb-6">Facturación por Programa</h3>
          <div className="space-y-5">
            {data?.porPrograma.map((prog) => (
              <div key={prog.id} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-app-muted">{prog.nombre}</span>
                  <span className="font-bold text-foreground">{formatCurrency(prog.facturado)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-50">
                  <div 
                    className="h-full bg-zinc-800 transition-all duration-700"
                    style={{ width: `${(prog.facturado / maxFacturado) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {data?.porPrograma.length === 0 && (
              <div className="text-center py-10 text-xs text-app-muted">No hay datos para este periodo.</div>
            )}
          </div>
        </div>

        {/* Info adicional o Tabla resumida */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
           <div className="w-16 h-16 rounded-full bg-app-accent/10 flex items-center justify-center text-2xl">
             📈
           </div>
           <div className="max-w-xs">
             <h3 className="text-sm font-semibold text-foreground">Análisis de Cartera</h3>
             <p className="mt-1 text-xs text-app-muted">
               El programa con mayor facturación en este periodo es <strong className="text-foreground">{data?.porPrograma[0]?.nombre || "---"}</strong>. 
               La efectividad de recaudo se mantiene estable.
             </p>
           </div>
           <Button variant="secondary" size="sm" onClick={() => window.print()}>
             Exportar Dashboard
           </Button>
        </div>
      </div>
    </div>
  );
}


