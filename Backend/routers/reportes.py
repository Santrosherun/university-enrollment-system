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
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_balance_cuenta_corriente")).all()
    return result

@router.get("/resumen-estudiantes", response_model=list[schemas.ResumenEstudianteOut])
def get_resumen_estudiantes(
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_resumen_estudiantes")).all()
    return result

@router.get("/ingreso-esperado", response_model=list[schemas.IngresoEsperadoOut])
def get_ingreso_esperado(
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_ingreso_esperado")).all()
    return result

@router.get("/pendientes-pago", response_model=list[schemas.EstudiantePendienteOut])
def get_pendientes_pago(
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_estudiantes_pendientes_pago")).all()
    return result

@router.get("/ingreso-real", response_model=list[schemas.IngresoRealOut])
def get_ingreso_real(
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_ingreso_real")).all()
    return result

@router.get("/creditos-financieros", response_model=list[schemas.CreditoFinancieroOut])
def get_creditos_financieros(
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_creditos_financieros")).all()
    return result

@router.get("/dashboard")
def get_dashboard_summary(
    periodo: str = "",
    db: Session = Depends(database.get_db)
):
    # 1. Facturación (Ingreso Esperado)
    query_esperado = "SELECT COALESCE(SUM(ingreso_esperado_total), 0) FROM vista_ingreso_esperado"
    params = {}
    if periodo:
        query_esperado += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    
    total_esperado = db.execute(text(query_esperado), params).scalar() or 0

    # 2. Recaudo (Ingreso Real)
    query_real = "SELECT COALESCE(SUM(ingreso_real_recibido), 0) FROM vista_ingreso_real"
    if periodo:
        query_real += " WHERE codigo_periodo = :p"
    
    total_real = db.execute(text(query_real), params).scalar() or 0

    # 3. Datos para el gráfico por programa
    query_prog = "SELECT nombre_programa as nombre, ingreso_esperado_total as facturado FROM vista_ingreso_esperado"
    if periodo:
        query_prog += " WHERE codigo_periodo = :p"
    
    res_prog = db.execute(text(query_prog), params).all()
    por_programa = [dict(row._mapping) for row in res_prog]

    # Indicadores
    total_pendiente = float(total_esperado) - float(total_real)
    efectividad = (float(total_real) / float(total_esperado) * 100) if total_esperado > 0 else 0

    return {
        "vista_facturacion": {
            "total_bruto": float(total_esperado),
            "descuentos": 0,
            "total_neto": float(total_esperado),
            "por_programa": por_programa
        },
        "vista_ingreso_real": {
            "total_recaudado": float(total_real),
            "efectividad_porcentaje": efectividad
        },
        "vista_cartera": {
            "total_pendiente": max(0, total_pendiente)
        }
    }
