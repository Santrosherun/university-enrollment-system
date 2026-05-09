# Backend Deployment

### 1. Clone repo branch and cd to folder
```bash
git clone --single-branch --branch backend/alfredo https://github.com/Santrosherun/university-enrollment-system.git
cd university-enrollment-system
```
### 2. Install requierements
```bash
pip install -r requirements.txt
```
### 3. Make sure postgreSQL instance is running and create database

```bash
sudo -u postgres psql
```
 
```sql
CREATE DATABASE matriculas_db;
\q
```

### 4. Create .env file with following content (change according your credentials)
```env
DATABASE_URL=postgresql://postgres:tu_contraseña@localhost:5432/matriculas_db
SECRET_KEY=una_clave_secreta_larga_y_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 5. Run server
```bash
uvicorn main:app --reload
```
