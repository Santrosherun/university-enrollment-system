from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
import schemas
import database
import models
from routers import auth

router = APIRouter(prefix="/pagos")

@router.get("/", response_model=list[schemas.PagoOut])
def get_pagos(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    return db.query(models.Pago).all()

@router.post("/", response_model=schemas.PagoOut, status_code=201)
def create_pago(
    data: schemas.PagoCreate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"))
):
    # 1. Validar que el volante existe
    volante = db.query(models.VolanteMatricula).filter(models.VolanteMatricula.id_volante == data.id_volante_matricula).first()
    if not volante:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Volante de matrícula no encontrado")

    if volante.estado == "PAGADO":
         raise HTTPException(status.HTTP_400_BAD_REQUEST, "Este volante ya se encuentra pagado en su totalidad")

    # 2. Calcular el total facturado en el volante
    total_facturado = db.query(func.sum(models.DetalleVolante.cantidad * models.DetalleVolante.valor_unitario)).filter(
        models.DetalleVolante.id_volante_matricula == volante.id_volante
    ).scalar() or 0

    # 3. Calcular cuánto se ha pagado hasta ahora (pagos aprobados)
    total_pagado_previamente = db.query(func.sum(models.Pago.valor_pagado)).filter(
        models.Pago.id_volante_matricula == volante.id_volante,
        models.Pago.estado_pago == "APROBADO"
    ).scalar() or 0

    nuevo_total_pagado = total_pagado_previamente + data.valor_pagado

    # 4. Determinar si el pago es TOTAL o PARCIAL
    tipo_pago = "PARCIAL"
    if nuevo_total_pagado >= total_facturado:
        tipo_pago = "TOTAL"
        volante.estado = "PAGADO"
    else:
        volante.estado = "GENERADO" # Mantenemos el estado generado hasta que se complete

    # 5. Crear el registro del pago
    pago = models.Pago(
        valor_pagado = data.valor_pagado,
        estado_pago = "APROBADO",
        referencia_pago = data.referencia_pago,
        canal_pago = data.canal_pago,
        tipo_pago = tipo_pago,
        id_volante_matricula = data.id_volante_matricula,
        id_usuario = current_user.id_usuario
    )
    db.add(pago)
    db.flush()

    # 6. Registrar movimiento en Cuenta Corriente
    cuenta = db.query(models.CuentaCorriente).filter(
        models.CuentaCorriente.id_estudiante == volante.id_estudiante,
        models.CuentaCorriente.id_periodo == volante.id_periodo
    ).first()

    if cuenta:
        max_sec = db.query(func.max(models.Movimiento.numero_secuencia)).filter(
            models.Movimiento.id_cuenta_corriente == cuenta.id_cuenta
        ).scalar() or 0

        # Código de detalle para 'Pago de Matrícula' (asumimos PAG-MAT o similar)
        codigo_pago = db.query(models.CodigoDetalle).filter(models.CodigoDetalle.codigo == "PAG").first()
        if not codigo_pago:
             raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "No se ha configurado el Código de Detalle con código 'PAG' para Recaudos")

        movimiento = models.Movimiento(
            id_cuenta_corriente = cuenta.id_cuenta,
            numero_secuencia = max_sec + 1,
            id_codigo_detalle = codigo_pago.id_codigo_detalle,
            id_origen = pago.id_pago,
            tipo_origen = "PAGO",
            valor = data.valor_pagado,
            descripcion_adicional = f"Pago recibido ref: {data.referencia_pago} - Canal: {data.canal_pago}"
        )
        db.add(movimiento)

    db.commit()
    db.refresh(pago)
    return pago
