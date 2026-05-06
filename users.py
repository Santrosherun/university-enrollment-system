from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import exists
from sqlalchemy.orm import Session

import database
import models
import auth
import schemas

router = APIRouter(prefix="/users")


# ENDPOINTS
@router.get("/")
def get_users(current_user: models.User = Depends(auth.require_role(models.Role.ADMINISTRATOR)), db: Session = Depends(database.get_db)):
    return db.query(models.User).all()


@router.get("/{user_id}", response_model= schemas.UserOut)
def get_user(
        user_id: int, 
        current_user: models.User = Depends(auth.require_role(models.Role.ADMINISTRATOR)), 
        db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    return user


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(
        user_id: int,
        data: schemas.UserUpdate,
        current_user: models.User = Depends(auth.require_role(models.Role.ADMINISTRATOR)),
        db: Session = Depends(database.get_db)
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "User not found")
    
    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        exists = db.query(models.User).filter(models.User.email == data.email).first()
        if exists:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Email already exists")
        user.email = data.email
    if data.role is not None:
        user.role = data.role

    db.commit()
    db.refresh(user)
    return user








