from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import auth

Base.metadata.create_all(bind=engine) # Create tables if don't exist

app  = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Front end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Router
app.include_router(auth.router)

@app.get("/")
def root():
    return {"mensaje": "API ON"}
