import os
from fastapi import APIRouter, Depends, HTTPException, status
from dotenv import load_dotenv
import bcrypt
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session


import models
import database
import schemas


load_dotenv()

SECRET_KEY = str(os.getenv("SECRET_KEY"))
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter(prefix="/auth")
#------------


# Functions
def hash_password(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain, hashed):
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MIN)

    updated_data = data.copy()
    updated_data.update({"exp": expire})
    encoded_jwt = jwt.encode(updated_data, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)) -> models.User:
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None or not bool(user.active):
        raise credentials_exception

    return user


def require_role(*roles: models.Role):
    def dependency(user: models.User = Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Role not valid")
        return user
    return dependency

# ------------------

# ENDPOINTS
@router.post("/register", response_model=schemas.UserOut, status_code=201)
def register(data: schemas.UserCreate, db : Session = Depends(database.get_db)):

    # Verify if email already exists
    exists = db.query(models.User).filter(models.User.email == data.email).first()

    if exists:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already registered")

    user = models.User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role
    )

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.Token)
def login(data: OAuth2PasswordRequestForm = Depends(), db : Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == data.username).first() # FASTAPI uses username (OAUTH2 convention), but we are getting email
    
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password")

    if not bool(user.active):
       raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User is not active")

    token = create_access_token(data={"sub": user.email, "role": user.role})
    
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me")
def me(user: models.User = Depends(get_current_user)):
    return user

