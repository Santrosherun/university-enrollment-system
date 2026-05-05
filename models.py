from sqlalchemy import Column, Integer, String, Boolean, Enum
from database import Base
import enum 


class Role(str, enum.Enum):
    ADMINISTRATOR = "ADMINISTRATOR"
    SUPERVISOR = "SUPERVISOR"
    ASSISTANT = "ASSISTANT"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(Role), nullable=False)
    active = Column(Boolean, default=True)


