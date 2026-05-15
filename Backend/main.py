from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, codigos_detalle, programas, periodos, estudiantes, reglas_cobro, asignaturas, inscripciones, volantes, pagos, cuentas, reportes, rbac
import database
import models

app  = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
    "https://university-enrollment-system.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(codigos_detalle.router)
app.include_router(programas.router)
app.include_router(periodos.router)
app.include_router(estudiantes.router)
app.include_router(reglas_cobro.router)
app.include_router(asignaturas.router)
app.include_router(inscripciones.router)
app.include_router(volantes.router)
app.include_router(pagos.router)
app.include_router(cuentas.router)
app.include_router(reportes.router)
app.include_router(rbac.router)

# Crear tablas en la base de datos si no existen (ideal para Railway)
models.Base.metadata.create_all(bind=database.engine)


@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de UniEnroll"}
