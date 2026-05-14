from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import database
import models
import schemas
from routers import auth

router = APIRouter(prefix="/rbac")

@router.get("/roles", response_model=List[schemas.RolOut])
def get_roles(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR"))
):
    """
    Obtiene el listado de todos los roles del sistema disponibles para parametrizar.
    """
    return db.query(models.Rol).order_by(models.Rol.id_rol).all()

def seed_menus_if_empty(db: Session):
    if db.query(models.Menu).count() == 0:
        nombres = [
            ("Dashboard", "/"),
            ("Usuarios y Roles", "/usuarios"),
            ("Matrícula de Estudiantes", "/estudiantes"),
            ("Estructura Académica", "/programas"),
            ("Gestión de Periodos", "/periodos"),
            ("Generación de Volantes", "/cobros"),
            ("Recaudos y Pagos", "/pagos"),
            ("Estado de Cuenta", "/cuenta-corriente"),
            ("Reportes Estadísticos", "/reportes"),
            ("Matriz RBAC", "/permisos")
        ]
        for idx, (nom, r) in enumerate(nombres, start=1):
            db.add(models.Menu(nombre_menu=nom, descripcion=f"Acceso al módulo de {nom}", ruta=r, orden=idx))
        db.commit()

@router.get("/menus", response_model=List[schemas.MenuOut])
def get_menus(
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR"))
):
    """
    Obtiene el listado completo de menús registrados en la platforma.
    """
    seed_menus_if_empty(db)
    return db.query(models.Menu).order_by(models.Menu.orden).all()

@router.get("/permisos/{id_rol}", response_model=List[schemas.PermisoOut])
def get_permisos_rol(
    id_rol: int,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR"))
):
    """
    Devuelve la matriz completa de permisos para un rol específico.
    Cruza todos los menús activos con los permisos configurados para asegurar
    que la vista del frontend tenga una fila para cada menú existente.
    """
    seed_menus_if_empty(db)
    rol = db.query(models.Rol).filter(models.Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(404, "El rol especificado no existe")

    menus = db.query(models.Menu).order_by(models.Menu.orden).all()
    permisos_existentes = {p.id_menu: p for p in db.query(models.Permiso).filter(models.Permiso.id_rol == id_rol).all()}

    resultado = []
    for m in menus:
        p = permisos_existentes.get(m.id_menu)
        if p:
            resultado.append(schemas.PermisoOut(
                id_menu=m.id_menu,
                id_rol=id_rol,
                puede_ver=p.puede_ver,
                puede_crear=p.puede_crear,
                puede_editar=p.puede_editar,
                puede_eliminar=p.puede_eliminar,
                menu_nombre=m.nombre_menu,
                menu_ruta=m.ruta
            ))
        else:
            resultado.append(schemas.PermisoOut(
                id_menu=m.id_menu,
                id_rol=id_rol,
                puede_ver=False,
                puede_crear=False,
                puede_editar=False,
                puede_eliminar=False,
                menu_nombre=m.nombre_menu,
                menu_ruta=m.ruta
            ))

    return resultado

@router.post("/permisos/{id_rol}")
def update_permisos_rol(
    id_rol: int,
    payload: schemas.PermisoBatchUpdate,
    db: Session = Depends(database.get_db),
    current_user: models.Usuario = Depends(auth.require_role("ADMINISTRADOR"))
):
    """
    Actualiza masivamente los permisos de un rol sobre la matriz de menús.
    """
    rol = db.query(models.Rol).filter(models.Rol.id_rol == id_rol).first()
    if not rol:
        raise HTTPException(404, "El rol especificado no existe")

    # Mapear permisos existentes
    permisos_db = {p.id_menu: p for p in db.query(models.Permiso).filter(models.Permiso.id_rol == id_rol).all()}

    actualizados = 0
    creados = 0

    for item in payload.permisos:
        p = permisos_db.get(item.id_menu)
        if p:
            p.puede_ver = item.puede_ver
            p.puede_crear = item.puede_crear
            p.puede_editar = item.puede_editar
            p.puede_eliminar = item.puede_eliminar
            actualizados += 1
        else:
            nuevo_permiso = models.Permiso(
                id_menu=item.id_menu,
                id_rol=id_rol,
                puede_ver=item.puede_ver,
                puede_crear=item.puede_crear,
                puede_editar=item.puede_editar,
                puede_eliminar=item.puede_eliminar
            )
            db.add(nuevo_permiso)
            creados += 1

    db.commit()
    return {"message": f"Matriz de permisos guardada exitosamente ({creados} creados, {actualizados} actualizados)."}
