function makeId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

// NOTE: In-memory mock DB mirroring the PostgreSQL DDL 2026-10
const defaultState = {
  usuario: [
    { 
      id_usuario: "user_001", username: "admin@ues.edu.co", password_hash: "admin123", 
      id_persona: "per_001", id_rol: "1", estado: "ACTIVO", correo_notificacion: "admin@ues.edu.co",
      fecha_creacion: new Date().toISOString()
    }
  ],
  rol: [
    { id_rol: "1", nombre_rol: "ADMIN", descripcion: "Acceso total", es_especial: true },
    { id_rol: "2", nombre_rol: "SUPERVISOR", descripcion: "Gestión académica", es_especial: false },
    { id_rol: "3", nombre_rol: "ASISTENTE", descripcion: "Caja y Atención", es_especial: false }
  ],
  persona: [
    { 
      id_persona: "per_001", tipo_documento: "CC", numero_documento: "123456", 
      primer_nombre: "Admin", segundo_nombre: null, primer_apellido: "Sistemas", segundo_apellido: null,
      correo_personal: "admin@personal.com", telefono_contacto: "555-0101", perfil_tecnico: true, estado: "ACTIVO" 
    }
  ],
  periodo_academico: [
    { id_periodo: "2024-1", codigo_periodo: "2024-1", numero_periodo: 1, anio: 2024, fecha_inicio: "2024-02-01", fecha_fin: "2024-06-30", estado: "ACTIVO" }
  ],
  programa_academico: [
    { id_programa: "prog_001", codigo_programa: "ADM", nombre_programa: "Administración de Empresas", duracion_semestres: 10, modalidad_programa: "PRESENCIAL", nivel_formacion: "PREGRADO", estado: "ACTIVO" },
    { id_programa: "prog_002", codigo_programa: "ING-SIS", nombre_programa: "Ingeniería de Sistemas", duracion_semestres: 10, modalidad_programa: "VIRTUAL", nivel_formacion: "PREGRADO", estado: "ACTIVO" },
  ],
  estudiante: [
    {
      id_estudiante: "est_001", tipo_documento: "CC", numero_documento: "1001002003",
      primer_nombre: "Juan", segundo_nombre: null, primer_apellido: "Pérez", segundo_apellido: "García",
      correo_electronico: "juan.perez@universidad.edu.co", telefono_celular: "3001234567",
      id_programa: "prog_001", fecha_ingreso: "2024-01-15", direccion: "Calle 123", estado: "ACTIVO"
    }
  ],
  plan_estudio: [
    { id_programa: "prog_001", id_asignatura: "asig_001", semestre: 1, es_obligatoria: true },
    { id_programa: "prog_001", id_asignatura: "asig_002", semestre: 1, es_obligatoria: true },
  ],
  asignatura: [
    { id_asignatura: "asig_001", codigo_asignatura: "MAT-1", nombre_asignatura: "Matemáticas I", tipo_asignatura: "OBLIGATORIA", creditos: 3, estado: "ACTIVA" },
    { id_asignatura: "asig_002", codigo_asignatura: "ADM-1", nombre_asignatura: "Introducción a la Admin", tipo_asignatura: "OBLIGATORIA", creditos: 2, estado: "ACTIVA" },
  ],
  codigo_detalle: [
    { id_codigo_detalle: "cd_001", nombre_codigo: "Matrícula Ordinaria", tipo_codigo: "COBRO", prioridad_pago: 1, estado_codigo: "ACTIVO" },
    { id_codigo_detalle: "cd_002", nombre_codigo: "Seguro Estudiantil", tipo_codigo: "COBRO", prioridad_pago: 2, estado_codigo: "ACTIVO" },
    { id_codigo_detalle: "cd_003", nombre_codigo: "Pago Matrícula", tipo_codigo: "PAGO", prioridad_pago: 0, estado_codigo: "ACTIVO" },
    { id_codigo_detalle: "cd_004", nombre_codigo: "Descuento Académico", tipo_codigo: "PAGO", prioridad_pago: 0, estado_codigo: "ACTIVO" },
  ],
  regla_cobro: [
    { modalidad_cobro: "GLOBAL", id_periodo: "2024-1", id_programa: "prog_001", valor_global: 4500000, valor_credito: null, estado: "ACTIVA" }
  ],
  cuenta_corriente: [],
  volante_matricula: [],
  detalle_volante: [],
  pago: [],
  movimiento: []
};

const state = globalThis.__uesMockDb ?? defaultState;
globalThis.__uesMockDb = state;

export const MockDb = {
  getState() { return state; },

  login(username, password) {
    const user = state.usuario.find(u => u.username === username && u.password_hash === password);
    if (!user) return null;
    const persona = state.persona.find(p => p.id_persona === user.id_persona);
    const rol = state.rol.find(r => r.id_rol === user.id_rol);
    return {
      user: {
        id: user.id_usuario,
        nombre: persona ? `${persona.primer_nombre} ${persona.primer_apellido || ""}`.trim() : "Usuario",
        username: user.username,
        rol: rol?.nombre_rol || "ASISTENTE"
      },
      token: `mock_jwt_${user.id_usuario}`
    };
  },

  listUsuarios() {
    return state.usuario.map(u => {
      const persona = state.persona.find(p => p.id_persona === u.id_persona);
      const rol = state.rol.find(r => r.id_rol === u.id_rol);
      return {
        id: u.id_usuario,
        nombre: persona ? `${persona.primer_nombre} ${persona.primer_apellido || ""}`.trim() : "Usuario",
        email: u.username,
        rol: rol ? rol.nombre_rol : "ASISTENTE"
      };
    });
  },

  createUser(data) {
    const id_persona = makeId("per");
    const parts = (data.nombre || "Usuario Nuevo").trim().split(" ");
    const primer_nombre = parts[0];
    const primer_apellido = parts.slice(1).join(" ") || "";
    
    state.persona.push({
      id_persona,
      primer_nombre,
      primer_apellido,
      correo_personal: data.email,
      estado: "ACTIVO"
    });

    let id_rol = "3";
    if (data.rol === "ADMIN") id_rol = "1";
    if (data.rol === "SUPERVISOR") id_rol = "2";

    const record = {
      id_usuario: makeId("user"),
      username: data.email,
      password_hash: data.password || "123456",
      id_persona,
      id_rol,
      estado: "ACTIVO"
    };
    state.usuario.push(record);
    return this.listUsuarios().find(u => u.id === record.id_usuario);
  },

  updateUser(id, data) {
    const user = state.usuario.find(u => u.id_usuario === id);
    if (!user) return null;
    
    let id_rol = "3";
    if (data.rol === "ADMIN") id_rol = "1";
    if (data.rol === "SUPERVISOR") id_rol = "2";
    user.id_rol = id_rol;
    user.username = data.email;

    const persona = state.persona.find(p => p.id_persona === user.id_persona);
    if (persona) {
      const parts = (data.nombre || "").trim().split(" ");
      persona.primer_nombre = parts[0] || persona.primer_nombre;
      persona.primer_apellido = parts.slice(1).join(" ") || persona.primer_apellido;
      persona.correo_personal = data.email;
    }

    return this.listUsuarios().find(u => u.id === id);
  },

  listProgramas() { return clone(state.programa_academico); },
  listPeriodos() { return clone(state.periodo_academico); },
  getPrograma(id) {
    const item = state.programa_academico.find(p => p.id_programa === id);
    return item ? clone(item) : null;
  },

  createPrograma(input) {
    const record = {
      id_programa: makeId("prog"),
      codigo_programa: String(input.codigo_programa ?? "").trim().toUpperCase(),
      nombre_programa: String(input.nombre_programa ?? "").trim(),
      duracion_semestres: Number(input.duracion_semestres ?? 10),
      modalidad_programa: String(input.modalidad_programa ?? "PRESENCIAL").trim().toUpperCase(),
      nivel_formacion: String(input.nivel_formacion ?? "PREGRADO").trim().toUpperCase(),
      estado: String(input.estado ?? "ACTIVO").trim().toUpperCase()
    };
    state.programa_academico.push(record);
    return clone(record);
  },

  updatePrograma(id, patch) {
    const idx = state.programa_academico.findIndex(p => p.id_programa === id);
    if (idx === -1) return null;
    state.programa_academico[idx] = { ...state.programa_academico[idx], ...patch };
    return clone(state.programa_academico[idx]);
  },

  deletePrograma(id) {
    const idx = state.programa_academico.findIndex(p => p.id_programa === id);
    if (idx === -1) return false;
    state.programa_academico.splice(idx, 1);
    return true;
  },

  listEstudiantes() { 
    return state.estudiante.map(e => {
      const prog = state.programa_academico.find(p => p.id_programa === e.id_programa);
      return { ...clone(e), programa_nombre: prog?.nombre_programa };
    });
  },

  getEstudiante(id) {
    return clone(state.estudiante.find(e => e.id_estudiante === id));
  },

  createEstudiante(input) {
    const record = {
      ...input,
      id_estudiante: makeId("est"),
      fecha_ingreso: input.fecha_ingreso || new Date().toISOString(),
      estado: input.estado || "ACTIVO"
    };
    state.estudiante.push(record);
    return clone(record);
  },

  updateEstudiante(id, data) {
    const idx = state.estudiante.findIndex(e => e.id_estudiante === id);
    if (idx === -1) return null;
    state.estudiante[idx] = { ...state.estudiante[idx], ...data };
    return clone(state.estudiante[idx]);
  },

  deleteEstudiante(id) {
    const idx = state.estudiante.findIndex(e => e.id_estudiante === id);
    if (idx === -1) return false;
    state.estudiante.splice(idx, 1);
    return true;
  },

  createCodigoDetalle(input) {
    const record = {
      id_codigo_detalle: makeId("cd"),
      nombre_codigo: input.nombre_codigo,
      tipo_codigo: input.tipo_codigo,
      prioridad_pago: Number(input.prioridad_pago || 0),
      estado_codigo: input.estado_codigo || "ACTIVO"
    };
    state.codigo_detalle.push(record);
    return clone(record);
  },

  listCodigosDetalle() { return clone(state.codigo_detalle); },

  listAsignaturas() { return clone(state.asignatura); },

  createAsignatura(input) {
    const record = {
      id_asignatura: makeId("asig"),
      codigo_asignatura: String(input.codigo_asignatura ?? "").trim().toUpperCase(),
      nombre_asignatura: String(input.nombre_asignatura ?? "").trim(),
      tipo_asignatura: String(input.tipo_asignatura ?? "OBLIGATORIA").toUpperCase(),
      creditos: Number(input.creditos ?? 3),
      estado: String(input.estado ?? "ACTIVA").toUpperCase()
    };
    state.asignatura.push(record);
    return clone(record);
  },

  getAsignatura(id) {
    return clone(state.asignatura.find(a => a.id_asignatura === id));
  },

  updateAsignatura(id, data) {
    const idx = state.asignatura.findIndex(a => a.id_asignatura === id);
    if (idx === -1) return null;
    const cleanData = { ...data };
    if (cleanData.creditos !== undefined) cleanData.creditos = Number(cleanData.creditos);
    state.asignatura[idx] = { ...state.asignatura[idx], ...cleanData };
    return clone(state.asignatura[idx]);
  },

  deleteAsignatura(id) {
    const idx = state.asignatura.findIndex(a => a.id_asignatura === id);
    if (idx === -1) return false;
    state.asignatura.splice(idx, 1);
    return true;
  },

  listPlanes({ id_programa } = {}) {
    let list = state.plan_estudio;
    if (id_programa) list = list.filter(p => p.id_programa === id_programa);
    return list.map(p => {
      const asig = state.asignatura.find(a => a.id_asignatura === p.id_asignatura);
      return {
        ...clone(p),
        asignatura_nombre: asig?.nombre_asignatura,
        asignatura_codigo: asig?.codigo_asignatura,
        creditos: asig?.creditos
      };
    });
  },

  createPlanEstudio(input) {
    const record = { 
      id_programa: input.id_programa,
      id_asignatura: input.id_asignatura,
      semestre: Number(input.semestre),
      es_obligatoria: Boolean(input.es_obligatoria)
    };
    state.plan_estudio.push(record);
    return clone(record);
  },

  updatePlanEstudio(id_programa, id_asignatura, data) {
    const idx = state.plan_estudio.findIndex(p => p.id_programa === id_programa && p.id_asignatura === id_asignatura);
    if (idx === -1) return null;
    state.plan_estudio[idx] = { ...state.plan_estudio[idx], ...data };
    return clone(state.plan_estudio[idx]);
  },

  listReglasCobro({ periodo, programaId } = {}) {
    let list = state.regla_cobro;
    if (periodo) list = list.filter(r => r.id_periodo === periodo);
    if (programaId) list = list.filter(r => r.id_programa === programaId);
    return clone(list);
  },

  createReglaCobro(input) {
    const record = { ...input, estado: "ACTIVA" };
    state.regla_cobro.push(record);
    return clone(record);
  },

  listVolantes({ estudiante_id, periodo_id } = {}) {
    let list = state.volante_matricula;
    if (estudiante_id) list = list.filter(v => v.id_estudiante === estudiante_id);
    if (periodo_id) list = list.filter(v => v.id_periodo === periodo_id);
    
    return list.map(v => {
      const est = state.estudiante.find(e => e.id_estudiante === v.id_estudiante);
      const prog = state.programa_academico.find(p => p.id_programa === v.id_programa);
      const detalles = state.detalle_volante.filter(d => d.id_volante_matricula === v.id_volante);
      const total = detalles.reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.valor_unitario)), 0);
      return {
        ...clone(v),
        estudiante_nombre: `${est?.primer_nombre} ${est?.primer_apellido}`,
        programa_nombre: prog?.nombre_programa,
        total
      };
    });
  },

  generateVolante(data) {
    const { id_estudiante, id_periodo, modalidad_cobro, id_usuario, id_codigo_detalle, valor: manualValor } = data;
    const estudiante = state.estudiante.find(e => e.id_estudiante === id_estudiante);
    if (!estudiante) throw new Error("Estudiante no encontrado");

    let valor = manualValor;
    let codigo = id_codigo_detalle || "cd_001";

    if (valor === undefined) {
      const mod = modalidad_cobro || "GLOBAL";
      const regla = state.regla_cobro.find(r => 
        r.id_programa === estudiante.id_programa && 
        r.id_periodo === id_periodo && 
        r.modalidad_cobro === mod
      );
      if (!regla) {
        throw new Error(`No hay regla de cobro configurada para programa ${estudiante.id_programa}, periodo ${id_periodo} y modalidad ${mod}`);
      }
      
      if (mod === "GLOBAL") {
        valor = regla.valor_global;
      } else {
        if (!data.asignaturas || data.asignaturas.length === 0) {
           throw new Error("Debe seleccionar al menos una asignatura para el cobro por créditos.");
        }
        const creditosTotales = data.asignaturas.reduce((acc, asigId) => {
          const asig = state.asignatura.find(a => a.id_asignatura === asigId);
          return acc + (asig ? asig.creditos : 0);
        }, 0);
        valor = regla.valor_credito * creditosTotales;
      }
    }

    const id_volante = makeId("vol");
    const newVolante = {
      id_volante,
      numero_volante: `VOL-${Date.now()}`,
      fecha_generacion: new Date().toISOString(),
      semestre_a_cursar: 1,
      generacion_tipo: "INDIVIDUAL",
      estado: "GENERADO",
      modalidad_cobro: modalidad_cobro || "OTRO",
      id_usuario,
      id_periodo,
      id_estudiante,
      id_programa: estudiante.id_programa
    };

    state.volante_matricula.unshift(newVolante);

    let cuenta = state.cuenta_corriente.find(cc => cc.id_estudiante === id_estudiante && cc.id_periodo === id_periodo);
    if (!cuenta) {
      cuenta = {
        id_cuenta: makeId("acc"),
        fecha_apertura: new Date().toISOString(),
        estado: "ABIERTA",
        id_estudiante,
        id_periodo
      };
      state.cuenta_corriente.push(cuenta);
    }

    const detObj = state.codigo_detalle.find(cd => cd.id_codigo_detalle === codigo);
    const detalle = { id_codigo_detalle: codigo, id_volante_matricula: id_volante, cantidad: 1, valor_unitario: valor };
    state.detalle_volante.push(detalle);

    const lastSec = state.movimiento.filter(m => m.id_cuenta_corriente === cuenta.id_cuenta).length;
    state.movimiento.push({
      id_cuenta_corriente: cuenta.id_cuenta,
      numero_secuencia: lastSec + 1,
      id_codigo_detalle: codigo,
      id_origen: id_volante,
      tipo_origen: "VOLANTE",
      fecha_movimiento: new Date().toISOString(),
      descripcion_adicional: `${detObj?.nombre_codigo || "Cobro"} volante ${newVolante.numero_volante}`,
      valor
    });

    return clone(newVolante);
  },

  createPago(data) {
    const { id_volante_matricula, valor_pagado, referencia_pago, canal_pago, id_usuario, id_codigo_detalle } = data;
    const volante = state.volante_matricula.find(v => v.id_volante === id_volante_matricula);
    if (!volante) throw new Error("Volante no encontrado");

    const idPago = makeId("pago");
    const newPago = {
      id_pago: idPago,
      tipo_pago: "TOTAL",
      valor_pagado: Number(valor_pagado),
      fecha_pago: new Date().toISOString(),
      estado_pago: "APROBADO",
      referencia_pago,
      canal_pago,
      id_volante_matricula,
      id_usuario
    };

    state.pago.push(newPago);

    // Calcular si se pagó en su totalidad
    const detalles = state.detalle_volante.filter(d => d.id_volante_matricula === id_volante_matricula);
    const totalFacturado = detalles.reduce((acc, d) => acc + (Number(d.cantidad) * Number(d.valor_unitario)), 0);
    
    const pagosAplicados = state.pago.filter(p => p.id_volante_matricula === id_volante_matricula && p.estado_pago === "APROBADO");
    const totalPagado = pagosAplicados.reduce((acc, p) => acc + p.valor_pagado, 0);

    if (totalPagado >= totalFacturado) {
      volante.estado = "PAGADO";
      newPago.tipo_pago = "TOTAL";
    } else {
      volante.estado = "GENERADO";
      newPago.tipo_pago = "PARCIAL";
    }

    const cuenta = state.cuenta_corriente.find(cc => cc.id_estudiante === volante.id_estudiante && cc.id_periodo === volante.id_periodo);
    if (cuenta) {
      const lastSec = state.movimiento.filter(m => m.id_cuenta_corriente === cuenta.id_cuenta).length;
      const codigo = id_codigo_detalle || "cd_003";
      const detObj = state.codigo_detalle.find(cd => cd.id_codigo_detalle === codigo);
      state.movimiento.push({
        id_cuenta_corriente: cuenta.id_cuenta,
        numero_secuencia: lastSec + 1,
        id_codigo_detalle: codigo,
        id_origen: idPago,
        tipo_origen: "PAGO",
        fecha_movimiento: new Date().toISOString(),
        descripcion_adicional: `${detObj?.nombre_codigo || "Pago"} ref: ${referencia_pago} - canal: ${canal_pago}`,
        valor: valor_pagado
      });
    }

    return clone(newPago);
  },

  listPagos({ id_estudiante } = {}) {
    let list = state.pago;
    if (id_estudiante) {
      list = list.filter(p => {
        const v = state.volante_matricula.find(vol => vol.id_volante === p.id_volante_matricula);
        return v && v.id_estudiante === id_estudiante;
      });
    }
    return list.map(p => {
       const v = state.volante_matricula.find(vol => vol.id_volante === p.id_volante_matricula);
       return { ...clone(p), numero_volante: v?.numero_volante };
    });
  },

  getCuentaCorriente(estudiante_id, periodo_id) {
    let cuentas = state.cuenta_corriente.filter(cc => cc.id_estudiante === estudiante_id);
    if (periodo_id) {
      cuentas = cuentas.filter(cc => cc.id_periodo === periodo_id);
    }
    
    if (cuentas.length === 0) {
      return { movimientos: [], summary: { totalCargos: 0, totalAbonos: 0, balance: 0 } };
    }

    const cuentaIds = cuentas.map(c => c.id_cuenta);
    const movimientos = state.movimiento
      .filter(m => cuentaIds.includes(m.id_cuenta_corriente))
      .map(m => {
        const det = state.codigo_detalle.find(cd => cd.id_codigo_detalle === m.id_codigo_detalle);
        return { 
          ...clone(m), 
          id: `${m.id_cuenta_corriente}-${m.numero_secuencia}`,
          descripcion: m.descripcion_adicional || det?.nombre_codigo,
          tipo: det?.tipo_codigo, // COBRO or PAGO
          fecha: m.fecha_movimiento
        };
      })
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const totalCargos = movimientos.filter(m => m.tipo === "COBRO").reduce((acc, m) => acc + m.valor, 0);
    const totalAbonos = movimientos.filter(m => m.tipo === "PAGO").reduce((acc, m) => acc + m.valor, 0);

    return {
      movimientos,
      summary: { 
        totalCargos, 
        totalAbonos, 
        balance: totalCargos - totalAbonos 
      }
    };
  },

  getCobro(id) {
    const v = state.volante_matricula.find(vol => vol.id_volante === id);
    if (!v) return null;
    const est = state.estudiante.find(e => e.id_estudiante === v.id_estudiante);
    const det = state.detalle_volante.filter(d => d.id_volante_matricula === id);
    return {
      ...clone(v),
      estudiante_nombre: est ? `${est.primer_nombre} ${est.primer_apellido}` : "Desconocido",
      detalles: det.map(d => {
        const cd = state.codigo_detalle.find(c => c.id_codigo_detalle === d.id_codigo_detalle);
        return { ...clone(d), nombre_codigo: cd?.nombre_codigo };
      })
    };
  },

  deleteCobro(id) {
    const idx = state.volante_matricula.findIndex(v => v.id_volante === id);
    if (idx === -1) return false;
    state.volante_matricula.splice(idx, 1);
    state.movimiento = state.movimiento.filter(m => m.id_origen !== id || m.tipo_origen !== "VOLANTE");
    return true;
  },

  getReportesFinancieros(periodo_id) {
    let movimientos = state.movimiento.filter(m => m.tipo_origen === "VOLANTE");
    let pagos = state.pago.filter(p => p.estado_pago === "APROBADO");

    if (periodo_id) {
      movimientos = movimientos.filter(m => {
        const v = state.volante_matricula.find(vol => vol.id_volante === m.id_origen);
        return v && v.id_periodo === periodo_id;
      });
      pagos = pagos.filter(p => {
        const v = state.volante_matricula.find(vol => vol.id_volante === p.id_volante_matricula);
        return v && v.id_periodo === periodo_id;
      });
    }

    const totalFacturado = movimientos.reduce((acc, m) => acc + m.valor, 0);

    // Descuentos (conceptos como cd_004)
    const descuentosOtorgados = pagos.filter(p => {
       const m = state.movimiento.find(mov => mov.id_origen === p.id_pago && mov.tipo_origen === "PAGO");
       return m && m.id_codigo_detalle === "cd_004";
    }).reduce((acc, p) => acc + p.valor_pagado, 0);
    
    // Ingreso real en caja (todo lo que no sea descuento)
    const ingresosReales = pagos.filter(p => {
       const m = state.movimiento.find(mov => mov.id_origen === p.id_pago && mov.tipo_origen === "PAGO");
       return m && m.id_codigo_detalle !== "cd_004"; 
    }).reduce((acc, p) => acc + p.valor_pagado, 0);
    
    // Cartera viva: Facturado - (Pagado + Descontado)
    const carteraPendiente = totalFacturado - ingresosReales - descuentosOtorgados;
    
    // La efectividad mide cuánto de lo facturado ya está resuelto (sea por pago o descuento)
    const efectividad = totalFacturado > 0 ? ((ingresosReales + descuentosOtorgados) / totalFacturado) * 100 : 0;

    const por_programa = state.programa_academico.map(prog => {
      const facturadoProg = movimientos.filter(m => {
        const v = state.volante_matricula.find(vol => vol.id_volante === m.id_origen);
        return v && v.id_programa === prog.id_programa;
      }).reduce((acc, m) => acc + m.valor, 0);
      return { id: prog.id_programa, nombre: prog.nombre_programa, facturado: facturadoProg };
    }).sort((a, b) => b.facturado - a.facturado);

    // Estructura de salida equivalente a las futuras Vistas SQL
    return {
      vista_facturacion: {
         total_bruto: totalFacturado,
         descuentos: descuentosOtorgados,
         total_neto: totalFacturado - descuentosOtorgados,
         por_programa
      },
      vista_ingreso_real: {
         total_recaudado: ingresosReales,
         efectividad_porcentaje: efectividad
      },
      vista_cartera: {
         total_pendiente: carteraPendiente > 0 ? carteraPendiente : 0
      }
    };
  }
};
