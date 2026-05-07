from pydantic import BaseModel
from typing import Optional


# Data schemas used for POST data validation

# USERS
class UsuarioCreate(BaseModel):
    # Datos de persona
    tipo_documento   : str
    numero_documento : str
    primer_nombre    : str
    segundo_nombre   : Optional[str] = None
    primer_apellido  : str
    segundo_apellido : Optional[str] = None
    correo_personal  : str
    telefono_contacto: Optional[str] = None
    # Datos de usuario
    username            : str
    password            : str
    correo_notificacion : str
    nombre_rol          : str   # "ADMINISTRADOR", "SUPERVISOR", "ASISTENTE"

    # Campo secreto para crear cuenta de administrador la primera vez
    admin_secret: Optional[str] = None


class UsuarioOut(BaseModel):
    id_usuario  : int
    username    : str
    estado      : str
    correo_notificacion: str
    nombre_rol  : str
    primer_nombre   : str
    primer_apellido : str
    correo_personal : str
 
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    primer_nombre       : Optional[str] = None
    primer_apellido     : Optional[str] = None
    username            : Optional[str] = None
    correo_personal     : Optional[str] = None
    correo_notificacion : Optional[str] = None
    telefono_contacto   : Optional[str] = None
    nombre_rol          : Optional[str] = None
 
class PasswordUpdate(BaseModel):
    new_password: str
 
#--------------------------------


# AUTH
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UsuarioOut



