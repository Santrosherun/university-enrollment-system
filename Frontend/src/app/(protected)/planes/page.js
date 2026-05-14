"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-app-border bg-app-surface p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-foreground">{title}</div>
            <div className="mt-1 text-sm text-app-muted">
              Un plan pertenece a un programa académico.
            </div>
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

export default function PlanesPage() {
  const [programas, setProgramas] = useState([]);
  const [selectedProgramaId, setSelectedProgramaId] = useState("");
  const [asignaturas, setAsignaturas] = useState([]);

  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return planes;
    return planes.filter(
      (p) =>
        p.asignatura_nombre?.toLowerCase().includes(q) ||
        p.asignatura_codigo?.toLowerCase().includes(q)
    );
  }, [planes, query]);

  async function loadData() {
    const [resProgs, resAsig] = await Promise.all([
      fetch("/api/programas"),
      fetch("/api/asignaturas")
    ]);
    if (resProgs.ok) {
      const payload = await resProgs.json();
      const list = payload.items ?? [];
      setProgramas(list);
      if (!selectedProgramaId && list[0]?.id_programa) setSelectedProgramaId(list[0].id_programa);
    }
    if (resAsig.ok) {
      const payload = await resAsig.json();
      setAsignaturas(payload.items ?? []);
    }
  }

  async function loadPlanes(id_programa) {
    setLoading(true);
    setError(null);
    const qs = id_programa ? `?id_programa=${encodeURIComponent(id_programa)}` : "";
    const res = await fetch(`/api/planes${qs}`);
    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      setError(payload?.message ?? "No se pudieron cargar los planes.");
      setLoading(false);
      return;
    }
    const payload = await res.json();
    setPlanes(payload.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedProgramaId) return;
    loadPlanes(selectedProgramaId);
  }, [selectedProgramaId]);

  async function save(form) {
    const isEdit = !!editing;
    const url = "/api/planes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar el plan.");
    }

    await loadPlanes(selectedProgramaId);
    setOpen(false);
    setEditing(null);
  }


  const totalCredits = useMemo(() => {
    return planes.reduce((acc, p) => acc + (p.creditos_plan || 0), 0);
  }, [planes]);

  const selectedPrograma = programas.find((p) => String(p.id_programa) === String(selectedProgramaId));

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Planes de estudio
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Administra la malla curricular y los créditos de cada programa.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-xl border border-app-border bg-app-surface px-4 py-2 text-center shadow-sm">
            <div className="text-[10px] font-black uppercase text-app-muted">Total Créditos</div>
            <div className="text-xl font-bold text-app-accent">{totalCredits}</div>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
            disabled={!selectedProgramaId}
          >
            Agregar asignatura
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-1 lg:col-span-1">
            <label className="text-sm font-medium text-foreground">
              Programa
            </label>
            <select
              value={selectedProgramaId}
              onChange={(e) => setSelectedProgramaId(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              {programas.map((p) => (
                <option key={p.id_programa} value={p.id_programa}>
                  {p.nombre_programa}
                </option>
              ))}
            </select>
            {selectedPrograma ? (
              <div className="text-xs text-app-muted">
                Modalidad:{" "}
                <span className="font-medium text-foreground">
                  {selectedPrograma.modalidad_programa}
                </span>
              </div>
            ) : null}
          </div>

          <div className="space-y-1 lg:col-span-2">
            <label className="text-sm font-medium text-foreground">Buscar asignatura</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Nombre o código de la asignatura..."
            />
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-app-muted">Cargando...</div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Asignatura</th>
                  <th className="py-3 pr-4 text-center">Semestre</th>
                  <th className="py-3 pr-4 text-center">Créditos</th>
                  <th className="py-3 pr-4 text-center">Obligatoria</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, idx) => (
                  <tr key={`${p.id_programa}-${p.id_asignatura}-${idx}`} className="border-b border-app-border/70">
                    <td className="py-3 pr-4">
                      <div className="text-foreground font-medium">{p.asignatura_nombre}</div>
                      <div className="text-xs text-app-muted">{p.asignatura_codigo}</div>
                    </td>
                    <td className="py-3 pr-4 text-center text-foreground/90">
                      {p.semestre}
                    </td>
                    <td className="py-3 pr-4 text-center text-foreground/90">
                      {p.creditos}
                    </td>
                    <td className="py-3 pr-4 text-center">
                       <span className={`inline-block w-2 h-2 rounded-full ${p.es_obligatoria ? 'bg-app-accent' : 'bg-zinc-300'}`} />
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditing(p); setOpen(true); }}
                        >
                          Editar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="py-6 text-sm text-app-muted" colSpan={5}>
                      No hay asignaturas asociadas a este programa.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <PlanFormModal
          title="Agregar asignatura al plan"
          initial={editing}
          programas={programas}
          asignaturas={asignaturas}
          defaultProgramaId={selectedProgramaId}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      ) : null}

    </div>
  );
}

function PlanFormModal({
  title,
  initial,
  programas,
  asignaturas,
  defaultProgramaId,
  onClose,
  onSave,
}) {
  const [id_programa, setProgId] = useState(
    initial?.id_programa ?? defaultProgramaId ?? "",
  );
  const [id_asignatura, setAsigId] = useState(initial?.id_asignatura ?? "");
  const [creditos_plan, setCreditos] = useState(initial?.creditos_plan ?? "");
  const [semestre, setSemestre] = useState(initial?.semestre ?? "1");
  const [es_obligatoria, setObligatoria] = useState(Boolean(initial?.es_obligatoria ?? true));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  // Auto-completar créditos al seleccionar asignatura
  function handleAsigChange(id) {
    setAsigId(id);
    if (!initial) {
      const selected = asignaturas.find(a => String(a.id_asignatura) === String(id));
      if (selected) setCreditos(selected.creditos);
    }
  }

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave({
        id_programa,
        id_asignatura: Number(id_asignatura),
        semestre: Number(semestre),
        creditos_plan: Number(creditos_plan),
        es_obligatoria
      });
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  return (
    <Modal title={initial ? "Editar asignatura en plan" : "Agregar asignatura al plan"} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Programa</label>
          <select
            value={id_programa}
            onChange={(e) => setProgId(e.target.value)}
            disabled={!!initial}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
            required
          >
            {programas.map((p) => (
              <option key={p.id_programa} value={p.id_programa}>
                {p.nombre_programa}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground">Asignatura</label>
          <select
            value={id_asignatura}
            onChange={(e) => handleAsigChange(e.target.value)}
            disabled={!!initial}
            className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20 disabled:opacity-50"
            required
          >
            <option value="">Selecciona una asignatura...</option>
            {asignaturas.map((a) => (
              <option key={a.id_asignatura} value={a.id_asignatura}>
                {a.codigo_asignatura} — {a.nombre_asignatura} ({a.creditos} cr)
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Semestre</label>
            <input
              type="number"
              min="1"
              max="12"
              value={semestre}
              onChange={(e) => setSemestre(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Créditos en este plan</label>
            <input
              type="number"
              min="1"
              value={creditos_plan}
              onChange={(e) => setCreditos(e.target.value)}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={es_obligatoria}
            onChange={(e) => setObligatoria(e.target.checked)}
            className="h-4 w-4 rounded border-app-border text-app-accent focus:ring-app-accent/30"
          />
          Obligatoria
        </label>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

