function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// NOTE: In-memory mock DB. In dev, hot-reload may reset data.
// This is enough to build screens while backend is not ready.
const state = globalThis.__uesMockDb ?? {
  programas: [
    {
      id: "prog_001",
      codigo: "ADM",
      nombre: "Administración de Empresas",
      modalidad: "PRESENCIAL",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "prog_002",
      codigo: "ING-SIS",
      nombre: "Ingeniería de Sistemas",
      modalidad: "VIRTUAL",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  planes: [
    {
      id: "plan_001",
      programaId: "prog_001",
      codigo: "ADM-2024",
      nombre: "Plan 2024",
      version: "2024",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

globalThis.__uesMockDb = state;

export const MockDb = {
  listProgramas() {
    return clone(state.programas);
  },
  getPrograma(id) {
    return clone(state.programas.find((p) => p.id === id) ?? null);
  },
  createPrograma(input) {
    const now = new Date().toISOString();
    const record = {
      id: makeId("prog"),
      codigo: String(input.codigo ?? "").trim().toUpperCase(),
      nombre: String(input.nombre ?? "").trim(),
      modalidad: String(input.modalidad ?? "PRESENCIAL").trim().toUpperCase(),
      activo: Boolean(input.activo ?? true),
      createdAt: now,
      updatedAt: now,
    };
    state.programas.unshift(record);
    return clone(record);
  },
  updatePrograma(id, patch) {
    const idx = state.programas.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const prev = state.programas[idx];
    const next = {
      ...prev,
      codigo:
        patch.codigo !== undefined
          ? String(patch.codigo).trim().toUpperCase()
          : prev.codigo,
      nombre: patch.nombre !== undefined ? String(patch.nombre).trim() : prev.nombre,
      modalidad:
        patch.modalidad !== undefined
          ? String(patch.modalidad).trim().toUpperCase()
          : prev.modalidad,
      activo: patch.activo !== undefined ? Boolean(patch.activo) : prev.activo,
      updatedAt: now,
    };
    state.programas[idx] = next;
    return clone(next);
  },
  /** Elimina el programa y todos los planes asociados (mock). */
  deletePrograma(id) {
    const idx = state.programas.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    state.programas.splice(idx, 1);
    state.planes = state.planes.filter((p) => p.programaId !== id);
    return true;
  },

  listPlanes({ programaId } = {}) {
    const list = state.planes;
    const filtered = programaId ? list.filter((p) => p.programaId === programaId) : list;
    return clone(filtered);
  },
  getPlan(id) {
    return clone(state.planes.find((p) => p.id === id) ?? null);
  },
  createPlan(input) {
    const now = new Date().toISOString();
    const record = {
      id: makeId("plan"),
      programaId: String(input.programaId ?? "").trim(),
      codigo: String(input.codigo ?? "").trim().toUpperCase(),
      nombre: String(input.nombre ?? "").trim(),
      version: String(input.version ?? "").trim(),
      activo: Boolean(input.activo ?? true),
      createdAt: now,
      updatedAt: now,
    };
    state.planes.unshift(record);
    return clone(record);
  },
  updatePlan(id, patch) {
    const idx = state.planes.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const prev = state.planes[idx];
    const next = {
      ...prev,
      programaId:
        patch.programaId !== undefined ? String(patch.programaId).trim() : prev.programaId,
      codigo:
        patch.codigo !== undefined
          ? String(patch.codigo).trim().toUpperCase()
          : prev.codigo,
      nombre: patch.nombre !== undefined ? String(patch.nombre).trim() : prev.nombre,
      version: patch.version !== undefined ? String(patch.version).trim() : prev.version,
      activo: patch.activo !== undefined ? Boolean(patch.activo) : prev.activo,
      updatedAt: now,
    };
    state.planes[idx] = next;
    return clone(next);
  },
};

