from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer, Boolean, Enum
from database import Base
import enum 


class Role(str, enum.Enum):
    ADMINISTRATOR = "ADMINISTRATOR"
    SUPERVISOR = "SUPERVISOR"
    ASSISTANT = "ASSISTANT"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
