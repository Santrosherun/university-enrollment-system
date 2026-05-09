# 🚀 API Endpoints - UniEnroll System

Este documento describe todas las rutas que el Frontend en Next.js espera consumir. Al construir el Backend definitivo (por ejemplo, en FastAPI), deberás implementar estos endpoints respetando los métodos HTTP indicados.

---

## 🔐 Autenticación y Seguridad
- `POST /api/auth/login`
  - **Body:** `{ username, password }`
  - **Uso:** Valida las credenciales y devuelve el token de sesión y datos del usuario (id, nombre, rol).
- `POST /api/auth/logout`
  - **Uso:** Destruye la sesión actual.

## 👥 Gestión de Usuarios
- `GET /api/usuarios`
  - **Uso:** Retorna la lista de usuarios del sistema con sus roles.
- `POST /api/usuarios`
  - **Body:** `{ nombre, email, password, rol }`
  - **Uso:** Crea una nueva Persona y la enlaza a un nuevo Usuario.
- `PUT /api/usuarios/[id]`
  - **Body:** `{ nombre, email, rol }`
  - **Uso:** Actualiza la información y el rol de un usuario existente.

## 🎓 Configuración Académica
- `GET /api/programas`
  - **Uso:** Retorna la lista de Programas Académicos.
- `GET /api/periodos`
  - **Uso:** Retorna la lista de Periodos Académicos.
- `GET /api/asignaturas`
  - **Uso:** Retorna el catálogo completo de Asignaturas.
- `POST /api/asignaturas`
  - **Body:** `{ codigo_asignatura, nombre_asignatura, tipo_asignatura, creditos, estado }`
  - **Uso:** Crea una nueva asignatura.
- `GET /api/asignaturas/[id]`
  - **Uso:** Obtiene el detalle de una asignatura específica.
- `PUT /api/asignaturas/[id]`
  - **Body:** Datos a actualizar.
  - **Uso:** Modifica una asignatura.
- `DELETE /api/asignaturas/[id]`
  - **Uso:** Elimina (o inactiva) una asignatura.

## 📚 Planes de Estudio
- `GET /api/planes?id_programa={id}`
  - **Uso:** Retorna las asignaturas asociadas a un programa específico (incluyendo créditos desde la tabla de asignatura).
- `POST /api/planes`
  - **Body:** `{ id_programa, id_asignatura, semestre, es_obligatoria }`
  - **Uso:** Asocia una asignatura a un programa académico.
- `PUT /api/planes`
  - **Body:** `{ id_programa, id_asignatura, semestre, es_obligatoria }`
  - **Uso:** Edita las condiciones de una asignatura dentro de un plan (la clave primaria es compuesta).

## 🧑‍🎓 Estudiantes y Cuentas
- `GET /api/estudiantes`
  - **Uso:** Retorna la lista de estudiantes matriculados.
- `GET /api/estudiantes/[id]`
  - **Uso:** Retorna la información de un estudiante en particular.
- `GET /api/estudiantes/[id]/cuenta-corriente`
  - **Uso:** Retorna el historial financiero del estudiante (volantes, movimientos de cobro y pagos, saldo total).

## ⚙️ Reglas y Conceptos de Cobro
- `GET /api/codigos-detalle`
  - **Uso:** Retorna los conceptos financieros (Cobros, Pagos, Descuentos).
- `POST /api/codigos-detalle`
  - **Body:** `{ nombre_codigo, tipo_codigo, prioridad_pago, estado_codigo }`
  - **Uso:** Crea un nuevo concepto.
- `GET /api/reglas-cobro?periodo={id}&programaId={id}`
  - **Uso:** Retorna las reglas de tarifación (Global o Por Créditos).
- `POST /api/reglas-cobro`
  - **Body:** `{ id_periodo, id_programa, modalidad_cobro, valor_global, valor_credito, estado }`
  - **Uso:** Establece una nueva regla de cobro.

## 💰 Facturación (Volantes)
- `POST /api/cobros`
  - **Body:** `{ id_estudiante, id_periodo }`
  - **Uso:** Genera un volante de matrícula individual para un estudiante basándose en su plan y la regla de cobro vigente.
- `POST /api/cobros/generate-mass`
  - **Body:** `{ id_periodo, id_programa }`
  - **Uso:** Generación masiva de volantes para todos los estudiantes de un programa.
- `GET /api/cobros/[id]`
  - **Uso:** Obtiene el detalle de un volante específico (para impresión o consulta).
- `DELETE /api/cobros/[id]`
  - **Uso:** Anula un volante generado por error (siempre que no tenga pagos aplicados).

## 💳 Pagos y Recaudos
- `POST /api/recaudos`
  - **Body:** `{ id_volante_matricula, valor_pagado, referencia_pago, canal_pago, id_codigo_detalle }`
  - **Uso:** Registra un ingreso de dinero o la aplicación de un descuento a un volante específico. Afecta directamente la cuenta corriente.

## 📊 Reportes y Vistas
- `GET /api/reportes/financieros?periodo={id}`
  - **Uso:** Retorna los indicadores consolidados. La respuesta está estructurada para alinearse con 3 vistas SQL del backend:
    - `vista_facturacion`: Totales brutos, descuentos, neto y desglose por programa.
    - `vista_ingreso_real`: Dinero efectivamente recaudado y efectividad.
    - `vista_cartera`: Total pendiente por cobrar.

---
*Nota: Si se implementa un backend con FastAPI, se recomienda usar el prefijo `/api` para todas las rutas y asegurar que las respuestas JSON mantengan la misma estructura de llaves (en `snake_case` o `camelCase` según se definió) que espera el frontend actual.*
