from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Response
from sqlalchemy.orm import Session
from sqlalchemy import func
import schemas
import database
import models
from routers import auth
from datetime import datetime
from utils.pdf_generator import generate_volante_pdf
from utils.email_sender import send_tuition_email

router = APIRouter(prefix="/volantes")

@router.get("/", response_model=list[schemas.VolanteOut])
def get_volantes(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    return db.query(models.VolanteMatricula).all()

@router.get("/{id}", response_model=schemas.VolanteOut)
def get_volante(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    volante = db.query(models.VolanteMatricula).filter(models.VolanteMatricula.id_volante == id).first()
    if not volante:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volante no encontrado")
    return volante

@router.get("/{id}/pdf")
def get_volante_pdf(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    # 1. Buscar el volante con todas sus relaciones
    volante = db.query(models.VolanteMatricula).filter(models.VolanteMatricula.id_volante == id).first()
    if not volante:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volante no encontrado")

    # 2. Preparar datos para el PDF
    detalles_db = db.query(models.DetalleVolante, models.CodigoDetalle.descripcion).join(
        models.CodigoDetalle, models.DetalleVolante.id_codigo_detalle == models.CodigoDetalle.id_codigo_detalle
    ).filter(models.DetalleVolante.id_volante_matricula == id).all()

    total = sum(d[0].cantidad * d[0].valor_unitario for d in detalles_db)

    pdf_data = {
        "numero_volante": volante.numero_volante,
        "estudiante_nombre": f"{volante.estudiante.primer_nombre} {volante.estudiante.primer_apellido}",
        "documento": volante.estudiante.numero_documento,
        "programa": volante.programa.nombre_programa,
        "periodo": volante.periodo.codigo_periodo,
        "fecha_impresion": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "detalles": [
            {"nombre": d[1], "cantidad": d[0].cantidad, "valor_unitario": d[0].valor_unitario}
            for d in detalles_db
        ],
        "total": total
    }

    # 3. Generar PDF
    pdf_content = generate_volante_pdf(pdf_data)

    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=Volante_{volante.numero_volante}.pdf"}
    )

def notify_volante_created(volante_id: int, db_session: Session):
    """ Función auxiliar para enviar el correo en segundo plano """
    # Re-obtener datos (necesitamos una sesión fresca si es background task)
    volante = db_session.query(models.VolanteMatricula).filter(models.VolanteMatricula.id_volante == volante_id).first()
    if not volante: return

    # (Lógica similar a get_volante_pdf para preparar pdf_data...)
    detalles_db = db_session.query(models.DetalleVolante, models.CodigoDetalle.descripcion).join(
        models.CodigoDetalle, models.DetalleVolante.id_codigo_detalle == models.CodigoDetalle.id_codigo_detalle
    ).filter(models.DetalleVolante.id_volante_matricula == volante_id).all()
    total = sum(d[0].cantidad * d[0].valor_unitario for d in detalles_db)
    
    pdf_data = {
        "numero_volante": volante.numero_volante,
        "estudiante_nombre": f"{volante.estudiante.primer_nombre} {volante.estudiante.primer_apellido}",
        "documento": volante.estudiante.numero_documento,
        "programa": volante.programa.nombre_programa,
        "periodo": volante.periodo.codigo_periodo,
        "fecha_impresion": datetime.now().strftime("%d/%m/%Y %H:%M"),
        "detalles": [{"nombre": d[1], "cantidad": d[0].cantidad, "valor_unitario": d[0].valor_unitario} for d in detalles_db],
        "total": total
    }
    
    pdf_content = generate_volante_pdf(pdf_data)
    send_tuition_email(
        to_email=volante.estudiante.correo_electronico,
        student_name=volante.estudiante.primer_nombre,
        volante_numero=volante.numero_volante,
        pdf_content=pdf_content
    )

@router.post("/", response_model=schemas.VolanteOut, status_code=201)
def create_volante(
    data: schemas.VolanteCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    # 1. Buscar estudiante y su programa
    estudiante = db.query(models.Estudiante).filter(models.Estudiante.id_estudiante == data.id_estudiante).first()
    if not estudiante:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Estudiante no encontrado")

    # 2. Buscar regla de cobro vigente
    regla = db.query(models.ReglaCobro).filter(
        models.ReglaCobro.id_programa == estudiante.id_programa,
        models.ReglaCobro.id_periodo == data.id_periodo,
        models.ReglaCobro.modalidad_cobro == data.modalidad_cobro,
        models.ReglaCobro.estado == "ACTIVA"
    ).first()

    if not regla:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, f"No existe una regla de cobro ACTIVA para la modalidad {data.modalidad_cobro} en este programa/periodo")

    # 3. Calcular valor según modalidad
    valor_total = 0
    id_inscripcion = None

    if data.modalidad_cobro == "GLOBAL":
        valor_total = regla.valor_global
    elif data.modalidad_cobro == "POR_CREDITOS":
        # Buscar inscripción para contar créditos
        inscripcion = db.query(models.Inscripcion).filter(
            models.Inscripcion.id_estudiante == data.id_estudiante,
            models.Inscripcion.id_periodo_academico == data.id_periodo
        ).first()

        if not inscripcion:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "El estudiante no tiene una inscripción registrada para este periodo (necesaria para cobro por créditos)")
        
        id_inscripcion = inscripcion.id_inscripcion
        
        # Sumar créditos de las materias inscritas
        total_creditos = db.query(func.sum(models.Asignatura.creditos)).join(
            models.Detalla, models.Detalla.id_asignatura == models.Asignatura.id_asignatura
        ).filter(models.Detalla.id_inscripcion == inscripcion.id_inscripcion).scalar() or 0

        if total_creditos == 0:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "El estudiante no tiene asignaturas inscritas para calcular el valor por créditos")
        
        valor_total = total_creditos * regla.valor_credito

    # 4. Crear el volante
    nuevo_volante = models.VolanteMatricula(
        numero_volante = f"VOL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        semestre_a_cursar = data.semestre_a_cursar,
        generacion_tipo = "INDIVIDUAL",
        modalidad_cobro = data.modalidad_cobro,
        id_usuario = current_user.id_usuario,
        id_periodo = data.id_periodo,
        id_estudiante = data.id_estudiante,
        id_programa = estudiante.id_programa,
        id_inscripcion = id_inscripcion
    )
    db.add(nuevo_volante)
    db.flush() # Para obtener el id_volante

    # 5. Crear el detalle del volante (Concepto de Matrícula)
    # Buscamos el código de detalle para 'Matrícula' (asumimos cd_001 o buscamos por nombre)
    codigo_matricula = db.query(models.CodigoDetalle).filter(models.CodigoDetalle.codigo == "MAT").first()
    if not codigo_matricula:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No se ha configurado el Código de Detalle con código 'MAT' para el concepto de Matrícula")

    detalle = models.DetalleVolante(
        id_volante_matricula = nuevo_volante.id_volante,
        id_codigo_detalle = codigo_matricula.id_codigo_detalle,
        cantidad = 1,
        valor_unitario = valor_total
    )
    db.add(detalle)

    # 6. Gestionar Cuenta Corriente y Movimiento
    cuenta = db.query(models.CuentaCorriente).filter(
        models.CuentaCorriente.id_estudiante == data.id_estudiante,
        models.CuentaCorriente.id_periodo == data.id_periodo
    ).first()

    if not cuenta:
        cuenta = models.CuentaCorriente(
            id_estudiante = data.id_estudiante,
            id_periodo = data.id_periodo,
            estado = "ABIERTA"
        )
        db.add(cuenta)
        db.flush()

    # Calcular siguiente secuencia
    max_sec = db.query(func.max(models.Movimiento.numero_secuencia)).filter(
        models.Movimiento.id_cuenta_corriente == cuenta.id_cuenta
    ).scalar() or 0

    movimiento = models.Movimiento(
        id_cuenta_corriente = cuenta.id_cuenta,
        numero_secuencia = max_sec + 1,
        id_codigo_detalle = codigo_matricula.id_codigo_detalle,
        id_origen = nuevo_volante.id_volante,
        tipo_origen = "VOLANTE",
        valor = valor_total,
        descripcion_adicional = f"Generación de volante {nuevo_volante.numero_volante}"
    )
    db.add(movimiento)

    db.commit()
    db.refresh(nuevo_volante)

    # 7. Tarea en segundo plano: Notificar por correo
    background_tasks.add_task(notify_volante_created, nuevo_volante.id_volante, db)

    return nuevo_volante

