from fastapi import APIRouter, Depends, HTTPException, status, Response, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
import database
import models
import schemas
from datetime import datetime
from routers import auth
from utils.pdf_generator import generate_volante_pdf

router = APIRouter(prefix="/volantes")

@router.get("/", response_model=list[schemas.VolanteOut])
def get_volantes(
    db: Session = Depends(database.get_db)
):
    volantes = db.query(models.VolanteMatricula).all()
    for v in volantes:
        v.total = sum(d.cantidad * d.valor_unitario for d in v.detalles)
        pagado = db.query(func.sum(models.Pago.valor_pagado)).filter(
            models.Pago.id_volante_matricula == v.id_volante,
            models.Pago.estado_pago == "APROBADO"
        ).scalar() or 0
        v.saldo_pendiente = v.total - pagado
        v.estudiante_nombre = f"{v.estudiante.primer_nombre} {v.estudiante.primer_apellido}"
    return volantes

@router.get("/{id}", response_model=schemas.VolanteOut)
def get_volante(
    id: int,
    db: Session = Depends(database.get_db)
):
    volante = db.query(models.VolanteMatricula).filter(models.VolanteMatricula.id_volante == id).first()
    if not volante:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volante no encontrado")
    
    volante.total = sum(d.cantidad * d.valor_unitario for d in volante.detalles)
    pagado = db.query(func.sum(models.Pago.valor_pagado)).filter(
        models.Pago.id_volante_matricula == volante.id_volante,
        models.Pago.estado_pago == "APROBADO"
    ).scalar() or 0
    volante.saldo_pendiente = volante.total - pagado
    volante.estudiante_nombre = f"{volante.estudiante.primer_nombre} {volante.estudiante.primer_apellido}"
    
    return volante

@router.post("/", response_model=schemas.VolanteOut, status_code=201)
def create_volante(
    data: schemas.VolanteCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    # 1. Validar existencia del estudiante
    estudiante = db.query(models.Estudiante).filter(models.Estudiante.id_estudiante == data.id_estudiante).first()
    if not estudiante:
        raise HTTPException(404, "Estudiante no encontrado")

    # 2. VALIDACIÓN DE DUPLICADOS: Solo para Matrícula (Global o Créditos)
    if data.modalidad_cobro in ("GLOBAL", "CREDITOS"):
        existe = db.query(models.VolanteMatricula).filter(
            models.VolanteMatricula.id_estudiante == data.id_estudiante,
            models.VolanteMatricula.id_periodo == data.id_periodo,
            models.VolanteMatricula.modalidad_cobro.in_(["GLOBAL", "CREDITOS"]),
            models.VolanteMatricula.estado != "ANULADO"
        ).first()
        if existe:
            raise HTTPException(400, f"El estudiante ya tiene un volante de matrícula generado para este periodo ({existe.numero_volante})")

    # 3. Lógica de Cobro y Reglas
    valor_total = 0
    id_inscripcion = None

    if data.modalidad_cobro in ("GLOBAL", "CREDITOS"):
        regla = db.query(models.ReglaCobro).filter(
            models.ReglaCobro.id_programa == estudiante.id_programa,
            models.ReglaCobro.id_periodo == data.id_periodo,
            models.ReglaCobro.modalidad_cobro == data.modalidad_cobro,
            models.ReglaCobro.estado == "ACTIVA"
        ).first()

        if not regla:
            raise HTTPException(400, f"No hay regla de cobro ACTIVA para la modalidad {data.modalidad_cobro}")

        if data.modalidad_cobro == "GLOBAL":
            valor_total = regla.valor_global
        else: # CREDITOS
            # A. Obtener o Crear Inscripción Académica
            inscripcion = db.query(models.Inscripcion).filter(
                models.Inscripcion.id_estudiante == data.id_estudiante,
                models.Inscripcion.id_periodo_academico == data.id_periodo
            ).first()

            if not inscripcion and data.asignaturas:
                # Crear la inscripción si no existe y vienen materias
                inscripcion = models.Inscripcion(
                    id_estudiante=data.id_estudiante,
                    id_periodo_academico=data.id_periodo
                )
                db.add(inscripcion)
                db.flush()
                # Registrar el detalle de materias
                for asig_id in data.asignaturas:
                    db.add(models.Detalla(id_inscripcion=inscripcion.id_inscripcion, id_asignatura=asig_id))
                db.flush()
            
            if not inscripcion:
                raise HTTPException(400, "No se encontró inscripción previa ni se enviaron materias para el cobro por créditos.")

            id_inscripcion = inscripcion.id_inscripcion

            # B. Calcular valor según créditos (Priorizar materias enviadas o inscritas)
            if data.asignaturas:
                creditos_totales = db.query(func.sum(models.Asignatura.creditos)).filter(
                    models.Asignatura.id_asignatura.in_(data.asignaturas)
                ).scalar() or 0
            else:
                creditos_totales = db.query(func.sum(models.Asignatura.creditos)).join(
                    models.Detalla, models.Detalla.id_asignatura == models.Asignatura.id_asignatura
                ).filter(models.Detalla.id_inscripcion == inscripcion.id_inscripcion).scalar() or 0
            
            valor_total = creditos_totales * regla.valor_credito
    else:
        # OTROS COBROS
        valor_total = data.valor if data.valor else 0

    # 4. Obtener/Crear Cuenta Corriente
    cuenta = db.query(models.CuentaCorriente).filter(
        models.CuentaCorriente.id_estudiante == data.id_estudiante,
        models.CuentaCorriente.id_periodo == data.id_periodo
    ).with_for_update().first()

    if not cuenta:
        cuenta = models.CuentaCorriente(id_estudiante=data.id_estudiante, id_periodo=data.id_periodo)
        db.add(cuenta)
        db.flush()

    # 5. Crear el volante
    nuevo_volante = models.VolanteMatricula(
        numero_volante = f"VOL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        semestre_a_cursar = data.semestre_a_cursar or 1,
        generacion_tipo = "INDIVIDUAL",
        modalidad_cobro = data.modalidad_cobro if data.modalidad_cobro in ("GLOBAL", "CREDITOS") else "GLOBAL",
        id_usuario = current_user.id_usuario,
        id_periodo = data.id_periodo,
        id_estudiante = data.id_estudiante,
        id_programa = estudiante.id_programa,
        id_inscripcion = id_inscripcion
    )
    db.add(nuevo_volante)
    db.flush()

    # 6. Determinar código de detalle (Concepto)
    id_concepto = None
    if data.id_codigo_detalle:
        id_concepto = data.id_codigo_detalle
    else:
        codigo_pmat = db.query(models.CodigoDetalle).filter(models.CodigoDetalle.codigo == "PMAT").first()
        if not codigo_pmat:
            raise HTTPException(500, "Código de concepto por defecto (PMAT) no configurado")
        id_concepto = codigo_pmat.id_codigo_detalle

    db.add(models.DetalleVolante(
        id_volante_matricula = nuevo_volante.id_volante,
        id_codigo_detalle = id_concepto,
        cantidad = 1,
        valor_unitario = valor_total
    ))

    db.commit()
    db.refresh(nuevo_volante)
    
    nuevo_volante.total = valor_total
    nuevo_volante.estudiante_nombre = f"{estudiante.primer_nombre} {estudiante.primer_apellido}"

    return nuevo_volante

@router.post("/generate-mass")
def create_mass_volantes(
    data: schemas.VolanteMassCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    query = db.query(models.Estudiante)
    if data.id_programa:
        query = query.filter(models.Estudiante.id_programa == data.id_programa)
    
    estudiantes = query.all()
    if not estudiantes:
        raise HTTPException(404, "No se encontraron estudiantes")

    codigo_pmat = db.query(models.CodigoDetalle).filter(models.CodigoDetalle.codigo == "PMAT").first()
    if not codigo_pmat:
        raise HTTPException(500, "Código PMAT no configurado")

    created_count = 0
    for est in estudiantes:
        # 1. Bloquear/Crear cuenta corriente (Igual que en individual)
        cuenta = db.query(models.CuentaCorriente).filter(
            models.CuentaCorriente.id_estudiante == est.id_estudiante,
            models.CuentaCorriente.id_periodo == data.id_periodo
        ).with_for_update().first()

        if not cuenta:
            cuenta = models.CuentaCorriente(id_estudiante=est.id_estudiante, id_periodo=data.id_periodo)
            db.add(cuenta)
            db.flush()

        # 2. Verificar si ya tiene volante ACTIVO
        exists = db.query(models.VolanteMatricula).filter(
            models.VolanteMatricula.id_estudiante == est.id_estudiante,
            models.VolanteMatricula.id_periodo == data.id_periodo,
            models.VolanteMatricula.modalidad_cobro.in_(["GLOBAL", "CREDITOS"]),
            models.VolanteMatricula.estado != "ANULADO"
        ).first()
        if exists: continue

        # 3. Buscar regla de cobro GLOBAL
        regla = db.query(models.ReglaCobro).filter(
            models.ReglaCobro.id_programa == est.id_programa,
            models.ReglaCobro.id_periodo == data.id_periodo,
            models.ReglaCobro.modalidad_cobro == "GLOBAL",
            models.ReglaCobro.estado == "ACTIVA"
        ).first()

        if not regla: continue

        # 4. Crear volante con número único (incluyendo hora para evitar colisiones)
        volante = models.VolanteMatricula(
            numero_volante = f"VOL-M-{datetime.now().strftime('%Y%m%d%H%M%S')}-{est.id_estudiante}",
            semestre_a_cursar = 1,
            generacion_tipo = "MASIVA",
            modalidad_cobro = "GLOBAL",
            id_usuario = current_user.id_usuario,
            id_periodo = data.id_periodo,
            id_estudiante = est.id_estudiante,
            id_programa = est.id_programa
        )
        db.add(volante)
        db.flush()

        db.add(models.DetalleVolante(
            id_volante_matricula = volante.id_volante,
            id_codigo_detalle = codigo_pmat.id_codigo_detalle,
            cantidad = 1,
            valor_unitario = regla.valor_global
        ))

        created_count += 1
    
    db.commit()
    return {"message": f"Se generaron {created_count} volantes"}

@router.get("/{id}/pdf")
def get_volante_pdf(
    id: int,
    db: Session = Depends(database.get_db)
):
    volante = db.query(models.VolanteMatricula).filter(models.VolanteMatricula.id_volante == id).first()
    if not volante:
        raise HTTPException(404, "Volante no encontrado")

    total = sum(d.cantidad * d.valor_unitario for d in volante.detalles)
    pagado = db.query(func.sum(models.Pago.valor_pagado)).filter(
        models.Pago.id_volante_matricula == volante.id_volante,
        models.Pago.estado_pago == "APROBADO"
    ).scalar() or 0
    saldo = total - pagado
    
    pdf_data = {
        "numero_volante": volante.numero_volante,
        "estudiante_nombre": f"{volante.estudiante.primer_nombre} {volante.estudiante.primer_apellido}",
        "documento": volante.estudiante.numero_documento,
        "programa": volante.programa.nombre_programa,
        "periodo": volante.periodo.codigo_periodo,
        "total": float(total),
        "pagado": float(pagado),
        "saldo": float(saldo),
        "fecha_impresion": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "detalles": [
            {
                "nombre": getattr(d.codigo_detalle, "descripcion", "Cobro de Concepto"),
                "cantidad": float(d.cantidad),
                "valor_unitario": float(d.valor_unitario)
            } for d in volante.detalles
        ]
    }

    pdf_content = generate_volante_pdf(pdf_data)
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"inline; filename=Volante_{volante.numero_volante}.pdf"}
    )
