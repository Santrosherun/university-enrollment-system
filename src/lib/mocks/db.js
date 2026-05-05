function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// NOTE: In-memory mock DB. In dev, hot-reload may reset data.
// This is enough to build screens while backend is not ready.
const defaultState = {
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
  codigosDetalle: [
    {
      id: "cd_001",
      codigo: "MAT-ORD",
      nombre: "Matrícula Ordinaria",
      tipo: "COBRO",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cd_002",
      codigo: "SEG-EST",
      nombre: "Seguro Estudiantil",
      tipo: "COBRO",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "cd_003",
      codigo: "REC-CAJA",
      nombre: "Recaudo Caja",
      tipo: "PAGO",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  reglasCobro: [
    {
      id: "rc_001",
      periodo: "2024-1",
      programaId: "prog_001",
      codigoDetalleId: "cd_001",
      valor: 4500000,
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "rc_002",
      periodo: "2024-1",
      programaId: "prog_001",
      codigoDetalleId: "cd_002",
      valor: 85000,
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  estudiantes: [
    {
      id: "est_001",
      tipoDocumento: "CC",
      numeroDocumento: "1001002003",
      nombreCompleto: "Juan Pérez García",
      correo: "juan.perez@universidad.edu.co",
      telefono: "3001234567",
      programaId: "prog_001",
      periodoIngreso: "2024-1",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "est_002",
      tipoDocumento: "CC",
      numeroDocumento: "1002003004",
      nombreCompleto: "María López Ruíz",
      correo: "maria.lopez@universidad.edu.co",
      telefono: "3119876543",
      programaId: "prog_002",
      periodoIngreso: "2024-1",
      activo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  cobros: [
    {
      id: "cb_001",
      estudianteId: "est_001",
      periodo: "2024-1",
      items: [
        { codigoDetalleId: "cd_001", valor: 4500000 },
        { codigoDetalleId: "cd_002", valor: 85000 },
      ],
      total: 4585000,
      estado: "PENDIENTE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

const state = globalThis.__uesMockDb ?? defaultState;

// Asegurar que todas las propiedades existan si vienen de una versión anterior
for (const key in defaultState) {
  if (state[key] === undefined) {
    state[key] = clone(defaultState[key]);
  }
}

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

  listCodigosDetalle({ tipo } = {}) {
    const list = state.codigosDetalle;
    const filtered = tipo ? list.filter((c) => c.tipo === tipo) : list;
    return clone(filtered);
  },
  getCodigoDetalle(id) {
    return clone(state.codigosDetalle.find((c) => c.id === id) ?? null);
  },
  createCodigoDetalle(input) {
    const now = new Date().toISOString();
    const record = {
      id: makeId("cd"),
      codigo: String(input.codigo ?? "").trim().toUpperCase(),
      nombre: String(input.nombre ?? "").trim(),
      tipo: String(input.tipo ?? "COBRO").trim().toUpperCase(),
      activo: Boolean(input.activo ?? true),
      createdAt: now,
      updatedAt: now,
    };
    state.codigosDetalle.unshift(record);
    return clone(record);
  },
  updateCodigoDetalle(id, patch) {
    const idx = state.codigosDetalle.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const prev = state.codigosDetalle[idx];
    const next = {
      ...prev,
      codigo:
        patch.codigo !== undefined
          ? String(patch.codigo).trim().toUpperCase()
          : prev.codigo,
      nombre: patch.nombre !== undefined ? String(patch.nombre).trim() : prev.nombre,
      tipo:
        patch.tipo !== undefined
          ? String(patch.tipo).trim().toUpperCase()
          : prev.tipo,
      activo: patch.activo !== undefined ? Boolean(patch.activo) : prev.activo,
      updatedAt: now,
    };
    state.codigosDetalle[idx] = next;
    return clone(next);
  },
  deleteCodigoDetalle(id) {
    const idx = state.codigosDetalle.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    state.codigosDetalle.splice(idx, 1);
    return true;
  },

  listReglasCobro({ periodo, programaId, codigoDetalleId } = {}) {
    let list = state.reglasCobro;
    if (periodo) list = list.filter((r) => r.periodo === periodo);
    if (programaId) list = list.filter((r) => r.programaId === programaId);
    if (codigoDetalleId) list = list.filter((r) => r.codigoDetalleId === codigoDetalleId);
    return clone(list);
  },
  getReglaCobro(id) {
    return clone(state.reglasCobro.find((r) => r.id === id) ?? null);
  },
  createReglaCobro(input) {
    const now = new Date().toISOString();
    const record = {
      id: makeId("rc"),
      periodo: String(input.periodo ?? "").trim(),
      programaId: String(input.programaId ?? "").trim(),
      codigoDetalleId: String(input.codigoDetalleId ?? "").trim(),
      valor: Number(input.valor ?? 0),
      activo: Boolean(input.activo ?? true),
      createdAt: now,
      updatedAt: now,
    };
    state.reglasCobro.unshift(record);
    return clone(record);
  },
  updateReglaCobro(id, patch) {
    const idx = state.reglasCobro.findIndex((r) => r.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const prev = state.reglasCobro[idx];
    const next = {
      ...prev,
      periodo: patch.periodo !== undefined ? String(patch.periodo).trim() : prev.periodo,
      programaId:
        patch.programaId !== undefined ? String(patch.programaId).trim() : prev.programaId,
      codigoDetalleId:
        patch.codigoDetalleId !== undefined
          ? String(patch.codigoDetalleId).trim()
          : prev.codigoDetalleId,
      valor: patch.valor !== undefined ? Number(patch.valor) : prev.valor,
      activo: patch.activo !== undefined ? Boolean(patch.activo) : prev.activo,
      updatedAt: now,
    };
    state.reglasCobro[idx] = next;
    return clone(next);
  },
  deleteReglaCobro(id) {
    const idx = state.reglasCobro.findIndex((r) => r.id === id);
    if (idx === -1) return false;
    state.reglasCobro.splice(idx, 1);
    return true;
  },

  listEstudiantes({ programaId } = {}) {
    let list = state.estudiantes;
    if (programaId) list = list.filter((e) => e.programaId === programaId);
    return clone(list);
  },
  getEstudiante(id) {
    return clone(state.estudiantes.find((e) => e.id === id) ?? null);
  },
  createEstudiante(input) {
    const now = new Date().toISOString();
    const record = {
      id: makeId("est"),
      tipoDocumento: String(input.tipoDocumento ?? "CC").trim().toUpperCase(),
      numeroDocumento: String(input.numeroDocumento ?? "").trim(),
      nombreCompleto: String(input.nombreCompleto ?? "").trim(),
      correo: String(input.correo ?? "").trim().toLowerCase(),
      telefono: String(input.telefono ?? "").trim(),
      programaId: String(input.programaId ?? "").trim(),
      periodoIngreso: String(input.periodoIngreso ?? "").trim(),
      activo: Boolean(input.activo ?? true),
      createdAt: now,
      updatedAt: now,
    };
    state.estudiantes.unshift(record);
    return clone(record);
  },
  updateEstudiante(id, patch) {
    const idx = state.estudiantes.findIndex((e) => e.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    const prev = state.estudiantes[idx];
    const next = {
      ...prev,
      tipoDocumento: patch.tipoDocumento !== undefined ? String(patch.tipoDocumento).trim().toUpperCase() : prev.tipoDocumento,
      numeroDocumento: patch.numeroDocumento !== undefined ? String(patch.numeroDocumento).trim() : prev.numeroDocumento,
      nombreCompleto: patch.nombreCompleto !== undefined ? String(patch.nombreCompleto).trim() : prev.nombreCompleto,
      correo: patch.correo !== undefined ? String(patch.correo).trim().toLowerCase() : prev.correo,
      telefono: patch.telefono !== undefined ? String(patch.telefono).trim() : prev.telefono,
      programaId: patch.programaId !== undefined ? String(patch.programaId).trim() : prev.programaId,
      periodoIngreso: patch.periodoIngreso !== undefined ? String(patch.periodoIngreso).trim() : prev.periodoIngreso,
      activo: patch.activo !== undefined ? Boolean(patch.activo) : prev.activo,
      updatedAt: now,
    };
    state.estudiantes[idx] = next;
    return clone(next);
  },
  deleteEstudiante(id) {
    const idx = state.estudiantes.findIndex((e) => e.id === id);
    if (idx === -1) return false;
    state.estudiantes.splice(idx, 1);
    return true;
  },

  listCobros({ estudianteId, periodo, estado } = {}) {
    let list = state.cobros;
    if (estudianteId) list = list.filter((c) => c.estudianteId === estudianteId);
    if (periodo) list = list.filter((c) => c.periodo === periodo);
    if (estado) list = list.filter((c) => c.estado === estado);
    return clone(list);
  },
  getCobro(id) {
    return clone(state.cobros.find((c) => c.id === id) ?? null);
  },
  /** Genera un cobro para un estudiante basado en las reglas del periodo. */
  generateCobro(estudianteId, periodo) {
    const estudiante = state.estudiantes.find((e) => e.id === estudianteId);
    if (!estudiante) throw new Error("Estudiante no encontrado.");

    // Buscar reglas para el programa del estudiante y el periodo
    const reglas = state.reglasCobro.filter(
      (r) => r.programaId === estudiante.programaId && r.periodo === periodo && r.activo,
    );

    if (reglas.length === 0) {
      throw new Error(`No hay reglas de cobro configuradas para el programa ${estudiante.programaId} en el periodo ${periodo}.`);
    }

    // Verificar si ya existe un cobro pendiente o pagado para este periodo
    const existe = state.cobros.find(
      (c) => c.estudianteId === estudianteId && c.periodo === periodo && c.estado !== "ANULADO",
    );
    if (existe) {
      throw new Error(`El estudiante ya tiene un cobro generado para el periodo ${periodo}.`);
    }

    const now = new Date().toISOString();
    const items = reglas.map((r) => ({
      codigoDetalleId: r.codigoDetalleId,
      valor: r.valor,
    }));
    const total = items.reduce((acc, curr) => acc + curr.valor, 0);

    const record = {
      id: makeId("cb"),
      estudianteId,
      periodo,
      items,
      total,
      estado: "PENDIENTE",
      createdAt: now,
      updatedAt: now,
    };

    state.cobros.unshift(record);
    return clone(record);
  },
  /** Generación masiva por programa y periodo. */
  generateCobrosMasivos(programaId, periodo) {
    const estudiantes = state.estudiantes.filter(
      (e) => e.programaId === programaId && e.activo,
    );
    let count = 0;
    const errors = [];

    estudiantes.forEach((e) => {
      try {
        this.generateCobro(e.id, periodo);
        count++;
      } catch (err) {
        errors.push({ estudiante: e.nombreCompleto, error: err.message });
      }
    });

    return { count, errors };
  },
  deleteCobro(id) {
    const idx = state.cobros.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    // En un sistema real, no se borran cobros, se anulan.
    // Para el mock, permitimos borrar.
    state.cobros.splice(idx, 1);
    return true;
  },
};

