from typing import Optional
from sqlalchemy import ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from decimal import Decimal
from datetime import date, datetime

from database import Base

###############
## Tablas DB ##
###############


#-Seguridad---------------------------------------------------------------------
class Rol(Base):
    __tablename__ = "rol"

    id_rol: Mapped[int] = mapped_column(primary_key=True, autoincrement= True)
    nombre_rol: Mapped[str] = mapped_column(unique=True)
    descripcion: Mapped[Optional[str]]
    es_especial: Mapped[bool] = mapped_column(default=False)

    usuarios: Mapped[list["Usuario"]] = relationship(back_populates="rol")
    permisos: Mapped[list["Permiso"]] = relationship(back_populates="rol")


class Persona(Base):
    __tablename__ = "persona"

    id_persona: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    tipo_documento: Mapped[str]
    numero_documento: Mapped[str] = mapped_column(unique=True)
    primer_nombre: Mapped[str]
    segundo_nombre: Mapped[Optional[str]]
    primer_apellido: Mapped[str]
    segundo_apellido: Mapped[Optional[str]]
    correo_personal: Mapped[str] = mapped_column(unique=True)
    telefono_contacto: Mapped[Optional[str]]
    perfil_tecnico: Mapped[bool] = mapped_column(default=False)
    estado: Mapped[str] = mapped_column(default="ACTIVO")
    
    usuario : Mapped[Optional["Usuario"]] = relationship(back_populates="persona", uselist=False)


class Usuario(Base):
    __tablename__ = "usuario"
    
    id_usuario: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(unique=True)
    password_hash: Mapped[str]
    fecha_creacion: Mapped[datetime] = mapped_column(server_default=func.now())
    estado: Mapped[str] = mapped_column(default="ACTIVO")
    correo_notificacion: Mapped[str]
    ultimo_acceso: Mapped[Optional[datetime]]
    id_persona: Mapped[int] = mapped_column(ForeignKey("persona.id_persona"), unique=True)
    id_rol: Mapped[int] = mapped_column(ForeignKey("rol.id_rol"))


    persona: Mapped["Persona"] = relationship(back_populates="usuario")
    rol: Mapped["Rol"] = relationship(back_populates="usuarios")
    volantes: Mapped[list["VolanteMatricula"]] = relationship(back_populates="usuario")
    pagos: Mapped[list["Pago"]] = relationship(back_populates="usuario")


class Menu(Base):
    __tablename__ = "menu"
 
    id_menu: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_menu: Mapped[str]
    descripcion: Mapped[Optional[str]]
    ruta: Mapped[Optional[str]]
    orden: Mapped[int] = mapped_column(default=1)
    estado: Mapped[str] = mapped_column(default="ACTIVO")
    id_menu_padre: Mapped[Optional[int]] = mapped_column(ForeignKey("menu.id_menu"))
 
    hijos: Mapped[list["Menu"]] = relationship(backref="padre", remote_side="Menu.id_menu")
    permisos: Mapped[list["Permiso"]] = relationship(back_populates="menu")


class Permiso(Base):
    __tablename__ = "permiso"
 
    id_menu: Mapped[int] = mapped_column(ForeignKey("menu.id_menu"), primary_key=True)
    id_rol: Mapped[int]  = mapped_column(ForeignKey("rol.id_rol"), primary_key=True)
    puede_ver: Mapped[bool] = mapped_column(default=False)
    puede_crear: Mapped[bool] = mapped_column(default=False)
    puede_editar: Mapped[bool] = mapped_column(default=False)
    puede_eliminar: Mapped[bool] = mapped_column(default=False)
 
    menu: Mapped["Menu"] = relationship(back_populates="permisos")
    rol: Mapped["Rol"]  = relationship(back_populates="permisos")


# ── Estructura académica ───────────────────────────────────────────────────────
 
class PeriodoAcademico(Base):
    __tablename__ = "periodo_academico"
 
    id_periodo     : Mapped[int]  = mapped_column(primary_key=True, autoincrement=True)
    codigo_periodo : Mapped[str]  = mapped_column(unique=True)
    numero_periodo : Mapped[int]
    anio           : Mapped[int]
    fecha_inicio   : Mapped[date]
    fecha_fin      : Mapped[date]
    estado         : Mapped[str]  = mapped_column(default="ACTIVO")
 
    inscripciones : Mapped[list["Inscripcion"]]      = relationship(back_populates="periodo")
    reglas_cobro  : Mapped[list["ReglaCobro"]]       = relationship(back_populates="periodo")
    cuentas       : Mapped[list["CuentaCorriente"]]  = relationship(back_populates="periodo")
    volantes      : Mapped[list["VolanteMatricula"]] = relationship(back_populates="periodo")
 
 
class ProgramaAcademico(Base):
    __tablename__ = "programa_academico"
 
    id_programa        : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo_programa    : Mapped[str] = mapped_column(unique=True)
    nombre_programa    : Mapped[str] = mapped_column(unique=True)
    duracion_semestres : Mapped[int]
    modalidad_programa : Mapped[str]
    nivel_formacion    : Mapped[str]
    estado             : Mapped[str] = mapped_column(default="ACTIVO")
 
    estudiantes  : Mapped[list["Estudiante"]]        = relationship(back_populates="programa")
    plan_estudio : Mapped[list["PlanEstudio"]]        = relationship(back_populates="programa")
    reglas_cobro : Mapped[list["ReglaCobro"]]         = relationship(back_populates="programa")
    volantes     : Mapped[list["VolanteMatricula"]]   = relationship(back_populates="programa")
 
 
class Estudiante(Base):
    __tablename__ = "estudiante"
 
    id_estudiante      : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    tipo_documento     : Mapped[str]
    numero_documento   : Mapped[str]           = mapped_column(unique=True)
    primer_nombre      : Mapped[str]
    segundo_nombre     : Mapped[Optional[str]]
    primer_apellido    : Mapped[str]
    segundo_apellido   : Mapped[Optional[str]]
    telefono_celular   : Mapped[Optional[str]]
    telefono_fijo      : Mapped[Optional[str]]
    correo_electronico : Mapped[str]           = mapped_column(unique=True)
    direccion          : Mapped[Optional[str]]
    fecha_nacimiento   : Mapped[Optional[date]]
    fecha_ingreso      : Mapped[date]          = mapped_column(server_default=func.current_date())
    id_programa        : Mapped[int]           = mapped_column(ForeignKey("programa_academico.id_programa"))
 
    programa      : Mapped["ProgramaAcademico"]       = relationship(back_populates="estudiantes")
    inscripciones : Mapped[list["Inscripcion"]]        = relationship(back_populates="estudiante")
    cuentas       : Mapped[list["CuentaCorriente"]]    = relationship(back_populates="estudiante")
    volantes      : Mapped[list["VolanteMatricula"]]   = relationship(back_populates="estudiante")
 
 
class Asignatura(Base):
    __tablename__ = "asignatura"
 
    id_asignatura     : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo_asignatura : Mapped[str] = mapped_column(unique=True)
    nombre_asignatura : Mapped[str]
    tipo_asignatura   : Mapped[str]
    creditos          : Mapped[int]
    estado            : Mapped[str] = mapped_column(default="ACTIVA")
 
    plan_estudio : Mapped[list["PlanEstudio"]] = relationship(back_populates="asignatura")
    detallas     : Mapped[list["Detalla"]]     = relationship(back_populates="asignatura")
 
 
class PlanEstudio(Base):
    __tablename__ = "plan_estudio"
 
    id_programa    : Mapped[int]  = mapped_column(ForeignKey("programa_academico.id_programa"), primary_key=True)
    id_asignatura  : Mapped[int]  = mapped_column(ForeignKey("asignatura.id_asignatura"), primary_key=True)
    semestre       : Mapped[int]  = mapped_column(primary_key=True)
    creditos_plan  : Mapped[int]
    es_obligatoria : Mapped[bool] = mapped_column(default=True)
 
    programa   : Mapped["ProgramaAcademico"] = relationship(back_populates="plan_estudio")
    asignatura : Mapped["Asignatura"]        = relationship(back_populates="plan_estudio")
 
 
class ReglaCobro(Base):
    __tablename__ = "regla_cobro"
 
    modalidad_cobro      : Mapped[str]              = mapped_column(primary_key=True)
    id_periodo           : Mapped[int]              = mapped_column(ForeignKey("periodo_academico.id_periodo"), primary_key=True)
    id_programa          : Mapped[int]              = mapped_column(ForeignKey("programa_academico.id_programa"), primary_key=True)
    valor_global         : Mapped[Optional[Decimal]]
    valor_credito        : Mapped[Optional[Decimal]]
    fecha_vigencia_desde : Mapped[date]             = mapped_column(server_default=func.current_date())
    fecha_vigencia_hasta : Mapped[Optional[date]]
    estado               : Mapped[str]              = mapped_column(default="ACTIVA")
 
    periodo  : Mapped["PeriodoAcademico"]          = relationship(back_populates="reglas_cobro")
    programa : Mapped["ProgramaAcademico"]         = relationship(back_populates="reglas_cobro")
 
# ── Inscripción ────────────────────────────────────────────────────────────────
 
class Inscripcion(Base):
    __tablename__ = "inscripcion"
    __table_args__ = (
        UniqueConstraint("id_estudiante", "id_periodo_academico", name="uq_inscripcion_estudiante_periodo"),
    )
 
    id_inscripcion       : Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    fecha_inscripcion    : Mapped[datetime] = mapped_column(server_default=func.now())
    estado               : Mapped[str]      = mapped_column(default="ACTIVA")
    id_estudiante        : Mapped[int]      = mapped_column(ForeignKey("estudiante.id_estudiante"))
    id_periodo_academico : Mapped[int]      = mapped_column(ForeignKey("periodo_academico.id_periodo"))
 
    estudiante : Mapped["Estudiante"]             = relationship(back_populates="inscripciones")
    periodo    : Mapped["PeriodoAcademico"]        = relationship(back_populates="inscripciones")
    detallas   : Mapped[list["Detalla"]]           = relationship(back_populates="inscripcion")
    volantes   : Mapped[list["VolanteMatricula"]]  = relationship(back_populates="inscripcion")
 
 
class Detalla(Base):
    __tablename__ = "detalla"
 
    id_asignatura  : Mapped[int] = mapped_column(ForeignKey("asignatura.id_asignatura"), primary_key=True)
    id_inscripcion : Mapped[int] = mapped_column(ForeignKey("inscripcion.id_inscripcion"), primary_key=True)
 
    asignatura  : Mapped["Asignatura"]  = relationship(back_populates="detallas")
    inscripcion : Mapped["Inscripcion"] = relationship(back_populates="detallas")
 
 
# ── Cobros, pagos y cuenta corriente ──────────────────────────────────────────
 
class CodigoDetalle(Base):
    __tablename__ = "codigo_detalle"
 
    id_codigo_detalle : Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo            : Mapped[str] = mapped_column(unique=True)
    descripcion       : Mapped[str]
    grupo             : Mapped[str]
    estado            : Mapped[str] = mapped_column(default="ACTIVO")
 
    detalles_volante : Mapped[list["DetalleVolante"]] = relationship(back_populates="codigo_detalle")
    movimientos      : Mapped[list["Movimiento"]]     = relationship(back_populates="codigo_detalle")
 
 
class CuentaCorriente(Base):
    __tablename__ = "cuenta_corriente"
    __table_args__ = (
        UniqueConstraint("id_estudiante", "id_periodo", name="uq_cuenta_estudiante_periodo"),
    )
 
    id_cuenta      : Mapped[int]  = mapped_column(primary_key=True, autoincrement=True)
    fecha_apertura : Mapped[date] = mapped_column(server_default=func.current_date())
    estado         : Mapped[str]  = mapped_column(default="ABIERTA")
    id_estudiante  : Mapped[int]  = mapped_column(ForeignKey("estudiante.id_estudiante"))
    id_periodo     : Mapped[int]  = mapped_column(ForeignKey("periodo_academico.id_periodo"))
 
    estudiante  : Mapped["Estudiante"]        = relationship(back_populates="cuentas")
    periodo     : Mapped["PeriodoAcademico"]  = relationship(back_populates="cuentas")
    movimientos : Mapped[list["Movimiento"]]  = relationship(back_populates="cuenta_corriente")
 
 
class VolanteMatricula(Base):
    __tablename__ = "volante_matricula"
 
    id_volante        : Mapped[int]           = mapped_column(primary_key=True, autoincrement=True)
    numero_volante    : Mapped[str]           = mapped_column(unique=True)
    fecha_generacion  : Mapped[datetime]      = mapped_column(server_default=func.now())
    semestre_a_cursar : Mapped[int]
    generacion_tipo   : Mapped[str]
    estado            : Mapped[str]           = mapped_column(default="GENERADO")
    modalidad_cobro   : Mapped[str]
    id_usuario        : Mapped[int]           = mapped_column(ForeignKey("usuario.id_usuario"))
    id_periodo        : Mapped[int]           = mapped_column(ForeignKey("periodo_academico.id_periodo"))
    id_estudiante     : Mapped[int]           = mapped_column(ForeignKey("estudiante.id_estudiante"))
    id_programa       : Mapped[int]           = mapped_column(ForeignKey("programa_academico.id_programa"))
    id_inscripcion    : Mapped[Optional[int]] = mapped_column(ForeignKey("inscripcion.id_inscripcion"))
 
    usuario     : Mapped["Usuario"]               = relationship(back_populates="volantes")
    periodo     : Mapped["PeriodoAcademico"]       = relationship(back_populates="volantes")
    estudiante  : Mapped["Estudiante"]             = relationship(back_populates="volantes")
    programa    : Mapped["ProgramaAcademico"]      = relationship(back_populates="volantes")
    inscripcion : Mapped[Optional["Inscripcion"]]  = relationship(back_populates="volantes")
    detalles : Mapped[list["DetalleVolante"]] = relationship(back_populates="volante")
    pagos    : Mapped[list["Pago"]]           = relationship(back_populates="volante")
 
 
class DetalleVolante(Base):
    __tablename__ = "detalle_volante"
 
    id_codigo_detalle    : Mapped[int]     = mapped_column(ForeignKey("codigo_detalle.id_codigo_detalle"), primary_key=True)
    id_volante_matricula : Mapped[int]     = mapped_column(ForeignKey("volante_matricula.id_volante"), primary_key=True)
    cantidad             : Mapped[Decimal] = mapped_column(default=1)
    valor_unitario       : Mapped[Decimal]
 
    codigo_detalle : Mapped["CodigoDetalle"]    = relationship(back_populates="detalles_volante")
    volante        : Mapped["VolanteMatricula"] = relationship(back_populates="detalles")
 
 
class Pago(Base):
    __tablename__ = "pago"
 
    id_pago              : Mapped[int]      = mapped_column(primary_key=True, autoincrement=True)
    valor_pagado         : Mapped[Decimal]
    fecha_pago           : Mapped[datetime] = mapped_column(server_default=func.now())
    estado_pago          : Mapped[str]      = mapped_column(default="APROBADO")
    referencia_pago      : Mapped[str]      = mapped_column(unique=True)
    canal_pago           : Mapped[str]
    tipo_pago            : Mapped[str]
    id_volante_matricula : Mapped[int]      = mapped_column(ForeignKey("volante_matricula.id_volante"))
    id_usuario           : Mapped[int]      = mapped_column(ForeignKey("usuario.id_usuario"))
 
    volante : Mapped["VolanteMatricula"] = relationship(back_populates="pagos")
    usuario : Mapped["Usuario"]          = relationship(back_populates="pagos")
 
 
class Movimiento(Base):
    __tablename__ = "movimiento"
 
    id_cuenta_corriente   : Mapped[int]           = mapped_column(ForeignKey("cuenta_corriente.id_cuenta"), primary_key=True)
    numero_secuencia      : Mapped[int]           = mapped_column(primary_key=True)
    id_codigo_detalle     : Mapped[int]           = mapped_column(ForeignKey("codigo_detalle.id_codigo_detalle"))
    id_origen             : Mapped[Optional[int]]
    tipo_origen           : Mapped[str]
    fecha_movimiento      : Mapped[datetime]      = mapped_column(server_default=func.now())
    descripcion_adicional : Mapped[Optional[str]]
    valor                 : Mapped[Decimal]
 
    cuenta_corriente : Mapped["CuentaCorriente"] = relationship(back_populates="movimientos")
    codigo_detalle   : Mapped["CodigoDetalle"]   = relationship(back_populates="movimientos")
