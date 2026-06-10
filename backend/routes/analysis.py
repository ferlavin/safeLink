import json

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy.orm import Session

from auth.deps import get_current_user, get_optional_user
from database.session import get_db
from models.user import User
from schemas.analysis import (
    DomainAnalysisRequest,
    PageAnalysisRequest,
    ThreatMapResponse,
    HistoryByRiskResponse,
    UrlAnalysisHistoryItem,
    UrlAnalysisRequest,
    UrlAnalysisResult,
    UrlCheckResponse,
)
from services.url_analyzer import analyze_url
from services.user_copy import humanize_detalle, humanize_resumen
from services import analysis_service
from services.dns_osint import analyze_dns_osint
from services.js_analyzer import analyze_page_javascript
from services.pdf_scanner import analyze_pdf
from services.threat_map import build_threat_map
from services.typosquatting_realtime import analyze_typosquatting_realtime
from services.web3_drainer import analyze_web3_drainer
from services.nlp_url_transformer import classify_url_transformer
from services.security_headers import analyze_security_headers
from services.oauth_phishing import analyze_oauth_phishing
from services.double_submit_form import analyze_double_submit

router = APIRouter(prefix="/analysis", tags=["analysis"])

MAX_PDF_SIZE = 10 * 1024 * 1024


def _nivel_to_estado(nivel: str) -> str:
    if nivel == "bajo":
        return "seguro"
    if nivel == "medio":
        return "precaucion"
    return "peligro"


@router.post(
    "/url",
    response_model=UrlAnalysisResult,
    summary="Analizar URL",
    description="Evalua entropia, typosquatting e heuristicas de phishing; guarda el resultado en analisis_urls.",
)
def analyze_url_endpoint(
    data: UrlAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analysis_service.run_and_persist(
        db, current_user, data.url.strip(), request
    )


@router.post(
    "/check",
    response_model=UrlCheckResponse,
    summary="Verificacion rapida (extension Chrome)",
    description="Analiza la URL. Si envias Authorization Bearer, guarda en el historial del usuario.",
)
def check_url_extension(
    data: UrlAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    result = analyze_url(data.url.strip())
    if current_user:
        analysis_service.persist_result(db, current_user, result, request)
    detalle = humanize_detalle(result.get("detalle") or {}) or {}
    resumen = humanize_resumen(detalle.get("resumen", []))[:5]
    return UrlCheckResponse(
        url=result["url"],
        puntuacion_riesgo=result["puntuacion_riesgo"],
        nivel_riesgo=result["nivel_riesgo"],
        estado=_nivel_to_estado(result["nivel_riesgo"]),
        resumen=resumen,
        detalle=detalle,
        guardado_en_historial=current_user is not None,
    )


@router.post(
    "/pdf",
    response_model=UrlAnalysisResult,
    summary="Escanear PDF",
    description="Extrae enlaces del PDF y analiza el riesgo de cada URL encontrada.",
)
async def analyze_pdf_endpoint(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se permiten archivos PDF",
        )
    content = await file.read()
    if len(content) > MAX_PDF_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El PDF supera el limite de 10 MB",
        )
    if not content.startswith(b"%PDF"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo no parece ser un PDF valido",
        )
    try:
        result = analyze_pdf(content, file.filename or "documento.pdf")
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo procesar el PDF: {exc}",
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/page",
    response_model=UrlAnalysisResult,
    summary="Detectar JS ofuscado",
    description="Descarga la pagina y analiza scripts inline en busca de ofuscacion y patrones maliciosos.",
)
async def analyze_page_endpoint(
    data: PageAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await analyze_page_javascript(data.url.strip())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/typosquatting",
    response_model=UrlAnalysisResult,
    summary="Typosquatting en tiempo real",
    description="Compara el dominio actual contra marcas argentinas y dominios oficiales con Levenshtein (ej. bancnacion.com vs banco-nacion.com.ar).",
)
def analyze_typosquatting_endpoint(
    data: UrlAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = analyze_typosquatting_realtime(data.url.strip())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/web3",
    response_model=UrlAnalysisResult,
    summary="Detector crypto drainer",
    description="Detecta paginas Web3 con Connect Wallet y permisos excesivos que podrian drenar fondos.",
)
async def analyze_web3_endpoint(
    data: PageAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await analyze_web3_drainer(data.url.strip())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/dns",
    response_model=UrlAnalysisResult,
    summary="DNS, consistencia y ficha OSINT",
    description="Verifica ASN del IP vs marca esperada, linea de tiempo WHOIS/SSL/listas negras y ficha del dominio.",
)
def analyze_dns_endpoint(
    data: DomainAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = analyze_dns_osint(data.url.strip())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/nlp",
    response_model=UrlAnalysisResult,
    summary="Clasificador NLP de URLs",
    description="Transformer char-level entrenado solo con URLs; aprende patrones de phishing sin consultar APIs.",
)
def analyze_nlp_endpoint(
    data: UrlAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = classify_url_transformer(data.url.strip())
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/headers",
    response_model=UrlAnalysisResult,
    summary="Analizador de security headers",
    description="Evalua HSTS, CSP, X-Frame-Options y otras cabeceras HTTP de seguridad.",
)
async def analyze_headers_endpoint(
    data: PageAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await analyze_security_headers(data.url.strip())
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/oauth",
    response_model=UrlAnalysisResult,
    summary="Detector de OAuth phishing",
    description="Detecta flujos OAuth falsos, redirect_uri sospechosos e imitaciones de login social.",
)
async def analyze_oauth_endpoint(
    data: PageAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await analyze_oauth_phishing(data.url.strip())
    return analysis_service.persist_result(db, current_user, result, request)


@router.post(
    "/forms",
    response_model=UrlAnalysisResult,
    summary="Detector de doble envio en formularios",
    description="Busca formularios que envian credenciales a multiples dominios o con POST paralelo via JS.",
)
async def analyze_forms_endpoint(
    data: PageAnalysisRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await analyze_double_submit(data.url.strip())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
        ) from exc
    return analysis_service.persist_result(db, current_user, result, request)


@router.get(
    "/threat-map",
    response_model=ThreatMapResponse,
    summary="Mapa de amenazas",
    description="Agrega analisis y busquedas con geolocalizacion para el heatmap de actividad.",
)
def threat_map(
    hours: int = 24,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return build_threat_map(db, hours=min(max(hours, 1), 168))


@router.get(
    "/history",
    response_model=list[UrlAnalysisHistoryItem],
    summary="Historial de analisis",
    description="Lista los ultimos analisis realizados por el usuario autenticado.",
)
def analysis_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return analysis_service.list_user_history(db, current_user.id)


@router.get(
    "/history/by-risk",
    response_model=HistoryByRiskResponse,
    summary="Historial por nivel de riesgo",
    description="Historial de URLs web agrupado en bajo, medio y alto (critico incluido en alto).",
)
def analysis_history_by_risk(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    grouped = analysis_service.list_history_by_risk(db, current_user.id)
    return HistoryByRiskResponse(**grouped)


@router.get("/{analysis_id}", response_model=UrlAnalysisResult)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    row = analysis_service.get_analysis(db, analysis_id, current_user.id)
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Analisis no encontrado"
        )
    detalle = None
    if row.explicacion:
        try:
            detalle = json.loads(row.explicacion)
        except json.JSONDecodeError:
            detalle = {"resumen": [row.explicacion]}
    return UrlAnalysisResult(
        id=row.id,
        url=row.url_analizada,
        puntuacion_riesgo=row.puntuacion_riesgo or 0,
        nivel_riesgo=row.nivel_riesgo,
        explicacion=row.explicacion,
        detalle=detalle,
        fecha_analisis=row.fecha_analisis,
    )
