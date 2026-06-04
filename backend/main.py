from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import analysis, auth, users


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Las tablas ya existen en PostgreSQL (usuarios, analisis_urls, etc.)
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
app.include_router(analysis.router)


@app.get("/")
def root():
    return {"name": "SafeLink API", "status": "ok"}


@app.get("/health")
def health():
    return {"status": "healthy"}
