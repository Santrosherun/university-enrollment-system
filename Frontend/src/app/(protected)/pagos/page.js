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

export default function PagosPage() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [selectedEst, setSelectedEst] = useState("");
  const [cobrosPendientes, setCobrosPendientes] = useState([]);
  const [balanceData, setBalanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    cobroId: "",
    valor: 0,
    metodo: "TRANSFERENCIA",
    fecha: new Date().toISOString().split("T")[0],
  });

  async function loadEstudiantes() {
    try {
      const res = await fetch("/api/estudiantes");
      const json = await res.json();
      setEstudiantes(json.items ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadPendientes(estId) {
    if (!estId) {
      setCobrosPendientes([]);
      setBalanceData(null);
      return;
    }
    setLoading(true);
    try {
      const [resCobros, resBalance] = await Promise.all([
        fetch(`/api/cobros?estudianteId=${estId}&estado=PENDIENTE`),
        fetch(`/api/estudiantes/${estId}/cuenta-corriente`)
      ]);
      
      const [jsonCobros, jsonBalance] = await Promise.all([
        resCobros.json(),
        resBalance.json()
      ]);

      setCobrosPendientes(jsonCobros.items ?? []);
      setBalanceData(jsonBalance);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEstudiantes();
  }, []);

  useEffect(() => {
    loadPendientes(selectedEst);
    setFormData((prev) => ({ ...prev, cobroId: "", valor: 0 }));
    setMessage(null);
  }, [selectedEst]);

  async function handleSelectCobro(e) {
    const id = e.target.value;
    const cobro = cobrosPendientes.find((c) => c.id === id);
    setFormData((prev) => ({
      ...prev,
      cobroId: id,
      valor: cobro ? cobro.total : 0,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedEst || !formData.valor) return;

    setSubmitting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/recaudos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          estudianteId: selectedEst,
          ...formData,
        }),
      });

      if (!res.ok) throw new Error("Error al procesar el pago.");

      setMessage({ type: "success", text: "¡Pago registrado exitosamente!" });
      await loadPendientes(selectedEst);
      setFormData({
        cobroId: "",
        valor: 0,
        metodo: "TRANSFERENCIA",
        fecha: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Simulación de pagos
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-app-muted">
          Registra el recaudo de matrículas y servicios para actualizar el balance del estudiante.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Lado Izquierdo: Selección y Deuda */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
            <label className="text-sm font-medium text-foreground">
              Estudiante que realiza el pago
            </label>
            <select
              value={selectedEst}
              onChange={(e) => setSelectedEst(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">-- Buscar estudiante --</option>
              {estudiantes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.numeroDocumento} - {e.nombreCompleto}
                </option>
              ))}
            </select>
          </div>

          {selectedEst && (
            <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-foreground">Deudas Pendientes</h3>
              {loading ? (
                <div className="mt-4 text-xs text-app-muted">Consultando cartera...</div>
              ) : balanceData && balanceData.summary.balance > 0 ? (
                <div className="mt-4 space-y-3">
                  {cobrosPendientes.map((c) => (
                    <div key={c.id} className="flex items-center justify-between rounded-xl border border-app-border/60 bg-zinc-50 p-3">
                      <div>
                        <div className="text-xs font-bold text-app-muted uppercase tracking-wider">{c.periodo}</div>
                        <div className="text-sm font-medium text-foreground">Matrícula y servicios</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-app-accent">{formatCurrency(c.total)}</div>
                        <div className="text-[10px] text-emerald-600 font-medium italic">Pendiente</div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-app-border mt-4 flex justify-between items-end">
                    <span className="text-xs font-semibold text-app-muted">TOTAL DEUDA REAL:</span>
                    <span className="text-xl font-black text-foreground">
                      {formatCurrency(balanceData.summary.balance)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-center">
                  <div className="text-xl">✅</div>
                  <div className="text-sm font-medium text-emerald-800">El estudiante está al día.</div>
                  <div className="text-xs text-emerald-600">No tiene cobros pendientes o tiene saldo a favor.</div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Lado Derecho: Formulario de Pago */}
        <div className="rounded-2xl border border-app-border bg-app-surface p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-foreground">Registrar nuevo pago</h3>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Concepto a Pagar</label>
              <select
                value={formData.cobroId}
                onChange={handleSelectCobro}
                disabled={!selectedEst || cobrosPendientes.length === 0}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                required
              >
                <option value="">-- Selecciona el cobro --</option>
                <option value="LIBRE">Abono libre a cuenta</option>
                {cobrosPendientes.map((c) => (
                  <option key={c.id} value={c.id}>
                    Cobro {c.periodo} ({formatCurrency(c.total)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Valor del Pago</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted">$</span>
                <input
                  type="number"
                  value={formData.valor}
                  onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                  disabled={!selectedEst}
                  className="w-full rounded-xl border border-app-border bg-app-surface pl-7 pr-3 py-2.5 text-sm font-bold text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Método</label>
                <select
                  value={formData.metodo}
                  onChange={(e) => setFormData({ ...formData, metodo: e.target.value })}
                  disabled={!selectedEst}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                >
                  <option value="TRANSFERENCIA">Transferencia</option>
                  <option value="EFECTIVO">Efectivo</option>
                  <option value="TARJETA">Tarjeta de Crédito</option>
                  <option value="CONVENIO">Convenio Bancario</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-app-muted uppercase tracking-wider">Fecha de Pago</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  disabled={!selectedEst}
                  className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {message && (
              <div className={`rounded-xl p-3 text-xs font-medium border ${
                message.type === "success" 
                  ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                  : "bg-red-50 border-red-100 text-red-800"
              }`}>
                {message.text}
              </div>
            )}

            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-4 text-base shadow-lg shadow-app-accent/20"
                disabled={submitting || !selectedEst || !formData.valor}
              >
                {submitting ? "Procesando pago..." : "Confirmar y Registrar Pago"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


