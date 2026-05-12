from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
import schemas
import database
import models
from routers import auth

router = APIRouter(prefix="/reportes")

@router.get("/balance-cuentas", response_model=list[schemas.BalanceCuentaOut])
def get_balance_cuentas(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    result = db.execute(text("SELECT * FROM vista_balance_cuenta_corriente")).all()
    return result

@router.get("/resumen-estudiantes", response_model=list[schemas.ResumenEstudianteOut])
def get_resumen_estudiantes(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    result = db.execute(text("SELECT * FROM vista_resumen_estudiantes")).all()
    return result

@router.get("/ingreso-esperado", response_model=list[schemas.IngresoEsperadoOut])
def get_ingreso_esperado(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    result = db.execute(text("SELECT * FROM vista_ingreso_esperado")).all()
    return result

@router.get("/pendientes-pago", response_model=list[schemas.EstudiantePendienteOut])
def get_pendientes_pago(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    result = db.execute(text("SELECT * FROM vista_estudiantes_pendientes_pago")).all()
    return result

@router.get("/ingreso-real", response_model=list[schemas.IngresoRealOut])
def get_ingreso_real(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    result = db.execute(text("SELECT * FROM vista_ingreso_real")).all()
    return result

@router.get("/creditos-financieros", response_model=list[schemas.CreditoFinancieroOut])
def get_creditos_financieros(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR"))
):
    result = db.execute(text("SELECT * FROM vista_creditos_financieros")).all()
    return result
