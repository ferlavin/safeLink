# SafeLink

MVP: un semáforo (verde / amarillo / rojo) **antes de hacer clic**.
Extensión de Chrome + análisis de URL. Pensado para WhatsApp, home banking y
marcas locales (AR). No es un producto Enterprise ni un radar mundial.

## Qué hace

- **Semáforo** en la web (`/analyze`) y en la barra de Chrome.
- **Extensión:** aviso en la pestaña actual y puntos de color en Google (.com / .ar). Avisa; no bloquea la navegación.
- **Cuenta opcional para historial:** Mis enlaces y reportes. Sin cuenta, el check de la extensión no se guarda.
- Un flujo feliz: pegar un enlace. PDF / Web3 son acciones secundarias, no el producto.

## Stack

- **Frontend:** React (JSX) + Vite + Tailwind
- **Backend:** FastAPI + SQLAlchemy + JWT
- **Base de datos:** PostgreSQL
- **Extensión:** Chrome Manifest V3

## Estructura

```
safelink/
├── frontend/   # SPA
├── backend/    # API + tests de calibración
├── extension/  # Semáforo en Chrome
├── docs/       # Setup y despliegue
└── docker-compose.yml   # PostgreSQL local (no usar en prod)
```

## Inicio rápido

```bash
# 1. Base de datos (user/pass/db: safelink — solo local)
docker compose up -d

# 2. Backend
cd backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload

# 3. Frontend (otra terminal)
cd frontend
npm install
copy .env.example .env
npm run dev
```

La extensión se carga en `chrome://extensions` (modo desarrollador) desde la carpeta `extension/`. Guía en la app: `/extension`.

## Tests

Desde `backend/`:

```bash
python -m pytest
python -m scripts.calibrate   # tabla URL → nivel, a mano
```

Los tests de calibración fijan el semáforo: dominios oficiales en `bajo`, typos obvios en `alto`/`critico`, TLD raro sin marca no `critico`, SSRF sin fetch.

## Persistencia de un análisis

Un scan autenticado escribe tres cosas (ver `backend/services/analysis_service.py`):

| Tabla | Para qué |
| --- | --- |
| `analisis_urls` | Detalle del veredicto |
| `enlaces` / `escaneos` | Mis enlaces |
| `usage_events` | Stats del admin |

No se escribe la IP del scanner en un mapa público.

Más setup y despliegue: [docs/README.md](docs/README.md).
