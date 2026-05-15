from pydantic import BaseModel
from typing import Optional

# ------------------------------------------------------------------
# SCHEMAS PARA USUARIOS Y AUTENTICACIÓN
# ------------------------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str

class UsuarioBase(BaseModel):
    username: str
    correo_notificacion: str

class UsuarioCreate(UsuarioBase):
    password: str
    nombre_rol: str
    
    # Datos de la persona asociada
    tipo_documento: str
    numero_documento: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    correo_personal: str
    telefono_contacto: Optional[str] = None
    
    # Secreto opcional para crear el primer administrador
    admin_secret: Optional[str] = None

class UserUpdate(BaseModel):
    primer_nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    username: Optional[str] = None
    correo_personal: Optional[str] = None
    correo_notificacion: Optional[str] = None
    telefono_contacto: Optional[str] = None
    nombre_rol: Optional[str] = None
    estado: Optional[str] = None
    password: Optional[str] = None

class PasswordUpdate(BaseModel):
    new_password: str

class UsuarioOut(UsuarioBase):
    id_usuario: int
    estado: str
    id_rol: int
    nombre_rol: str
    tipo_documento: str
    numero_documento: str
    primer_nombre: str
    primer_apellido: str
    correo_personal: str
    telefono_contacto: Optional[str] = None
    allowed_routes: list[str] = []

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    user: UsuarioOut

# ------------------------------------------------------------------
# SCHEMAS PARA PROGRAMAS, ASIGNATURAS Y PLAN DE ESTUDIO
# ------------------------------------------------------------------

class ProgramaBase(BaseModel):
    codigo_programa: str
    nombre_programa: str
    duracion_semestres: int
    modalidad_programa: str
    nivel_formacion: str

class ProgramaCreate(ProgramaBase):
    pass

class ProgramaUpdate(BaseModel):
    nombre_programa: Optional[str] = None
    duracion_semestres: Optional[int] = None
    modalidad_programa: Optional[str] = None
    nivel_formacion: Optional[str] = None
    estado: Optional[str] = None

class ProgramaOut(ProgramaBase):
    id_programa: int
    estado: str

    class Config:
        from_attributes = True

class AsignaturaBase(BaseModel):
    codigo_asignatura: str
    nombre_asignatura: str
    tipo_asignatura: str
    creditos: int

class AsignaturaCreate(AsignaturaBase):
    pass

class AsignaturaUpdate(BaseModel):
    nombre_asignatura: Optional[str] = None
    tipo_asignatura: Optional[str] = None
    creditos: Optional[int] = None
    estado: Optional[str] = None

class AsignaturaOut(AsignaturaBase):
    id_asignatura: int
    estado: str

    class Config:
        from_attributes = True

class PlanEstudioCreate(BaseModel):
    id_asignatura: int
    semestre: int
    creditos_plan: int
    es_obligatoria: bool = True

class PlanEstudioOut(BaseModel):
    id_programa: int
    id_asignatura: int
    semestre: int
    creditos_plan: int
    es_obligatoria: bool
    asignatura: Optional[AsignaturaOut] = None

    class Config:
        from_attributes = True

# ------------------------------------------------------------------
# SCHEMAS RESTANTES (CÓDIGOS, PERIODOS, ESTUDIANTES, REGLAS)
# ------------------------------------------------------------------
from datetime import date, datetime
from decimal import Decimal

class InscripcionBase(BaseModel):
    id_estudiante: int
    id_periodo_academico: int

class InscripcionCreate(InscripcionBase):
    asignaturas: list[int] = []

class InscripcionOut(InscripcionBase):
    id_inscripcion: int
    estado: str
    fecha_inscripcion: datetime

    class Config:
        from_attributes = True

class DetallaOut(BaseModel):
    id_asignatura: int
    id_inscripcion: int

    class Config:
        from_attributes = True

class CodigoDetalleBase(BaseModel):
    codigo: str
    descripcion: str
    grupo: str

class CodigoDetalleCreate(CodigoDetalleBase):
    pass

class CodigoDetalleUpdate(BaseModel):
    descripcion: Optional[str] = None
    grupo: Optional[str] = None
    estado: Optional[str] = None

class CodigoDetalleOut(CodigoDetalleBase):
    id_codigo_detalle: int
    estado: str

    class Config:
        from_attributes = True

class PeriodoBase(BaseModel):
    codigo_periodo: str
    numero_periodo: int
    anio: int
    fecha_inicio: date
    fecha_fin: date

class PeriodoCreate(PeriodoBase):
    pass

class PeriodoUpdate(BaseModel):
    codigo_periodo: Optional[str] = None
    numero_periodo: Optional[int] = None
    anio: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    estado: Optional[str] = None

class PeriodoOut(PeriodoBase):
    id_periodo: int
    estado: str

    class Config:
        from_attributes = True

class EstudianteBase(BaseModel):
    tipo_documento: str
    numero_documento: str
    primer_nombre: str
    segundo_nombre: Optional[str] = None
    primer_apellido: str
    segundo_apellido: Optional[str] = None
    telefono_celular: Optional[str] = None
    telefono_fijo: Optional[str] = None
    correo_electronico: str
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    id_programa: int

class EstudianteCreate(EstudianteBase):
    pass

class EstudianteUpdate(BaseModel):
    tipo_documento: Optional[str] = None
    numero_documento: Optional[str] = None
    primer_nombre: Optional[str] = None
    segundo_nombre: Optional[str] = None
    primer_apellido: Optional[str] = None
    segundo_apellido: Optional[str] = None
    telefono_celular: Optional[str] = None
    telefono_fijo: Optional[str] = None
    correo_electronico: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    id_programa: Optional[int] = None

class EstudianteOut(EstudianteBase):
    id_estudiante: int
    fecha_ingreso: date

    class Config:
        from_attributes = True

class ReglaCobroBase(BaseModel):
    modalidad_cobro: str
    id_periodo: int
    id_programa: int
    valor_global: Optional[Decimal] = None
    valor_credito: Optional[Decimal] = None
    fecha_vigencia_hasta: Optional[date] = None

class ReglaCobro(ReglaCobroBase):
    pass

class ReglaCobroUpdate(BaseModel):
    valor_global: Optional[Decimal] = None
    valor_credito: Optional[Decimal] = None
    fecha_vigencia_hasta: Optional[date] = None
    estado: Optional[str] = None

class ReglaCobroOut(ReglaCobroBase):
    fecha_vigencia_desde: date
    estado: str

    class Config:
        from_attributes = True

# ------------------------------------------------------------------
# SCHEMAS PARA VOLANTES DE MATRÍCULA
# ------------------------------------------------------------------

class DetalleVolanteOut(BaseModel):
    id_codigo_detalle: int
    cantidad: Decimal
    valor_unitario: Decimal
    
    class Config:
        from_attributes = True

class VolanteCreate(BaseModel):
    id_estudiante: int
    id_periodo: int
    modalidad_cobro: str # GLOBAL o POR_CREDITOS
    semestre_a_cursar: int = 1
    creditos: Optional[int] = None
    valor: Optional[Decimal] = None
    id_codigo_detalle: Optional[int] = None

class VolanteMassCreate(BaseModel):
    id_programa: Optional[int] = None # Opcional: si es None, genera para todos
    id_periodo: int

class VolanteOut(BaseModel):
    id_volante: int
    numero_volante: str
    fecha_generacion: datetime
    semestre_a_cursar: int
    generacion_tipo: str
    estado: str
    modalidad_cobro: str
    id_estudiante: int
    id_periodo: int
    estudiante_nombre: Optional[str] = None
    total: Decimal = 0
    saldo_pendiente: Decimal = 0
    detalles: list[DetalleVolanteOut] = []

    class Config:
        from_attributes = True

# ------------------------------------------------------------------
# SCHEMAS PARA PAGOS Y RECAUDOS
# ------------------------------------------------------------------

class PagoCreate(BaseModel):
    id_volante_matricula: int
    valor_pagado: Decimal
    referencia_pago: str
    canal_pago: str
    id_codigo_detalle: Optional[int] = None

class PagoOut(BaseModel):
    id_pago: int
    valor_pagado: Decimal
    fecha_pago: datetime
    estado_pago: str
    referencia_pago: str
    canal_pago: str
    tipo_pago: str
    id_volante_matricula: int
    
    class Config:
        from_attributes = True

# ------------------------------------------------------------------
# SCHEMAS PARA CUENTAS CORRIENTES Y MOVIMIENTOS
# ------------------------------------------------------------------

class MovimientoOut(BaseModel):
    id_cuenta_corriente: int
    numero_secuencia: int
    id_codigo_detalle: int
    id_origen: Optional[int] = None
    tipo_origen: str
    fecha_movimiento: datetime
    descripcion_adicional: Optional[str] = None
    valor: Decimal
    nombre_codigo: Optional[str] = None
    tipo_movimiento: Optional[str] = None 
    
    class Config:
        from_attributes = True

class CuentaCorrienteOut(BaseModel):
    id_cuenta: int
    fecha_apertura: date
    estado: str
    id_estudiante: int
    id_periodo: int
    
    class Config:
        from_attributes = True

class ResumenCuentaOut(BaseModel):
    total_cargos: Decimal
    total_abonos: Decimal
    balance: Decimal
    movimientos: list[MovimientoOut] = []

# ------------------------------------------------------------------
# SCHEMAS PARA REPORTES Y DASHBOARD
# ------------------------------------------------------------------

class BalanceCuentaOut(BaseModel):
    id_cuenta: int
    numero_documento: str
    nombre_estudiante: str
    codigo_periodo: str
    total_cobros: Decimal
    total_pagos: Decimal
    saldo: Decimal

class ResumenEstudianteOut(BaseModel):
    nombre_estudiante: str
    numero_documento: str
    nombre_programa: str
    modalidad_cobro: str
    monto_volante: Decimal
    estado_volante: str

class IngresoEsperadoOut(BaseModel):
    codigo_periodo: str
    nombre_programa: str
    total_estudiantes: int
    ingreso_esperado_total: Decimal

class EstudiantePendienteOut(BaseModel):
    id_programa: Optional[int] = None
    nombre_programa: Optional[str] = None
    nombre_estudiante: str
    numero_documento: str
    monto_esperado: Decimal
    monto_pagado: Decimal
    saldo_pendiente: Decimal

class IngresoRealOut(BaseModel):
    codigo_periodo: str
    nombre_programa: str
    ingreso_real_recibido: Decimal

class CreditoFinancieroOut(BaseModel):
    nombre_estudiante: str
    numero_documento: str
    nombre_programa: str
    valor_credito: Decimal

# ------------------------------------------------------------------
# SCHEMAS PARA CONTROL DE ACCESO BASADO EN ROLES (RBAC)
# ------------------------------------------------------------------

class RolOut(BaseModel):
    id_rol: int
    nombre_rol: str
    descripcion: Optional[str] = None
    es_especial: bool = False

    class Config:
        from_attributes = True

class MenuOut(BaseModel):
    id_menu: int
    nombre_menu: str
    descripcion: Optional[str] = None
    ruta: Optional[str] = None
    orden: int
    estado: str
    id_menu_padre: Optional[int] = None

    class Config:
        from_attributes = True

class PermisoOut(BaseModel):
    id_menu: int
    id_rol: int
    puede_ver: bool
    puede_crear: bool
    puede_editar: bool
    puede_eliminar: bool
    menu_nombre: Optional[str] = None
    menu_ruta: Optional[str] = None

    class Config:
        from_attributes = True

class PermisoItemUpdate(BaseModel):
    id_menu: int
    puede_ver: bool
    puede_crear: bool
    puede_editar: bool
    puede_eliminar: bool

class PermisoBatchUpdate(BaseModel):
    permisos: list[PermisoItemUpdate]
