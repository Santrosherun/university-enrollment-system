from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Numeric, Date, DateTime, BigInteger, CheckConstraint, UniqueConstraint, ForeignKeyConstraint, func
from sqlalchemy.orm import relationship, Mapped, mapped_column, DeclarativeBase
from datetime import datetime
from typing import List, Optional
import database

class Base(DeclarativeBase):
    pass

# ============================================================
# 1. SEGURIDAD: ROLES, PERSONAS, USUARIOS, MENÚS Y PERMISOS
# ============================================================

class Rol(Base):
    __tablename__ = "rol"
    id_rol: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nombre_rol: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(String(255))
    es_especial: Mapped[bool] = mapped_column(Boolean, default=False)

    usuarios: Mapped[List["Usuario"]] = relationship(back_populates="rol")
    permisos: Mapped[List["Permiso"]] = relationship(back_populates="rol")
    
    __table_args__ = (
        CheckConstraint("nombre_rol IN ('ADMINISTRADOR', 'SUPERVISOR', 'ASISTENTE')", name="ck_rol_nombre"),
    )

class Persona(Base):
    __tablename__ = "persona"
    id_persona: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tipo_documento: Mapped[str] = mapped_column(String(20), nullable=False)
    numero_documento: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    primer_nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    segundo_nombre: Mapped[Optional[str]] = mapped_column(String(80))
    primer_apellido: Mapped[str] = mapped_column(String(80), nullable=False)
    segundo_apellido: Mapped[Optional[str]] = mapped_column(String(80))
    correo_personal: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    telefono_contacto: Mapped[Optional[str]] = mapped_column(String(30))
    perfil_tecnico: Mapped[bool] = mapped_column(Boolean, default=False)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVO")

    usuario: Mapped["Usuario"] = relationship(back_populates="persona")

    __table_args__ = (
        CheckConstraint("estado IN ('ACTIVO', 'INACTIVO')", name="ck_persona_estado"),
        CheckConstraint("tipo_documento IN ('CC', 'TI', 'CE', 'PASAPORTE')", name="ck_persona_tipo_documento"),
    )

class Usuario(Base):
    __tablename__ = "usuario"
    id_usuario: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVO")
    correo_notificacion: Mapped[str] = mapped_column(String(150), nullable=False)
    ultimo_acceso: Mapped[Optional[datetime]] = mapped_column(DateTime)
    id_persona: Mapped[int] = mapped_column(BigInteger, ForeignKey("persona.id_persona"), unique=True)
    id_rol: Mapped[int] = mapped_column(BigInteger, ForeignKey("rol.id_rol"))

    persona: Mapped["Persona"] = relationship(back_populates="usuario")
    rol: Mapped["Rol"] = relationship(back_populates="usuarios")

    __table_args__ = (
        CheckConstraint("estado IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')", name="ck_usuario_estado"),
    )

class Menu(Base):
    __tablename__ = "menu"
    id_menu: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    nombre_menu: Mapped[str] = mapped_column(String(100), nullable=False)
    descripcion: Mapped[Optional[str]] = mapped_column(String(255))
    ruta: Mapped[Optional[str]] = mapped_column(String(255))
    orden: Mapped[int] = mapped_column(Integer, default=1)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVO")
    id_menu_padre: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("menu.id_menu"))

    permisos: Mapped[List["Permiso"]] = relationship(back_populates="menu")

    __table_args__ = (
        CheckConstraint("estado IN ('ACTIVO', 'INACTIVO')", name="ck_menu_estado"),
        CheckConstraint("orden > 0", name="ck_menu_orden"),
    )

class Permiso(Base):
    __tablename__ = "permiso"
    id_menu: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu.id_menu"), primary_key=True)
    id_rol: Mapped[int] = mapped_column(BigInteger, ForeignKey("rol.id_rol"), primary_key=True)
    puede_ver: Mapped[bool] = mapped_column(Boolean, default=False)
    puede_crear: Mapped[bool] = mapped_column(Boolean, default=False)
    puede_editar: Mapped[bool] = mapped_column(Boolean, default=False)
    puede_eliminar: Mapped[bool] = mapped_column(Boolean, default=False)

    menu: Mapped["Menu"] = relationship(back_populates="permisos")
    rol: Mapped["Rol"] = relationship(back_populates="permisos")

# ============================================================
# 2. ESTRUCTURA ACADÉMICA
# ============================================================

class PeriodoAcademico(Base):
    __tablename__ = "periodo_academico"
    id_periodo: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    codigo_periodo: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    numero_periodo: Mapped[int] = mapped_column(Integer, nullable=False)
    anio: Mapped[int] = mapped_column(Integer, nullable=False)
    fecha_inicio: Mapped[datetime] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[datetime] = mapped_column(Date, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVO")

    __table_args__ = (
        CheckConstraint("numero_periodo BETWEEN 1 AND 3", name="ck_periodo_numero"),
        CheckConstraint("fecha_fin > fecha_inicio", name="ck_periodo_fechas"),
        CheckConstraint("estado IN ('ACTIVO', 'INACTIVO', 'CERRADO')", name="ck_periodo_estado"),
    )

class ProgramaAcademico(Base):
    __tablename__ = "programa_academico"
    id_programa: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    codigo_programa: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    nombre_programa: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    duracion_semestres: Mapped[int] = mapped_column(Integer, nullable=False)
    modalidad_programa: Mapped[str] = mapped_column(String(30), nullable=False)
    nivel_formacion: Mapped[str] = mapped_column(String(50), nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVO")

    __table_args__ = (
        CheckConstraint("duracion_semestres > 0", name="ck_programa_duracion"),
        CheckConstraint("estado IN ('ACTIVO', 'INACTIVO')", name="ck_programa_estado"),
        CheckConstraint("modalidad_programa IN ('PRESENCIAL', 'VIRTUAL', 'HIBRIDA')", name="ck_programa_modalidad"),
        CheckConstraint("nivel_formacion IN ('PREGRADO', 'ESPECIALIZACION', 'MAESTRIA', 'DOCTORADO')", name="ck_programa_nivel"),
    )

class Estudiante(Base):
    __tablename__ = "estudiante"
    id_estudiante: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tipo_documento: Mapped[str] = mapped_column(String(20), nullable=False)
    numero_documento: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    primer_nombre: Mapped[str] = mapped_column(String(80), nullable=False)
    segundo_nombre: Mapped[Optional[str]] = mapped_column(String(80))
    primer_apellido: Mapped[str] = mapped_column(String(80), nullable=False)
    segundo_apellido: Mapped[Optional[str]] = mapped_column(String(80))
    telefono_celular: Mapped[Optional[str]] = mapped_column(String(30))
    telefono_fijo: Mapped[Optional[str]] = mapped_column(String(30))
    correo_electronico: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    direccion: Mapped[Optional[str]] = mapped_column(String(255))
    fecha_nacimiento: Mapped[Optional[datetime]] = mapped_column(Date)
    fecha_ingreso: Mapped[datetime] = mapped_column(Date, server_default=func.current_date())
    id_programa: Mapped[int] = mapped_column(BigInteger, ForeignKey("programa_academico.id_programa"))

    programa: Mapped["ProgramaAcademico"] = relationship()

    __table_args__ = (
        CheckConstraint("tipo_documento IN ('CC', 'TI', 'CE', 'PASAPORTE')", name="ck_estudiante_tipo_documento"),
    )

class Asignatura(Base):
    __tablename__ = "asignatura"
    id_asignatura: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    codigo_asignatura: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    nombre_asignatura: Mapped[str] = mapped_column(String(150), nullable=False)
    tipo_asignatura: Mapped[str] = mapped_column(String(30), nullable=False)
    creditos: Mapped[int] = mapped_column(Integer, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVA")

    __table_args__ = (
        CheckConstraint("creditos > 0", name="ck_asignatura_creditos"),
        CheckConstraint("estado IN ('ACTIVA', 'INACTIVA')", name="ck_asignatura_estado"),
        CheckConstraint("tipo_asignatura IN ('OBLIGATORIA', 'ELECTIVA', 'COMPLEMENTARIA')", name="ck_asignatura_tipo"),
    )

class PlanEstudio(Base):
    __tablename__ = "plan_estudio"
    id_programa: Mapped[int] = mapped_column(BigInteger, ForeignKey("programa_academico.id_programa"), primary_key=True)
    id_asignatura: Mapped[int] = mapped_column(BigInteger, ForeignKey("asignatura.id_asignatura"), primary_key=True)
    semestre: Mapped[int] = mapped_column(Integer, primary_key=True)
    creditos_plan: Mapped[int] = mapped_column(Integer, nullable=False)
    es_obligatoria: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        CheckConstraint("semestre > 0", name="ck_plan_semestre"),
        CheckConstraint("creditos_plan > 0", name="ck_plan_creditos"),
    )

class ReglaCobro(Base):
    __tablename__ = "regla_cobro"
    modalidad_cobro: Mapped[str] = mapped_column(String(20), primary_key=True)
    id_periodo: Mapped[int] = mapped_column(BigInteger, ForeignKey("periodo_academico.id_periodo"), primary_key=True)
    id_programa: Mapped[int] = mapped_column(BigInteger, ForeignKey("programa_academico.id_programa"), primary_key=True)
    valor_global: Mapped[Optional[float]] = mapped_column(Numeric(14,2))
    valor_credito: Mapped[Optional[float]] = mapped_column(Numeric(14,2))
    fecha_vigencia_desde: Mapped[datetime] = mapped_column(Date, server_default=func.current_date())
    fecha_vigencia_hasta: Mapped[Optional[datetime]] = mapped_column(Date)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVA")

    __table_args__ = (
        CheckConstraint("modalidad_cobro IN ('GLOBAL', 'CREDITOS')", name="ck_regla_modalidad"),
        CheckConstraint("estado IN ('ACTIVA', 'INACTIVA')", name="ck_regla_estado"),
        CheckConstraint("(modalidad_cobro = 'GLOBAL' AND valor_global IS NOT NULL AND valor_global > 0) OR (modalidad_cobro = 'CREDITOS' AND valor_credito IS NOT NULL AND valor_credito > 0)", name="ck_regla_valores"),
        CheckConstraint("fecha_vigencia_hasta IS NULL OR fecha_vigencia_hasta >= fecha_vigencia_desde", name="ck_regla_vigencia"),
    )

# ============================================================
# 3. INSCRIPCIÓN ACADÉMICA
# ============================================================

class Inscripcion(Base):
    __tablename__ = "inscripcion"
    id_inscripcion: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fecha_inscripcion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVA")
    id_estudiante: Mapped[int] = mapped_column(BigInteger, ForeignKey("estudiante.id_estudiante"))
    id_periodo_academico: Mapped[int] = mapped_column(BigInteger, ForeignKey("periodo_academico.id_periodo"))

    detalles: Mapped[List["Detalla"]] = relationship(back_populates="inscripcion")

    __table_args__ = (
        UniqueConstraint("id_estudiante", "id_periodo_academico", name="uq_inscripcion_estudiante_periodo"),
        CheckConstraint("estado IN ('ACTIVA', 'ANULADA', 'FINALIZADA')", name="ck_inscripcion_estado"),
    )

class Detalla(Base):
    __tablename__ = "detalla"
    id_asignatura: Mapped[int] = mapped_column(BigInteger, ForeignKey("asignatura.id_asignatura"), primary_key=True)
    id_inscripcion: Mapped[int] = mapped_column(BigInteger, ForeignKey("inscripcion.id_inscripcion"), primary_key=True)

    inscripcion: Mapped["Inscripcion"] = relationship(back_populates="detalles")

# ============================================================
# 4. FINANCIERO: CÓDIGOS, CUENTAS, VOLANTES, PAGOS, MOVIMIENTOS
# ============================================================

class CodigoDetalle(Base):
    __tablename__ = "codigo_detalle"
    id_codigo_detalle: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    codigo: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    descripcion: Mapped[str] = mapped_column(String(255), nullable=False)
    grupo: Mapped[str] = mapped_column(String(20), nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="ACTIVO")

    __table_args__ = (
        CheckConstraint("grupo IN ('COBRO', 'PAGO')", name="ck_codigo_grupo"),
        CheckConstraint("estado IN ('ACTIVO', 'INACTIVO')", name="ck_codigo_estado"),
    )

class CuentaCorriente(Base):
    __tablename__ = "cuenta_corriente"
    id_cuenta: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    fecha_apertura: Mapped[datetime] = mapped_column(Date, server_default=func.current_date())
    estado: Mapped[str] = mapped_column(String(20), default="ABIERTA")
    id_estudiante: Mapped[int] = mapped_column(BigInteger, ForeignKey("estudiante.id_estudiante"))
    id_periodo: Mapped[int] = mapped_column(BigInteger, ForeignKey("periodo_academico.id_periodo"))

    __table_args__ = (
        UniqueConstraint("id_estudiante", "id_periodo", name="uq_cuenta_estudiante_periodo"),
        CheckConstraint("estado IN ('ABIERTA', 'CERRADA', 'BLOQUEADA')", name="ck_cuenta_estado"),
    )

class VolanteMatricula(Base):
    __tablename__ = "volante_matricula"
    id_volante: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    numero_volante: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    fecha_generacion: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    semestre_a_cursar: Mapped[int] = mapped_column(Integer, nullable=False)
    generacion_tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="GENERADO")
    modalidad_cobro: Mapped[str] = mapped_column(String(20), nullable=False)
    id_usuario: Mapped[int] = mapped_column(BigInteger, ForeignKey("usuario.id_usuario"))
    id_periodo: Mapped[int] = mapped_column(BigInteger, ForeignKey("periodo_academico.id_periodo"))
    id_estudiante: Mapped[int] = mapped_column(BigInteger, ForeignKey("estudiante.id_estudiante"))
    id_programa: Mapped[int] = mapped_column(BigInteger, ForeignKey("programa_academico.id_programa"))
    id_inscripcion: Mapped[Optional[int]] = mapped_column(BigInteger, ForeignKey("inscripcion.id_inscripcion"))

    estudiante: Mapped["Estudiante"] = relationship()
    programa: Mapped["ProgramaAcademico"] = relationship()
    periodo: Mapped["PeriodoAcademico"] = relationship()
    detalles: Mapped[List["DetalleVolante"]] = relationship(back_populates="volante")

    __table_args__ = (
        ForeignKeyConstraint(
            ["modalidad_cobro", "id_periodo", "id_programa"],
            ["regla_cobro.modalidad_cobro", "regla_cobro.id_periodo", "regla_cobro.id_programa"],
            name="fk_volante_regla_cobro"
        ),
        CheckConstraint("semestre_a_cursar > 0", name="ck_volante_semestre"),
        CheckConstraint("generacion_tipo IN ('INDIVIDUAL', 'MASIVA')", name="ck_volante_generacion"),
        CheckConstraint("modalidad_cobro IN ('GLOBAL', 'CREDITOS')", name="ck_volante_modalidad"),
        CheckConstraint("estado IN ('GENERADO', 'PENDIENTE', 'PAGADO', 'PARCIAL', 'ANULADO', 'FINANCIADO')", name="ck_volante_estado"),
    )

class DetalleVolante(Base):
    __tablename__ = "detalle_volante"
    id_codigo_detalle: Mapped[int] = mapped_column(BigInteger, ForeignKey("codigo_detalle.id_codigo_detalle"), primary_key=True)
    id_volante_matricula: Mapped[int] = mapped_column(BigInteger, ForeignKey("volante_matricula.id_volante"), primary_key=True)
    cantidad: Mapped[float] = mapped_column(Numeric(10,2), default=1)
    valor_unitario: Mapped[float] = mapped_column(Numeric(14,2), nullable=False)

    volante: Mapped["VolanteMatricula"] = relationship(back_populates="detalles")

    __table_args__ = (
        CheckConstraint("cantidad > 0", name="ck_detalle_volante_cantidad"),
        CheckConstraint("valor_unitario >= 0", name="ck_detalle_volante_valor"),
    )

class Pago(Base):
    __tablename__ = "pago"
    id_pago: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tipo_pago: Mapped[str] = mapped_column(String(30), default="TOTAL")
    valor_pagado: Mapped[float] = mapped_column(Numeric(14,2), nullable=False)
    fecha_pago: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    estado_pago: Mapped[str] = mapped_column(String(20), default="APROBADO")
    referencia_pago: Mapped[str] = mapped_column(String(80), unique=True, nullable=False)
    canal_pago: Mapped[str] = mapped_column(String(30), nullable=False)
    id_volante_matricula: Mapped[int] = mapped_column(BigInteger, ForeignKey("volante_matricula.id_volante"))
    id_usuario: Mapped[int] = mapped_column(BigInteger, ForeignKey("usuario.id_usuario"))

    __table_args__ = (
        CheckConstraint("valor_pagado > 0", name="ck_pago_valor"),
        CheckConstraint("estado_pago IN ('APROBADO', 'RECHAZADO', 'ANULADO', 'PENDIENTE')", name="ck_pago_estado"),
        CheckConstraint("canal_pago IN ('CAJA', 'PSE', 'TRANSFERENCIA', 'TARJETA')", name="ck_pago_canal"),
        CheckConstraint("tipo_pago IN ('TOTAL', 'ANTICIPO', 'DESCUENTO', 'CREDITO_FINANCIERO', 'AJUSTE')", name="ck_pago_tipo"),
    )

class Movimiento(Base):
    __tablename__ = "movimiento"
    id_cuenta_corriente: Mapped[int] = mapped_column(BigInteger, ForeignKey("cuenta_corriente.id_cuenta"), primary_key=True)
    numero_secuencia: Mapped[int] = mapped_column(Integer, primary_key=True)
    id_codigo_detalle: Mapped[int] = mapped_column(BigInteger, ForeignKey("codigo_detalle.id_codigo_detalle"))
    id_origen: Mapped[Optional[int]] = mapped_column(BigInteger)
    tipo_origen: Mapped[str] = mapped_column(String(30), nullable=False)
    fecha_movimiento: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    descripcion_adicional: Mapped[Optional[str]] = mapped_column(String(255))
    valor: Mapped[float] = mapped_column(Numeric(14,2), nullable=False)

    __table_args__ = (
        CheckConstraint("numero_secuencia > 0", name="ck_movimiento_secuencia"),
        CheckConstraint("valor > 0", name="ck_movimiento_valor"),
        CheckConstraint("tipo_origen IN ('VOLANTE', 'PAGO', 'DESCUENTO', 'ANTICIPO', 'CREDITO', 'AJUSTE')", name="ck_movimiento_tipo_origen"),
    )
