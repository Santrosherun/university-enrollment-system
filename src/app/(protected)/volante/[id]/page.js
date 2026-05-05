"use client";

import { useEffect, useState, use } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";

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
    month: "long",
    day: "numeric",
  });
};

export default function VolantePage({ params }) {
  const { id } = use(params);
  const [cobro, setCobro] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [programa, setPrograma] = useState(null);
  const [codigos, setCodigos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const resCobro = await fetch(`/api/cobros/${id}`);
      if (!resCobro.ok) throw new Error("Cobro no encontrado.");
      const dataCobro = await resCobro.json();
      setCobro(dataCobro);

      const [resEst, resCodes] = await Promise.all([
        fetch(`/api/estudiantes/${dataCobro.estudianteId}`),
        fetch("/api/codigos-detalle"),
      ]);

      const dataEst = await resEst.json();
      setEstudiante(dataEst);
      setCodigos(resCodes.ok ? (await resCodes.json()).items : []);

      const resProg = await fetch(`/api/programas`);
      const dataProgs = await resProg.json();
      const prog = dataProgs.items.find((p) => p.id === dataEst.programaId);
      setPrograma(prog);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [id]);

  if (loading) return <div className="p-10 text-center">Generando volante...</div>;
  if (error) return <div className="p-10 text-center text-red-600">{error}</div>;

  const getCodeName = (cid) => codigos.find((c) => c.id === cid)?.nombre ?? "Concepto";

  return (
    <div className="min-h-screen bg-zinc-100/50 p-4 sm:p-8 print:bg-white print:p-0">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Barra de acciones (se oculta al imprimir) */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm print:hidden">
          <Link href="/cobros">
            <Button variant="secondary" size="sm">
              ← Volver a Cobros
            </Button>
          </Link>
          <div className="flex gap-2">
            <Button onClick={() => window.print()}>
              🖨️ Imprimir Volante / Guardar PDF
            </Button>
          </div>
        </div>

        {/* El Volante Real */}
        <div className="relative overflow-hidden rounded-2xl border border-app-border bg-white p-8 shadow-sm print:rounded-none print:border-none print:shadow-none">
          {/* Marca de agua simulada para el estado */}
          {cobro.estado === "PAGADO" && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-35deg] pointer-events-none opacity-[0.08]">
              <div className="border-8 border-emerald-600 px-10 py-4 text-7xl font-black text-emerald-600 uppercase">
                PAGADO
              </div>
            </div>
          )}

          {/* Encabezado */}
          <div className="flex flex-col justify-between gap-6 border-b-2 border-zinc-900 pb-8 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <div className="text-2xl font-black tracking-tighter text-zinc-900 uppercase">
                Universidad del Caribe
              </div>
              <div className="text-xs font-medium text-app-muted uppercase tracking-widest">
                Nit: 800.123.456-7 • Institución de Educación Superior
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-app-muted uppercase">Referencia de Pago</div>
              <div className="text-xl font-mono font-bold text-zinc-900">{cobro.id.replace("cb_", "REF-")}</div>
            </div>
          </div>

          {/* Datos del Estudiante */}
          <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold uppercase text-app-muted tracking-widest">Estudiante</div>
                <div className="text-lg font-bold text-zinc-900 uppercase">{estudiante?.nombreCompleto}</div>
                <div className="text-sm text-zinc-600">{estudiante?.tipoDocumento} {estudiante?.numeroDocumento}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-app-muted tracking-widest">Programa Académico</div>
                <div className="text-sm font-semibold text-zinc-800">{programa?.nombre}</div>
                <div className="text-xs text-zinc-500">Modalidad: {programa?.modalidad}</div>
              </div>
            </div>
            <div className="space-y-4 text-right sm:text-right">
              <div>
                <div className="text-[10px] font-bold uppercase text-app-muted tracking-widest">Periodo Académico</div>
                <div className="text-lg font-bold text-zinc-900">{cobro.periodo}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase text-app-muted tracking-widest">Fecha de Emisión</div>
                <div className="text-sm text-zinc-800">{formatDate(cobro.createdAt)}</div>
              </div>
            </div>
          </div>

          {/* Tabla de Conceptos */}
          <div className="mt-10">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-zinc-900 text-white">
                  <th className="p-3 text-left font-semibold uppercase tracking-wider">Descripción del Concepto</th>
                  <th className="p-3 text-right font-semibold uppercase tracking-wider">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 border-x border-b border-zinc-200">
                {cobro.items.map((item, i) => (
                  <tr key={i}>
                    <td className="p-3 text-zinc-700">{getCodeName(item.codigoDetalleId)}</td>
                    <td className="p-3 text-right font-medium text-zinc-900">{formatCurrency(item.valor)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {cobro.estado === "PAGADO" ? (
                  <>
                    <tr className="bg-zinc-50 border-x border-zinc-200">
                      <td className="p-3 text-right font-bold uppercase text-zinc-600">Total Liquidado</td>
                      <td className="p-3 text-right font-bold text-zinc-900">{formatCurrency(cobro.total)}</td>
                    </tr>
                    <tr className="bg-emerald-50 border-x border-zinc-200">
                      <td className="p-3 text-right font-bold uppercase text-emerald-700">Total Pagado</td>
                      <td className="p-3 text-right font-bold text-emerald-700">-{formatCurrency(cobro.total)}</td>
                    </tr>
                    <tr className="bg-zinc-100 border-x border-b border-zinc-200">
                      <td className="p-4 text-right font-black uppercase text-zinc-900">Saldo Pendiente</td>
                      <td className="p-4 text-right text-xl font-black text-zinc-900">{formatCurrency(0)}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="bg-zinc-50 border-x border-b border-zinc-200">
                    <td className="p-4 text-right font-bold uppercase text-zinc-600">Total a Pagar</td>
                    <td className="p-4 text-right text-xl font-black text-zinc-900">{formatCurrency(cobro.total)}</td>
                  </tr>
                )}
              </tfoot>
            </table>
          </div>


          {/* Instrucciones y Código de Barras */}
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 items-end">
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Instrucciones de Pago</div>
                <ul className="list-disc pl-4 text-xs text-zinc-600 space-y-1">
                  <li>Realice su pago en cualquier sucursal de Banco Davivienda o Bancolombia.</li>
                  <li>Convenio Recaudo No. 12345.</li>
                  <li>Si paga por PSE, use la referencia indicada arriba.</li>
                  <li>Este volante vence el {formatDate(new Date(new Date(cobro.createdAt).getTime() + 15*24*60*60*1000).toISOString())}.</li>
                </ul>
              </div>
              <div className="text-[10px] text-zinc-400 italic">
                Documento generado electrónicamente. No requiere firma ni sello para su validez.
              </div>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2">
              {/* Simulación de código de barras */}
              <div className="h-16 w-full max-w-[300px] bg-zinc-900 flex items-center justify-center p-2">
                <div className="flex gap-[2px] items-stretch h-full w-full bg-white px-1">
                  {[...Array(60)].map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-black" 
                      style={{ width: `${Math.floor(Math.random() * 4) + 1}px` }}
                    />
                  ))}
                </div>
              </div>
              <div className="text-[10px] font-mono text-zinc-600">
                (415)7709998012345(8020)00000{cobro.total}(3900)0000000000
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            padding: 0 !important;
          }
          /* Ocultar barra lateral y header si existen en el layout global */
          aside, nav, header {
            display: none !important;
          }
          main {
             padding: 0 !important;
             margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
