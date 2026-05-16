# Sistema de Gestión de Matrículas Universitarias

Este es un sistema integral para la gestión académica y financiera de una institución de educación superior. Permite la administración de programas, periodos, estudiantes, inscripciones y la generación/recaudo de volantes de pago.

## 🌐 Despliegue

El sistema se encuentra desplegado y operativo en las siguientes plataformas:

- **Frontend (Vercel)**: [university-enrollment-system.vercel.app](https://university-enrollment-system.vercel.app/)

- **Backend (Railway)**: [university-enrollment-backend.railway.app](https://tu-api-en-railway.railway.app)

- **Repositorio (GitHub)**: [github.com/Santrosherun/university-enrollment-system](https://github.com/Santrosherun/university-enrollment-system)

---

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 14, Tailwind CSS, JavaScript (ES6+).
- **Backend**: FastAPI (Python 3.10+), SQLAlchemy (ORM).
- **Base de Datos**: PostgreSQL.
- **Generación de PDF**: WeasyPrint.

---

## 🛠️ Requisitos e Instalación

### 1. Requisitos de Sistema (Importante para WeasyPrint)
El sistema utiliza **WeasyPrint** para generar volantes en PDF. Esta librería requiere que el sistema operativo tenga instaladas ciertas librerías de renderizado (GTK+):

- **Windows**: Debes instalar [GTK for Windows Runtime](https://github.com/tschoonj/GTK-for-Windows-Runtime-Environment-Installer/releases). Asegúrate de marcar la opción para agregar las librerías al `PATH` del sistema.
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt-get install build-essential python3-dev python3-pip python3-setuptools python3-wheel python3-cffi libcairo2 libpango-1.0-0 libpangocairo-1.0-0 libgdk-pixbuf2.0-0 libffi-dev shared-mime-info
  ```

### 2. Configuración del Backend
1. Entra a la carpeta del backend: `cd Backend`
2. Crea un entorno virtual: `python -m venv .venv`
3. Activa el entorno:
   - Windows: `.venv\Scripts\activate`
   - Linux: `source .venv/bin/activate`
4. Instala las dependencias: `pip install -r requirements.txt`
5. Configura el archivo `.env` con tus credenciales de base de datos:
   ```env
   DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_db
   SECRET_KEY=tu_llave_secreta_aqui
   RESEND_API_KEY=tu_api_key_de_resend
   ```
6. Inicia el servidor: `uvicorn main:app --reload`

### 3. Configuración del Frontend
1. Entra a la carpeta del frontend: `cd Frontend`
2. Instala las dependencias: `npm install`
3. Configura el archivo `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```
4. Inicia el modo desarrollo: `npm run dev`

---

## 📂 Estructura del Proyecto

- `/Frontend`: Aplicación Next.js con rutas protegidas por roles (ADMIN, SUPERVISOR, ASISTENTE).
- `/Backend`: API REST con FastAPI.
  - `/routers`: Lógica por módulos (Usuarios, Volantes, Reportes, etc.).
  - `/models.py`: Definición de la base de datos.
  - `/utils`: Generador de PDFs y otros servicios.

## 🔐 Roles del Sistema
- **Administrador**: Control total, gestión de usuarios, periodos y reglas de cobro.
- **Supervisor**: Acceso a reportes financieros y auditoría.
- **Asistente**: Gestión de estudiantes, inscripciones y recaudo de caja.

---
© 2026 - University Enrollment System
