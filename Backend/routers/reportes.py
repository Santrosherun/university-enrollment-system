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
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    result = db.execute(text("SELECT * FROM vista_balance_cuenta_corriente")).all()
    return result

@router.get("/resumen-estudiantes", response_model=list[schemas.ResumenEstudianteOut])
def get_resumen_estudiantes(
    periodo: str = "",
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    query = "SELECT * FROM vista_resumen_estudiantes"
    params = {}
    if periodo:
        query += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    result = db.execute(text(query), params).all()
    return result

@router.get("/ingreso-esperado", response_model=list[schemas.IngresoEsperadoOut])
def get_ingreso_esperado(
    periodo: str = "",
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    query = "SELECT * FROM vista_ingreso_esperado"
    params = {}
    if periodo:
        query += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    result = db.execute(text(query), params).all()
    return result

@router.get("/pendientes-pago", response_model=list[schemas.EstudiantePendienteOut])
def get_pendientes_pago(
    periodo: str = "",
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    query = "SELECT * FROM vista_estudiantes_pendientes_pago"
    params = {}
    if periodo:
        query += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    result = db.execute(text(query), params).all()
    return result

@router.get("/ingreso-real", response_model=list[schemas.IngresoRealOut])
def get_ingreso_real(
    periodo: str = "",
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    query = "SELECT * FROM vista_ingreso_real"
    params = {}
    if periodo:
        query += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    result = db.execute(text(query), params).all()
    return result

@router.get("/creditos-financieros", response_model=list[schemas.CreditoFinancieroOut])
def get_creditos_financieros(
    periodo: str = "",
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    query = "SELECT * FROM vista_creditos_financieros"
    params = {}
    if periodo:
        query += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    result = db.execute(text(query), params).all()
    return result

@router.get("/dashboard")
def get_dashboard_summary(
    periodo: str = "",
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR")),
    db: Session = Depends(database.get_db)
):
    # 1. Facturación Bruta (Ingreso Esperado)
    query_esperado = "SELECT COALESCE(SUM(ingreso_esperado_total), 0) FROM vista_ingreso_esperado"
    params = {}
    if periodo:
        query_esperado += " WHERE codigo_periodo = :p"
        params["p"] = periodo
    
    total_esperado = db.execute(text(query_esperado), params).scalar() or 0

    # 2. Recaudo REAL (Solo dinero efectivo/transferencia, NO descuentos)
    # Filtramos por tipo_pago = 'TOTAL' o 'ANTICIPO' para asegurar que es flujo de caja
    query_real_efectivo = """
        SELECT COALESCE(SUM(p.valor_pagado), 0) 
        FROM pago p
        JOIN volante_matricula v ON p.id_volante_matricula = v.id_volante
        JOIN periodo_academico per ON v.id_periodo = per.id_periodo
        WHERE p.estado_pago = 'APROBADO' AND p.tipo_pago IN ('TOTAL', 'ANTICIPO')
    """
    if periodo:
        query_real_efectivo += " AND per.codigo_periodo = :p"
    
    total_recaudo_efectivo = db.execute(text(query_real_efectivo), params).scalar() or 0

    # 3. Suma de Descuentos Aplicados
    query_descuentos = """
        SELECT COALESCE(SUM(p.valor_pagado), 0) 
        FROM pago p
        JOIN volante_matricula v ON p.id_volante_matricula = v.id_volante
        JOIN periodo_academico per ON v.id_periodo = per.id_periodo
        WHERE p.estado_pago = 'APROBADO' AND p.tipo_pago = 'DESCUENTO'
    """
    if periodo:
        query_descuentos += " AND per.codigo_periodo = :p"
    
    total_descuentos = db.execute(text(query_descuentos), params).scalar() or 0

    # 4. Datos para el gráfico por programa (usamos la vista existente)
    query_prog = "SELECT nombre_programa as nombre, ingreso_esperado_total as facturado FROM vista_ingreso_esperado"
    if periodo:
        query_prog += " WHERE codigo_periodo = :p"
    
    res_prog = db.execute(text(query_prog), params).all()
    por_programa = [dict(row._mapping) for row in res_prog]

    # Cálculo Final de Cartera
    # Cartera = Facturación Bruta - (Pagos Efectivos + Descuentos)
    total_pendiente = float(total_esperado) - (float(total_recaudo_efectivo) + float(total_descuentos))
    
    # Evitar negativos por decimales o ajustes menores
    total_pendiente = max(0, total_pendiente)
    
    efectividad = (float(total_recaudo_efectivo) / (float(total_esperado) - float(total_descuentos)) * 100) if (float(total_esperado) - float(total_descuentos)) > 0 else 0

    return {
        "vista_facturacion": {
            "total_bruto": float(total_esperado),
            "descuentos": float(total_descuentos),
            "total_neto": float(total_esperado) - float(total_descuentos),
            "por_programa": por_programa
        },
        "vista_ingreso_real": {
            "total_recaudado": float(total_recaudo_efectivo),
            "efectividad_porcentaje": efectividad
        },
        "vista_cartera": {
            "total_pendiente": total_pendiente
        }
    }
