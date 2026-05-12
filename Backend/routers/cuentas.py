from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import schemas
import database
import models
from routers import auth

router = APIRouter(prefix="/cuentas")

@router.get("/estudiante/{id_estudiante}", response_model=list[schemas.CuentaCorrienteOut])
def get_cuentas_estudiante(
    id_estudiante: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    return db.query(models.CuentaCorriente).filter(models.CuentaCorriente.id_estudiante == id_estudiante).all()

@router.get("/estudiante/{id_estudiante}/periodo/{id_periodo}", response_model=schemas.ResumenCuentaOut)
def get_extracto_periodo(
    id_estudiante: int,
    id_periodo: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    # 1. Buscar la cuenta
    cuenta = db.query(models.CuentaCorriente).filter(
        models.CuentaCorriente.id_estudiante == id_estudiante,
        models.CuentaCorriente.id_periodo == id_periodo
    ).first()

    if not cuenta:
        return schemas.ResumenCuentaOut(total_cargos=0, total_abonos=0, balance=0, movimientos=[])

    # 2. Buscar todos los movimientos uniendo con CodigoDetalle para saber el tipo
    movimientos_db = db.query(
        models.Movimiento,
        models.CodigoDetalle.descripcion.label("nombre_codigo"),
        models.CodigoDetalle.grupo.label("tipo_movimiento")
    ).join(
        models.CodigoDetalle, models.Movimiento.id_codigo_detalle == models.CodigoDetalle.id_codigo_detalle
    ).filter(
        models.Movimiento.id_cuenta_corriente == cuenta.id_cuenta
    ).order_by(models.Movimiento.numero_secuencia.desc()).all()

    # 3. Calcular totales
    total_cargos = 0
    total_abonos = 0
    movs_out = []

    for mov, nombre, tipo in movimientos_db:
        if tipo == "COBRO":
            total_cargos += mov.valor
        elif tipo == "PAGO":
            total_abonos += mov.valor
        
        movs_out.append(schemas.MovimientoOut(
            id_cuenta_corriente = mov.id_cuenta_corriente,
            numero_secuencia = mov.numero_secuencia,
            id_codigo_detalle = mov.id_codigo_detalle,
            id_origen = mov.id_origen,
            tipo_origen = mov.tipo_origen,
            fecha_movimiento = mov.fecha_movimiento,
            descripcion_adicional = mov.descripcion_adicional,
            valor = mov.valor,
            nombre_codigo = nombre,
            tipo_movimiento = tipo
        ))

    return schemas.ResumenCuentaOut(
        total_cargos = total_cargos,
        total_abonos = total_abonos,
        balance = total_cargos - total_abonos,
        movimientos = movs_out
    )
