# SafeLink - Documentacion del MVP

Plataforma de inteligencia de amenazas digitales. Este documento cubre el setup
local y el despliegue del MVP (autenticacion JWT, CRUD de usuarios con roles,
dashboard diferenciado por rol).

## Estructura del proyecto

```
safelink/
├── frontend/        # React + Vite + Tailwind + React Router + Axios
├── backend/         # FastAPI + SQLAlchemy + JWT
├── docs/            # Documentacion
└── docker-compose.yml   # PostgreSQL para desarrollo
```

## Requisitos

- Node.js 20+ y npm
- Python 3.11+
- Docker (opcional, para PostgreSQL local) o un PostgreSQL accesible

## 1. Base de datos (PostgreSQL)

Opcion A - Docker (recomendado para desarrollo):

```bash
docker compose up -d
```

Esto levanta PostgreSQL en `localhost:5432` con usuario/clave/base `safelink`.

Opcion B - PostgreSQL propio: crea una base y ajusta `DATABASE_URL` en el `.env`
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
- Documentacion interactiva (Swagger): http://localhost:8000/docs
- Al arrancar se crean las tablas y un usuario admin inicial
  (`ADMIN_EMAIL` / `ADMIN_PASSWORD`, por defecto `admin@safelink.app` / `admin1234`).

### Endpoints principales

| Metodo | Ruta             | Descripcion                         | Acceso |
| ------ | ---------------- | ----------------------------------- | ------ |
| POST   | /auth/register   | Registro publico (rol usuario)      | Libre  |
| POST   | /auth/login      | Login, devuelve JWT                  | Libre  |
| GET    | /auth/me         | Datos del usuario autenticado       | Token  |
| GET    | /users           | Listar usuarios                     | Admin  |
| POST   | /users           | Crear usuario                       | Admin  |
| GET    | /users/{id}      | Obtener usuario                     | Admin  |
| PUT    | /users/{id}      | Editar usuario                      | Admin  |
| DELETE | /users/{id}      | Eliminar usuario                    | Admin  |

## 3. Frontend (React + Vite)

```bash
cd frontend
npm install
copy .env.example .env       # Windows  (cp en Linux/macOS)
npm run dev
```

- App: http://localhost:5173
- `VITE_API_URL` debe apuntar al backend (por defecto http://localhost:8000).

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
| DATABASE_URL                 | Cadena de conexion a PostgreSQL      |
| JWT_SECRET                   | Clave secreta para firmar los JWT    |
| JWT_ALGORITHM                | Algoritmo JWT (HS256)                |
| ACCESS_TOKEN_EXPIRE_MINUTES  | Minutos de validez del token         |
| FRONTEND_ORIGIN              | Origen(es) permitido(s) para CORS    |
| ADMIN_EMAIL / ADMIN_PASSWORD | Credenciales del admin inicial       |

### frontend/.env

| Variable     | Descripcion              |
| ------------ | ------------------------ |
| VITE_API_URL | URL base del backend API |
