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

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CuentaCorrientePage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [error, setError] = useState(null);

  async function loadEstudiantes() {
    try {
      const res = await fetch("/api/estudiantes");
      const json = await res.json();
      setEstudiantes(json.items ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMeta(false);
    }
  }

  async function loadCuenta(id) {
    if (!id) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/estudiantes/${id}/cuenta-corriente`);
      if (!res.ok) throw new Error("No se pudo cargar la cuenta corriente.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEstudiantes();
  }, []);

  useEffect(() => {
    loadCuenta(selectedEst);
  }, [selectedEst]);

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Cuenta corriente
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-app-muted">
          Consulta el balance y el historial de movimientos financieros de los estudiantes.
        </p>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="max-w-md">
          <label className="text-sm font-medium text-foreground">
            Seleccionar Estudiante
          </label>
          <select
            value={selectedEst}
            onChange={(e) => setSelectedEst(e.target.value)}
            disabled={loadingMeta}
            className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
          >
            <option value="">-- Elige un estudiante --</option>
            {estudiantes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.numeroDocumento} - {e.nombreCompleto}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-app-muted">Cargando movimientos...</div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                Total Cargos
              </div>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {formatCurrency(data.summary.totalCargos)}
              </div>
              <div className="mt-2 text-xs text-app-muted">
                Deudas generadas por matrículas
              </div>
            </div>
            <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                Total Abonos
              </div>
              <div className="mt-1 text-2xl font-bold text-emerald-600">
                {formatCurrency(data.summary.totalAbonos)}
              </div>
              <div className="mt-2 text-xs text-app-muted">
                Pagos recibidos a la fecha
              </div>
            </div>
            <div className={`rounded-2xl border p-5 shadow-sm ${
              data.summary.balance > 0 
                ? "border-amber-200 bg-amber-50/30" 
                : "border-emerald-200 bg-emerald-50/30"
            }`}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-app-muted">
                Balance Pendiente
              </div>
              <div className={`mt-1 text-2xl font-bold ${
                data.summary.balance > 0 ? "text-amber-700" : "text-emerald-700"
              }`}>
                {formatCurrency(data.summary.balance)}
              </div>
              <div className="mt-2 text-xs text-app-muted">
                Saldo total que adeuda el alumno
              </div>
            </div>
          </div>

          {/* Movements Table */}
          <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Historial de movimientos</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-xs uppercase text-app-muted">
                  <tr className="border-b border-app-border">
                    <th className="py-3 pr-4">Fecha</th>
                    <th className="py-3 pr-4">Descripción</th>
                    <th className="py-3 pr-4">Tipo</th>
                    <th className="py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {data.movimientos.map((m) => (
                    <tr key={m.id} className="border-b border-app-border/70 hover:bg-zinc-50/50">
                      <td className="py-4 pr-4 text-app-muted">
                        {formatDate(m.fecha)}
                      </td>
                      <td className="py-4 pr-4 font-medium text-foreground">
                        {m.descripcion}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          m.tipo === "CARGO" 
                            ? "bg-red-50 text-red-700 border border-red-100" 
                            : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                        }`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className={`py-4 text-right font-semibold ${
                        m.tipo === "CARGO" ? "text-foreground" : "text-emerald-600"
                      }`}>
                        {m.tipo === "CARGO" ? "" : "-"} {formatCurrency(m.valor)}
                      </td>
                    </tr>
                  ))}
                  {data.movimientos.length === 0 ? (
                    <tr>
                      <td className="py-10 text-center text-app-muted" colSpan={4}>
                        No hay movimientos registrados para este estudiante.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : selectedEst ? (
        <div className="text-sm text-app-muted">Selecciona un estudiante para ver su cuenta.</div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-app-border bg-zinc-50/50 p-10 text-center">
          <div className="text-4xl text-app-muted opacity-20">📊</div>
          <div className="mt-4 text-sm font-medium text-app-muted">
            Selecciona un estudiante arriba para generar el extracto financiero.
          </div>
        </div>
      )}
    </div>
  );
}


