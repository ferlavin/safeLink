from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database.migrations import ensure_schema
from database.session import Base, engine
from models import analysis as _analysis_models  # noqa: F401
from models import enlace as _enlace_models  # noqa: F401
from models import escaneo as _escaneo_models  # noqa: F401
from models import historial_login as _historial_login_models  # noqa: F401
from models import reporte as _reporte_models  # noqa: F401
from models import reporte_mensaje as _reporte_mensaje_models  # noqa: F401
from models import search_event as _search_event_models  # noqa: F401
from models import user as _user_models  # noqa: F401
from models import usage_event as _usage_event_models  # noqa: F401
from models import encuesta as _encuesta_models  # noqa: F401
from models import encuesta_pregunta as _encuesta_pregunta_models  # noqa: F401
from models import encuesta_respuesta as _encuesta_respuesta_models  # noqa: F401
from routes import account, analysis, auth, encuestas, enlaces, reportes, stats, users
from services.avatar_service import AVATAR_DIR, ensure_avatar_dir
from services.report_screenshot import REPORTS_DIR, ensure_reports_dir


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_schema()
    ensure_avatar_dir()
    ensure_reports_dir()
    yield


app = FastAPI(title="SafeLink API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(account.router)
app.include_router(users.router)
app.include_router(enlaces.router)
app.include_router(reportes.router)
app.include_router(encuestas.router)
app.include_router(analysis.router)
app.include_router(stats.router)
app.include_router(stats.admin_router)

ensure_avatar_dir()
ensure_reports_dir()
app.mount("/uploads/avatars", StaticFiles(directory=AVATAR_DIR), name="avatars")
app.mount("/uploads/reports", StaticFiles(directory=REPORTS_DIR), name="report-screenshots")


@app.get("/")
def root():
    return {"name": "SafeLink API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
