# SafeLink

Plataforma de inteligencia de amenazas digitales enfocada en ciberseguridad
para el contexto argentino e hispanoamericano (deteccion de phishing,
typosquatting y ataques dirigidos a marcas locales).

Este repositorio contiene el **MVP**: autenticacion JWT, CRUD de usuarios con
roles (admin / usuario) sobre PostgreSQL, y un dashboard diferenciado por rol.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + React Router + Axios
- **Backend:** FastAPI + SQLAlchemy + JWT (passlib/bcrypt)
- **Base de datos:** PostgreSQL

## Estructura

```
safelink/
├── frontend/   # SPA React (Vite)
├── backend/    # API FastAPI
├── extension/  # Extension Google Chrome (semaforo de URLs)
├── docs/       # Documentacion y guia de despliegue
└── docker-compose.yml
```

## Inicio rapido

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload

# 3. Frontend (en otra terminal)
cd frontend
npm install
copy .env.example .env
npm run dev
```

Mas detalles, endpoints y despliegue en [docs/README.md](docs/README.md).

## Extension Chrome

Semaforo de seguridad en la barra del navegador. Ver [docs/extension-chrome.md](docs/extension-chrome.md).
