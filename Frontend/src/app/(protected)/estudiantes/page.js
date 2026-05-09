"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

function Modal({ title, hint, children, onClose }) {
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
            {hint ? (
              <div className="mt-1 text-sm text-app-muted">{hint}</div>
            ) : null}
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

function ConfirmModal({ title, description, confirmLabel, onConfirm, onClose }) {
  const [status, setStatus] = useState("idle");

  async function handleConfirm() {
    setStatus("loading");
    try {
      await onConfirm();
      onClose();
    } catch {
      setStatus("idle");
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="text-sm leading-relaxed text-app-muted">{description}</div>
      <div className="mt-6 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={status === "loading"}
          onClick={handleConfirm}
        >
          {status === "loading" ? "Eliminando..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default function EstudiantesPage() {
  const [items, setItems] = useState([]);
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filterProg, setFilterProg] = useState("");
  const [error, setError] = useState(null);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = useMemo(() => {
    let list = items;
    const q = query.trim().toLowerCase();
    
    if (filterProg) {
      list = list.filter((e) => e.id_programa === filterProg);
    }
    
    if (q) {
      list = list.filter(
        (e) => {
          const fullName = `${e.primer_nombre} ${e.segundo_nombre ?? ""} ${e.primer_apellido} ${e.segundo_apellido ?? ""}`.toLowerCase();
          return (
            fullName.includes(q) ||
            e.numero_documento?.includes(q) ||
            e.correo_electronico?.toLowerCase().includes(q)
          );
        }
      );
    }
    
    return list;
  }, [items, query, filterProg]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [resEst, resProg] = await Promise.all([
        fetch("/api/estudiantes"),
        fetch("/api/programas")
      ]);
      
      if (!resEst.ok || !resProg.ok) throw new Error("Error al cargar datos.");
      
      const [dataEst, dataProg] = await Promise.all([
        resEst.json(),
        resProg.json()
      ]);
      
      setItems(dataEst.items ?? []);
      setProgramas(dataProg.items ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(form) {
    const isEdit = Boolean(editing?.id_estudiante);
    const url = isEdit ? `/api/estudiantes/${editing.id_estudiante}` : "/api/estudiantes";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo guardar el estudiante.");
    }

    await load();
    setOpen(false);
    setEditing(null);
  }

  async function toggleActivo(item) {
    const nuevoEstado = item.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";
    const res = await fetch(`/api/estudiantes/${item.id_estudiante}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    if (!res.ok) return;
    await load();
  }

  async function removeEstudiante(item) {
    const res = await fetch(`/api/estudiantes/${item.id_estudiante}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const payload = await res.json().catch(() => null);
      throw new Error(payload?.message ?? "No se pudo eliminar el estudiante.");
    }
    await load();
  }

  const getProgName = (id) => programas.find((p) => p.id_programa === id)?.nombre_programa ?? "N/A";

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Estudiantes
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-app-muted">
            Gestiona la información personal y académica de los estudiantes.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Nuevo estudiante
        </Button>
      </div>

      <div className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex-1">
            <label className="text-sm font-medium text-foreground">
              Buscar
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Nombre, documento o correo..."
            />
          </div>
          <div className="w-full md:w-64">
            <label className="text-sm font-medium text-foreground">
              Programa
            </label>
            <select
              value={filterProg}
              onChange={(e) => setFilterProg(e.target.value)}
              className="mt-1 w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            >
              <option value="">Todos los programas</option>
              {programas.map((p) => (
                <option key={p.id_programa} value={p.id_programa}>
                  {p.nombre_programa}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end self-end">
            <Button variant="secondary" onClick={load}>
              Recargar
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 text-sm text-app-muted">Cargando estudiantes...</div>
        ) : error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-app-muted">
                <tr className="border-b border-app-border">
                  <th className="py-3 pr-4">Documento</th>
                  <th className="py-3 pr-4">Nombre Completo</th>
                  <th className="py-3 pr-4">Programa</th>
                  <th className="py-3 pr-4">Estado</th>
                  <th className="py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => {
                  const fullName = `${item.primer_nombre} ${item.segundo_nombre ?? ""} ${item.primer_apellido} ${item.segundo_apellido ?? ""}`;
                  return (
                    <tr key={item.id_estudiante} className="border-b border-app-border/70 hover:bg-zinc-50/50">
                      <td className="py-3 pr-4 text-foreground">
                        <div className="font-medium">{item.numero_documento}</div>
                        <div className="text-xs text-app-muted">{item.tipo_documento}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="font-medium text-foreground">{fullName}</div>
                        <div className="text-xs text-app-muted">{item.correo_electronico}</div>
                      </td>
                      <td className="py-3 pr-4 text-foreground/90">
                        {getProgName(item.id_programa)}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-1 text-xs font-medium",
                            item.estado === "ACTIVO"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-zinc-100 text-zinc-700 border border-app-border",
                          ].join(" ")}
                        >
                          {item.estado === "ACTIVO" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="inline-flex flex-wrap justify-end gap-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setEditing(item);
                              setOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleActivo(item)}
                          >
                            {item.estado === "ACTIVO" ? "Desactivar" : "Activar"}
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setDeleteTarget(item)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td className="py-6 text-sm text-app-muted" colSpan={5}>
                      No hay estudiantes para mostrar.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open ? (
        <EstudianteFormModal
          title={editing ? "Editar estudiante" : "Nuevo estudiante"}
          initial={editing}
          programas={programas}
          onClose={() => {
            setOpen(false);
            setEditing(null);
          }}
          onSave={save}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title="Eliminar estudiante"
          description={
            <span>
              ¿Seguro que quieres eliminar a{" "}
              <strong className="text-foreground">
                {deleteTarget.primer_nombre} {deleteTarget.primer_apellido}
              </strong>
              ? Esta acción borrará su historial académico en el sistema.
            </span>
          }
          confirmLabel="Sí, eliminar"
          onClose={() => setDeleteTarget(null)}
          onConfirm={() => removeEstudiante(deleteTarget)}
        />
      ) : null}
    </div>
  );
}

function EstudianteFormModal({ title, initial, programas, onClose, onSave }) {
  const [formData, setFormData] = useState({
    tipo_documento: initial?.tipo_documento ?? "CC",
    numero_documento: initial?.numero_documento ?? "",
    primer_nombre: initial?.primer_nombre ?? "",
    segundo_nombre: initial?.segundo_nombre ?? "",
    primer_apellido: initial?.primer_apellido ?? "",
    segundo_apellido: initial?.segundo_apellido ?? "",
    correo_electronico: initial?.correo_electronico ?? "",
    telefono_celular: initial?.telefono_celular ?? "",
    direccion: initial?.direccion ?? "",
    id_programa: initial?.id_programa ?? "",
    fecha_ingreso: initial?.fecha_ingreso ?? new Date().toISOString().split("T")[0],
    estado: initial?.estado ?? "ACTIVO",
  });

  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    try {
      await onSave(formData);
    } catch (err) {
      setError(err?.message ?? "No se pudo guardar.");
      setStatus("idle");
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Modal
      title={title}
      hint="Completa la ficha técnica del estudiante."
      onClose={onClose}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Tipo Doc.</label>
            <select
              name="tipo_documento"
              value={formData.tipo_documento}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="PAS">Pasaporte</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Número Documento</label>
            <input
              name="numero_documento"
              value={formData.numero_documento}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 1001002003"
              required
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Primer Nombre</label>
            <input
              name="primer_nombre"
              value={formData.primer_nombre}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: Juan"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Segundo Nombre</label>
            <input
              name="segundo_nombre"
              value={formData.segundo_nombre}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: Carlos"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Primer Apellido</label>
            <input
              name="primer_apellido"
              value={formData.primer_apellido}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: Pérez"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Segundo Apellido</label>
            <input
              name="segundo_apellido"
              value={formData.segundo_apellido}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: García"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Correo Electrónico</label>
            <input
              type="email"
              name="correo_electronico"
              value={formData.correo_electronico}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="juan.perez@ejemplo.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Teléfono</label>
            <input
              name="telefono_celular"
              value={formData.telefono_celular}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground placeholder:text-app-muted/70 outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              placeholder="Ej: 3001234567"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Programa</label>
            <select
              name="id_programa"
              value={formData.id_programa}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
              required
            >
              <option value="">Selecciona un programa...</option>
              {programas.map((p) => (
                <option key={p.id_programa} value={p.id_programa}>
                  {p.nombre_programa}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">Fecha Ingreso</label>
            <input
              type="date"
              name="fecha_ingreso"
              value={formData.fecha_ingreso}
              onChange={handleChange}
              className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-app-accent focus:ring-2 focus:ring-app-accent/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-foreground">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="rounded-lg border border-app-border bg-app-surface px-2 py-1 text-sm outline-none focus:border-app-accent"
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>

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


