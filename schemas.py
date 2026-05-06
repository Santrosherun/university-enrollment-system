from pydantic import BaseModel
from typing import Optional

from models import Role

# Data schemas used for POST data validation

# USERS
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: Role
 
class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: Role
    active: bool
 
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[Role] = None

class PasswordUpdate(BaseModel):
    new_password: str

#--------------------------------

# AUTH
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut



