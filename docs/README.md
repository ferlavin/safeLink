# SafeLink - Documentación del MVP

Semáforo de enlaces (extensión + análisis de URL). Este documento cubre el
setup local y el despliegue. No hay planes Enterprise ni CRUD como producto.

## Estructura del proyecto

```
safelink/
├── frontend/        # React + Vite
├── backend/         # FastAPI + tests
├── extension/       # Chrome MV3
├── docs/            # Documentación
└── docker-compose.yml   # PostgreSQL para desarrollo local
```

## Requisitos

- Node.js 20+ y npm
- Python 3.11+
- Docker (opcional, para PostgreSQL local) o un PostgreSQL accesible

## 1. Base de datos (PostgreSQL)

Opción A - Docker (recomendado para desarrollo):

```bash
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` con usuario/clave/base `safelink`.
**Solo local.** No uses esas credenciales en producción.

Opción B - PostgreSQL propio: crea una base y ajusta `DATABASE_URL` en el `.env`
del backend.

## 2. Backend (FastAPI)

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
copy .env.example .env       # Windows  (usa: cp .env.example .env en Linux/macOS)

uvicorn main:app --reload
```

- API: http://localhost:8000
- Documentación interactiva (Swagger): http://localhost:8000/docs
- Al arrancar se crean las tablas y un usuario admin inicial
  (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, por defecto `admin@safelink.app` / `admin1234`).
  Esos defaults no se permiten si `ENV` no es development.

### Tests

```bash
cd backend
python -m pytest
python -m scripts.calibrate
```

### Endpoints principales

| Método | Ruta                | Descripción                         | Acceso |
| ------ | ------------------- | ----------------------------------- | ------ |
| POST   | /auth/register      | Registro                            | Libre  |
| POST   | /auth/login         | Login, JWT                          | Libre  |
| GET    | /auth/me            | Usuario autenticado                 | Token  |
| POST   | /analysis/url       | Análisis de enlace (semáforo)       | Token  |
| POST   | /analysis/check     | Check liviano (extensión)           | Opcional |
| GET    | /users              | Listar usuarios                     | Admin  |

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
copy .env.example .env       # Windows  (cp en Linux/macOS)
npm run dev
```

- App: http://localhost:5173
- En desarrollo Vite proxy `/api` → backend. `VITE_API_URL` vacío está bien en local.


## 4. Despliegue

### Frontend en Vercel

- Importa el repo y selecciona `frontend/` como Root Directory.
- Framework: Vite. Build: `npm run build`. Output: `dist`.
- Variable de entorno: `VITE_API_URL` = URL publica del backend.
- `frontend/vercel.json` ya incluye los rewrites para SPA.

### Backend en Render

- Render detecta `render.yaml` (Blueprint). Define las variables:
  `DATABASE_URL`, `FRONTEND_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- `JWT_SECRET` se genera automaticamente.
- Alternativa Railway: usa `backend/Procfile`
  (`uvicorn main:app --host 0.0.0.0 --port $PORT`).

### Base de datos en la nube

- Supabase o Railway: crea una instancia PostgreSQL y copia la cadena de
  conexion en `DATABASE_URL` (formato `postgresql+psycopg2://...`).

## Variables de entorno

### backend/.env

| Variable                     | Descripcion                          |
| ---------------------------- | ------------------------------------ |
| DATABASE_URL                 | PostgreSQL. Local: user/pass safelink (no prod) |
| CHROME_EXTENSION_ID          | ID(s) de la extensión para CORS                 |
| JWT_SECRET                   | Clave secreta para firmar los JWT    |
| JWT_ALGORITHM                | Algoritmo JWT (HS256)                |
| ACCESS_TOKEN_EXPIRE_MINUTES  | Minutos de validez del token         |
| FRONTEND_ORIGIN              | Origen(es) permitido(s) para CORS    |
| ADMIN_EMAIL / ADMIN_PASSWORD | Credenciales del admin inicial       |

### frontend/.env

| Variable     | Descripcion              |
| ------------ | ------------------------ |
| VITE_API_URL | URL base del backend API |
