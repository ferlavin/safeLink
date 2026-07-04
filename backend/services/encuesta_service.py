import json
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from models.encuesta import Encuesta
from models.encuesta_pregunta import EncuestaPregunta
from models.encuesta_respuesta import EncuestaRespuesta
from models.user import User
from schemas.encuesta import (
    EncuestaActivaOut,
    EncuestaCreate,
    EncuestaDetailOut,
    EncuestaOut,
    EncuestaStatsDetail,
    EncuestasStatsSummary,
    EncuestaStatsSummaryItem,
    EncuestaUpdate,
    OpcionStat,
    PreguntaOut,
    PreguntaStat,
    RespuestaItem,
    RespuestaOut,
    RespuestaSubmit,
)


def _parse_opciones(raw: str | None) -> list[str] | None:
    if not raw:
        return None
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else None
    except json.JSONDecodeError:
        return None


def _dump_opciones(opciones: list[str] | None) -> str | None:
    if not opciones:
        return None
    return json.dumps(opciones, ensure_ascii=False)


def _parse_respuestas(raw: str) -> list[RespuestaItem]:
    try:
        data = json.loads(raw)
        return [RespuestaItem.model_validate(item) for item in data]
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Respuesta almacenada invalida",
        ) from exc


def _get_encuesta_or_404(db: Session, encuesta_id: int) -> Encuesta:
    row = db.query(Encuesta).filter(Encuesta.id == encuesta_id).first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Encuesta no encontrada"
        )
    return row


def _get_preguntas(db: Session, encuesta_id: int) -> list[EncuestaPregunta]:
    return (
        db.query(EncuestaPregunta)
        .filter(EncuestaPregunta.encuesta_id == encuesta_id)
        .order_by(EncuestaPregunta.orden.asc(), EncuestaPregunta.id.asc())
        .all()
    )


def _serialize_pregunta(row: EncuestaPregunta) -> PreguntaOut:
    return PreguntaOut(
        id=row.id,
        texto=row.texto,
        tipo=row.tipo,
        opciones=_parse_opciones(row.opciones),
        orden=row.orden,
    )


def _counts(db: Session, encuesta_id: int) -> tuple[int, int]:
    preguntas = (
        db.query(func.count(EncuestaPregunta.id))
        .filter(EncuestaPregunta.encuesta_id == encuesta_id)
        .scalar()
        or 0
    )
    respuestas = (
        db.query(func.count(EncuestaRespuesta.id))
        .filter(EncuestaRespuesta.encuesta_id == encuesta_id)
        .scalar()
        or 0
    )
    return preguntas, respuestas


def _serialize_encuesta(db: Session, row: Encuesta) -> EncuestaOut:
    preguntas_count, respuestas_count = _counts(db, row.id)
    return EncuestaOut(
        id=row.id,
        titulo=row.titulo,
        activa=row.activa,
        creado_por=row.creado_por,
        fecha_creacion=row.fecha_creacion,
        preguntas_count=preguntas_count,
        respuestas_count=respuestas_count,
    )


def _serialize_detail(db: Session, row: Encuesta) -> EncuestaDetailOut:
    base = _serialize_encuesta(db, row)
    preguntas = [_serialize_pregunta(p) for p in _get_preguntas(db, row.id)]
    return EncuestaDetailOut(**base.model_dump(), preguntas=preguntas)


def _replace_preguntas(db: Session, encuesta_id: int, preguntas_data) -> None:
    db.query(EncuestaPregunta).filter(
        EncuestaPregunta.encuesta_id == encuesta_id
    ).delete()
    for index, pregunta in enumerate(preguntas_data):
        db.add(
            EncuestaPregunta(
                encuesta_id=encuesta_id,
                texto=pregunta.texto.strip(),
                tipo=pregunta.tipo,
                opciones=_dump_opciones(pregunta.opciones),
                orden=index,
            )
        )


def list_all_encuestas(db: Session) -> list[EncuestaOut]:
    rows = (
        db.query(Encuesta)
        .order_by(Encuesta.fecha_creacion.desc(), Encuesta.id.desc())
        .all()
    )
    return [_serialize_encuesta(db, row) for row in rows]


def create_encuesta(db: Session, admin_id: int, data: EncuestaCreate) -> EncuestaDetailOut:
    row = Encuesta(
        titulo=data.titulo.strip(),
        activa=data.activa,
        creado_por=admin_id,
        fecha_creacion=datetime.now(timezone.utc),
    )
    db.add(row)
    db.flush()
    _replace_preguntas(db, row.id, data.preguntas)
    db.commit()
    db.refresh(row)
    return _serialize_detail(db, row)


def update_encuesta(
    db: Session, encuesta_id: int, data: EncuestaUpdate
) -> EncuestaDetailOut:
    row = _get_encuesta_or_404(db, encuesta_id)
    if data.titulo is not None:
        row.titulo = data.titulo.strip()
    if data.activa is not None:
        row.activa = data.activa
    if data.preguntas is not None:
        respuestas_count = (
            db.query(func.count(EncuestaRespuesta.id))
            .filter(EncuestaRespuesta.encuesta_id == encuesta_id)
            .scalar()
            or 0
        )
        if respuestas_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se pueden editar preguntas de una encuesta con respuestas",
            )
        _replace_preguntas(db, encuesta_id, data.preguntas)
    db.commit()
    db.refresh(row)
    return _serialize_detail(db, row)


def set_encuesta_activa(db: Session, encuesta_id: int, activa: bool) -> EncuestaOut:
    row = _get_encuesta_or_404(db, encuesta_id)
    row.activa = activa
    db.commit()
    db.refresh(row)
    return _serialize_encuesta(db, row)


def get_encuesta_detail(
    db: Session, encuesta_id: int, user: User, is_admin: bool
) -> EncuestaDetailOut:
    row = _get_encuesta_or_404(db, encuesta_id)
    if not is_admin and not row.activa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Encuesta no encontrada"
        )
    return _serialize_detail(db, row)


def list_active_encuestas(db: Session, user_id: int) -> list[EncuestaActivaOut]:
    rows = (
        db.query(Encuesta)
        .filter(Encuesta.activa.is_(True))
        .order_by(Encuesta.fecha_creacion.desc(), Encuesta.id.desc())
        .all()
    )
    responded_rows = (
        db.query(EncuestaRespuesta)
        .filter(EncuestaRespuesta.usuario_id == user_id)
        .all()
    )
    responded_ids = {r.encuesta_id for r in responded_rows}
    result = []
    for row in rows:
        preguntas_count, _ = _counts(db, row.id)
        result.append(
            EncuestaActivaOut(
                id=row.id,
                titulo=row.titulo,
                fecha_creacion=row.fecha_creacion,
                preguntas_count=preguntas_count,
                ya_respondida=row.id in responded_ids,
            )
        )
    return result


def _validate_respuestas(
    preguntas: list[EncuestaPregunta], items: list[RespuestaItem]
) -> list[dict]:
    by_id = {p.id: p for p in preguntas}
    if len(items) != len(preguntas):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes responder todas las preguntas",
        )
    seen: set[int] = set()
    payload: list[dict] = []
    for item in items:
        if item.pregunta_id in seen:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Pregunta duplicada en la respuesta",
            )
        pregunta = by_id.get(item.pregunta_id)
        if not pregunta:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Pregunta invalida: {item.pregunta_id}",
            )
        valor = item.valor.strip()
        if not valor:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Todas las respuestas deben tener contenido",
            )
        if pregunta.tipo == "opcion_multiple":
            opciones = _parse_opciones(pregunta.opciones) or []
            if valor not in opciones:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Opcion invalida para: {pregunta.texto[:40]}",
                )
        seen.add(item.pregunta_id)
        payload.append({"pregunta_id": item.pregunta_id, "valor": valor})
    if seen != set(by_id.keys()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faltan respuestas para algunas preguntas",
        )
    return payload


def submit_respuesta(
    db: Session, encuesta_id: int, user_id: int, data: RespuestaSubmit
) -> RespuestaOut:
    row = _get_encuesta_or_404(db, encuesta_id)
    if not row.activa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Esta encuesta ya no esta activa",
        )
    existing = (
        db.query(EncuestaRespuesta)
        .filter(
            EncuestaRespuesta.encuesta_id == encuesta_id,
            EncuestaRespuesta.usuario_id == user_id,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya respondiste esta encuesta",
        )
    preguntas = _get_preguntas(db, encuesta_id)
    if not preguntas:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La encuesta no tiene preguntas",
        )
    payload = _validate_respuestas(preguntas, data.respuestas)
    respuesta = EncuestaRespuesta(
        encuesta_id=encuesta_id,
        usuario_id=user_id,
        respuestas=json.dumps(payload, ensure_ascii=False),
        fecha=datetime.now(timezone.utc),
    )
    db.add(respuesta)
    db.commit()
    db.refresh(respuesta)
    return RespuestaOut(
        id=respuesta.id,
        encuesta_id=respuesta.encuesta_id,
        usuario_id=respuesta.usuario_id,
        respuestas=[RespuestaItem.model_validate(item) for item in payload],
        fecha=respuesta.fecha,
    )


def _since(days: int) -> datetime:
    days = min(max(days, 1), 365)
    return datetime.now(timezone.utc) - timedelta(days=days)


def _respuestas_query(db: Session, encuesta_id: int | None, since: datetime | None):
    q = db.query(EncuestaRespuesta)
    if encuesta_id is not None:
        q = q.filter(EncuestaRespuesta.encuesta_id == encuesta_id)
    if since is not None:
        q = q.filter(EncuestaRespuesta.fecha >= since)
    return q


def get_encuestas_stats_summary(db: Session, days: int = 30) -> EncuestasStatsSummary:
    since = _since(days)
    encuestas = (
        db.query(Encuesta)
        .order_by(Encuesta.fecha_creacion.desc(), Encuesta.id.desc())
        .all()
    )
    total_respuestas = db.query(func.count(EncuestaRespuesta.id)).scalar() or 0
    respuestas_periodo = (
        _respuestas_query(db, None, since).with_entities(func.count(EncuestaRespuesta.id)).scalar()
        or 0
    )
    items: list[EncuestaStatsSummaryItem] = []
    for row in encuestas:
        preguntas_count, respuestas_count = _counts(db, row.id)
        respuestas_periodo_count = (
            _respuestas_query(db, row.id, since)
            .with_entities(func.count(EncuestaRespuesta.id))
            .scalar()
            or 0
        )
        items.append(
            EncuestaStatsSummaryItem(
                id=row.id,
                titulo=row.titulo,
                activa=row.activa,
                preguntas_count=preguntas_count,
                respuestas_count=respuestas_count,
                respuestas_periodo=respuestas_periodo_count,
            )
        )
    return EncuestasStatsSummary(
        days=days,
        total_encuestas=len(encuestas),
        encuestas_activas=sum(1 for e in encuestas if e.activa),
        total_respuestas=total_respuestas,
        respuestas_periodo=respuestas_periodo,
        encuestas=items,
    )


def get_encuesta_stats_detail(
    db: Session, encuesta_id: int, days: int = 30
) -> EncuestaStatsDetail:
    row = _get_encuesta_or_404(db, encuesta_id)
    since = _since(days)
    preguntas = _get_preguntas(db, encuesta_id)
    respuestas_rows = (
        _respuestas_query(db, encuesta_id, since)
        .order_by(EncuestaRespuesta.fecha.desc())
        .all()
    )
    answers_by_question: dict[int, list[str]] = defaultdict(list)
    for respuesta_row in respuestas_rows:
        try:
            data = json.loads(respuesta_row.respuestas)
        except json.JSONDecodeError:
            continue
        for item in data:
            pregunta_id = item.get("pregunta_id")
            valor = (item.get("valor") or "").strip()
            if pregunta_id is not None and valor:
                answers_by_question[int(pregunta_id)].append(valor)

    pregunta_stats: list[PreguntaStat] = []
    for pregunta in preguntas:
        valores = answers_by_question.get(pregunta.id, [])
        total = len(valores)
        if pregunta.tipo == "opcion_multiple":
            counts = Counter(valores)
            opciones_def = _parse_opciones(pregunta.opciones) or []
            opciones_stats: list[OpcionStat] = []
            for opcion in opciones_def:
                count = counts.get(opcion, 0)
                percent = round((count / total) * 100, 1) if total else 0.0
                opciones_stats.append(
                    OpcionStat(opcion=opcion, count=count, percent=percent)
                )
            for opcion, count in counts.items():
                if opcion not in opciones_def:
                    percent = round((count / total) * 100, 1) if total else 0.0
                    opciones_stats.append(
                        OpcionStat(opcion=opcion, count=count, percent=percent)
                    )
            pregunta_stats.append(
                PreguntaStat(
                    pregunta_id=pregunta.id,
                    texto=pregunta.texto,
                    tipo=pregunta.tipo,
                    total_respuestas=total,
                    opciones=opciones_stats,
                )
            )
        else:
            pregunta_stats.append(
                PreguntaStat(
                    pregunta_id=pregunta.id,
                    texto=pregunta.texto,
                    tipo=pregunta.tipo,
                    total_respuestas=total,
                    muestras_texto=valores[:15],
                )
            )

    _, respuestas_count = _counts(db, encuesta_id)
    return EncuestaStatsDetail(
        id=row.id,
        titulo=row.titulo,
        activa=row.activa,
        days=days,
        respuestas_count=respuestas_count,
        preguntas=pregunta_stats,
    )
