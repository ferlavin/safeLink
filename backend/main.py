from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database.session import Base, engine
from models import analysis as _analysis_models  # noqa: F401
from models import enlace as _enlace_models  # noqa: F401
from models import escaneo as _escaneo_models  # noqa: F401
from models import historial_login as _historial_login_models  # noqa: F401
from models import reporte as _reporte_models  # noqa: F401
from models import search_event as _search_event_models  # noqa: F401
from models import user as _user_models  # noqa: F401
from routes import analysis, auth, enlaces, reportes, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Crea las tablas en Supabase si todavia no existen (usuarios, analisis_urls, etc.)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="SafeLink API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Vite puede usar 5173, 5174, etc. si el puerto esta ocupado
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):\d+|chrome-extension://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(enlaces.router)
app.include_router(reportes.router)
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"name": "SafeLink API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
