"""Limite simple en memoria para analisis que pueden fetchear URLs."""

from __future__ import annotations

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status

from models.user import User

WINDOW_SECONDS = 60
LIMIT_ANON = 30
LIMIT_AUTH = 90

_lock = threading.Lock()
_hits: dict[str, deque[float]] = defaultdict(deque)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for") or ""
    if forwarded:
        return forwarded.split(",")[0].strip()[:45] or "unknown"
    if request.client and request.client.host:
        return request.client.host[:45]
    return "unknown"


def enforce_fetch_rate_limit(request: Request, user: User | None = None) -> None:
    authenticated = user is not None
    limit = LIMIT_AUTH if authenticated else LIMIT_ANON
    if authenticated:
        key = f"user:{user.id}"
    else:
        key = f"ip:{_client_ip(request)}"

    now = time.monotonic()
    with _lock:
        bucket = _hits[key]
        while bucket and now - bucket[0] >= WINDOW_SECONDS:
            bucket.popleft()
        if len(bucket) >= limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Demasiados analisis. Proba de nuevo en un minuto.",
            )
        bucket.append(now)
