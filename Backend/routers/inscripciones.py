from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas
import database
import models
from routers import auth

router = APIRouter(prefix="/inscripciones")

@router.get("/", response_model=list[schemas.InscripcionOut])
def get_inscripciones(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    return db.query(models.Inscripcion).all()

@router.post("/", response_model=schemas.InscripcionOut, status_code=201)
def create_inscripcion(
    data: schemas.InscripcionCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    # Validar estudiante
    estudiante = db.query(models.Estudiante).filter(models.Estudiante.id_estudiante == data.id_estudiante).first()
    if not estudiante:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Estudiante no encontrado")

    # Validar periodo
    periodo = db.query(models.PeriodoAcademico).filter(models.PeriodoAcademico.id_periodo == data.id_periodo_academico).first()
    if not periodo:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Periodo no encontrado")

    # Prevenir duplicados (Un estudiante solo se inscribe una vez por periodo)
    exists = db.query(models.Inscripcion).filter(
        models.Inscripcion.id_estudiante == data.id_estudiante,
        models.Inscripcion.id_periodo_academico == data.id_periodo_academico
    ).first()
    
    if exists:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El estudiante ya está inscrito en este periodo")

    # Crear cabecera de inscripción
    inscripcion = models.Inscripcion(
        id_estudiante=data.id_estudiante,
        id_periodo_academico=data.id_periodo_academico
    )
    db.add(inscripcion)
    db.commit()
    db.refresh(inscripcion)

    # Añadir el detalle de las asignaturas escogidas
    for asig_id in data.asignaturas:
        asignatura = db.query(models.Asignatura).filter(models.Asignatura.id_asignatura == asig_id).first()
        if asignatura:
            detalla = models.Detalla(
                id_inscripcion=inscripcion.id_inscripcion,
                id_asignatura=asig_id
            )
            db.add(detalla)
    
    db.commit()
    return inscripcion

@router.delete("/{id}", status_code=204)
def delete_inscripcion(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR"))
):
    inscripcion = db.query(models.Inscripcion).filter(models.Inscripcion.id_inscripcion == id).first()
    if not inscripcion:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Inscripcion no encontrada")
    
    # Primero borrar el detalle para evitar error de llave foránea
    db.query(models.Detalla).filter(models.Detalla.id_inscripcion == id).delete()
    
    # Luego borrar la cabecera
    db.delete(inscripcion)
    db.commit()

@router.get("/{id}/asignaturas", response_model=list[schemas.DetallaOut])
def get_asignaturas_inscritas(
    id: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    return db.query(models.Detalla).filter(models.Detalla.id_inscripcion == id).all()
