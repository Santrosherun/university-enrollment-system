from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import auth
import codigos_detalle
import database
import users


database.Base.metadata.create_all(bind=database.engine) # Create tables if don't exist

app  = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], # Front end
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(codigos_detalle.router)


@app.get("/")
def root():
    return {"mensaje": "API ON"}
