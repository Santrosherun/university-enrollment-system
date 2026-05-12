from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import schemas
import database
import models
from routers import auth

router = APIRouter(prefix="/asignaturas")

@router.get("/", response_model=list[schemas.AsignaturaOut])
def get_asignaturas(
        current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
        db: Session = Depends(database.get_db)
):
    return db.query(models.Asignatura).all()

@router.post("/", response_model=schemas.AsignaturaOut)
def create_asignatura(
    data: schemas.AsignaturaCreate,
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    exists = db.query(models.Asignatura).filter(models.Asignatura.codigo_asignatura == data.codigo_asignatura).first()
    if exists:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "El codigo de asignatura ya existe")
    
    asignatura = models.Asignatura(**data.model_dump())
    db.add(asignatura)
    db.commit()
    db.refresh(asignatura)
    return asignatura

@router.put("/{id}", response_model=schemas.AsignaturaOut)
def update_asignatura(
        id: int,
        data: schemas.AsignaturaUpdate,
        current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
        db: Session = Depends(database.get_db)
):
    asignatura = db.query(models.Asignatura).filter(models.Asignatura.id_asignatura == id).first()
    if not asignatura:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Id de asignatura no existe")
    
    for key, value in data.model_dump(exclude_none=True).items():
        setattr(asignatura, key, value)
    
    db.commit()
    db.refresh(asignatura)
    return asignatura

@router.delete("/{id}", status_code=204)
def delete_asignatura(
        id: int,
        current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR")),
        db: Session = Depends(database.get_db)
):
    asignatura = db.query(models.Asignatura).filter(models.Asignatura.id_asignatura == id).first()
    
    if not asignatura:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Asignatura no encontrada")
    
    db.delete(asignatura)
    db.commit()
