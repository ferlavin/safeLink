import json
import re
from io import BytesIO
from urllib.parse import unquote, urlparse

from pypdf import PdfReader
from pypdf.generic import ArrayObject, DictionaryObject, IndirectObject

from services.http_fetch import UnsafeUrlError, assert_scan_http_url
from services.url_analyzer import analyze_url, score_to_level

URL_RE = re.compile(
    r"https?://[^\s\]\)\"'<>\\]+|www\.[^\s\]\)\"'<>\\]+|"
    r"(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
    r"(?:com\.ar|gob\.ar|org\.ar|net\.ar|gov\.ar|com|net|org|xyz|top|click|app|io)"
    r"(?:/[^\s\]\)\"'<>\\]*)?",
    re.IGNORECASE,
)
RAW_HTTP_RE = re.compile(rb"https?://[^\s<>()\\]{4,}", re.IGNORECASE)
RAW_HEX_URI_RE = re.compile(rb"/URI\s*<([0-9a-fA-F]{8,})>", re.IGNORECASE)
NOISE_HOSTS = (
    "adobe.com",
    "w3.org",
    "microsoft.com",
    "schemas.openxmlformats.org",
    "purl.org",
    "idpf.org",
    "ns.adobe.com",
    "aiim.org",
)


def _pdf_str(value) -> str:
    if value is None:
        return ""
    if isinstance(value, bytes):
        if value.startswith((b"\xfe\xff", b"\xff\xfe")):
            return value.decode("utf-16", errors="replace")
        return value.decode("latin-1", errors="replace")
    text = str(value)
    if text.startswith("/"):
        text = text[1:]
    return unquote(text.strip())


def _looks_like_url(raw: str) -> str | None:
    url = (raw or "").strip().strip("<>").rstrip(".,;:)")
    url = url.replace("\\", "")
    if not url:
        return None
    if url.lower().startswith("www."):
        url = "https://" + url
    elif "://" not in url and URL_RE.fullmatch(url):
        url = "https://" + url
    parsed = urlparse(url)
    if parsed.scheme not in ("http", "https"):
        return None
    host = (parsed.hostname or "").lower()
    if not host or any(host == n or host.endswith("." + n) for n in NOISE_HOSTS):
        return None
    if len(url) > 2000:
        return None
    return url


def _add_url(urls: list[str], seen: set[str], raw: str) -> None:
    url = _looks_like_url(raw)
    if not url:
        return
    key = url.rstrip("/")
    if key in seen:
        return
    seen.add(key)
    urls.append(url)


def _resolve_pdf_obj(obj):
    if isinstance(obj, IndirectObject):
        try:
            return obj.get_object()
        except Exception:
            return None
    return obj


def _filespec_url(filespec) -> str:
    filespec = _resolve_pdf_obj(filespec)
    if filespec is None:
        return ""
    if not isinstance(filespec, DictionaryObject):
        return _pdf_str(filespec)
    for key in ("/UF", "/F", "/URI"):
        if filespec.get(key) is not None:
            return _pdf_str(filespec.get(key))
    return ""


def _uri_from_action(action) -> str:
    action = _resolve_pdf_obj(action)
    if not isinstance(action, DictionaryObject):
        return ""
    subtype = str(action.get("/S") or "")
    if subtype in ("/URI", "URI"):
        return _pdf_str(action.get("/URI"))
    if subtype in ("/Launch", "Launch", "/GoToR", "GoToR"):
        return _filespec_url(action.get("/F"))
    js = action.get("/JS") or action.get("/JavaScript")
    if js is not None:
        text = _pdf_str(_resolve_pdf_obj(js))
        match = URL_RE.search(text)
        if match:
            return match.group(0)
    if action.get("/URI") is not None:
        return _pdf_str(action.get("/URI"))
    return ""


def _walk_uris(obj, seen_ids: set[int], urls: list[str], seen_urls: set[str], depth: int = 0) -> None:
    if obj is None or depth > 40:
        return
    oid = id(obj)
    if oid in seen_ids:
        return
    seen_ids.add(oid)
    if isinstance(obj, IndirectObject):
        obj = _resolve_pdf_obj(obj)
        if obj is None:
            return
        _walk_uris(obj, seen_ids, urls, seen_urls, depth + 1)
        return
    if isinstance(obj, DictionaryObject):
        uri = obj.get("/URI")
        if uri is not None:
            _add_url(urls, seen_urls, _pdf_str(uri))
        action_uri = _uri_from_action(obj.get("/A"))
        if action_uri:
            _add_url(urls, seen_urls, action_uri)
        extra = obj.get("/AA")
        extra = _resolve_pdf_obj(extra)
        if isinstance(extra, DictionaryObject):
            for value in extra.values():
                extra_uri = _uri_from_action(value)
                if extra_uri:
                    _add_url(urls, seen_urls, extra_uri)
        for value in obj.values():
            _walk_uris(value, seen_ids, urls, seen_urls, depth + 1)
        return
    if isinstance(obj, ArrayObject):
        for value in obj:
            _walk_uris(value, seen_ids, urls, seen_urls, depth + 1)


def _uris_from_annotations(page) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    annots = page.get("/Annots")
    if not annots:
        annots = getattr(page, "annotations", None)
    if not annots:
        return found
    try:
        items = list(annots)
    except TypeError:
        return found
    for annot in items:
        obj = _resolve_pdf_obj(annot)
        if not isinstance(obj, DictionaryObject):
            continue
        action_uri = _uri_from_action(obj.get("/A"))
        if action_uri:
            _add_url(found, seen, action_uri)
        if obj.get("/URI") is not None:
            _add_url(found, seen, _pdf_str(obj.get("/URI")))
        extra = _resolve_pdf_obj(obj.get("/AA"))
        if isinstance(extra, DictionaryObject):
            for value in extra.values():
                extra_uri = _uri_from_action(value)
                if extra_uri:
                    _add_url(found, seen, extra_uri)
    return found


def _text_from_page(page) -> str:
    parts = []
    for kwargs in ({}, {"extraction_mode": "layout"}):
        try:
            text = page.extract_text(**kwargs) if kwargs else page.extract_text()
        except TypeError:
            text = page.extract_text() if not kwargs else None
        except Exception:
            text = None
        if text:
            parts.append(text)
    blob = "\n".join(parts)
    blob = re.sub(r"-\s*\n\s*", "", blob)
    blob = re.sub(r"(https?:)\s+", r"\1", blob, flags=re.I)
    blob = re.sub(r"(https?://)\s+", r"\1", blob, flags=re.I)
    blob = re.sub(r"(https?://\S+)\s*\n\s*(\S+)", r"\1\2", blob, flags=re.I)
    return blob


def _uris_from_raw_pdf(content: bytes) -> list[str]:
    found: list[str] = []
    seen: set[str] = set()
    for match in RAW_HTTP_RE.findall(content):
        try:
            raw = match.decode("latin-1", errors="ignore")
        except Exception:
            continue
        _add_url(found, seen, raw)
    for match in RAW_HEX_URI_RE.findall(content):
        try:
            raw = bytes.fromhex(match.decode("ascii")).decode("latin-1", errors="ignore")
        except Exception:
            continue
        _add_url(found, seen, raw)
    return found


def extract_urls_from_pdf(content: bytes) -> list[str]:
    urls: list[str] = []
    seen: set[str] = set()
    try:
        reader = PdfReader(BytesIO(content))
    except Exception:
        for url in _uris_from_raw_pdf(content):
            _add_url(urls, seen, url)
        return urls

    for page in reader.pages:
        for url in _uris_from_annotations(page):
            _add_url(urls, seen, url)
        _walk_uris(page, set(), urls, seen)
        for match in URL_RE.findall(_text_from_page(page)):
            _add_url(urls, seen, match)

    try:
        _walk_uris(reader.trailer, set(), urls, seen)
    except Exception:
        pass

    for url in _uris_from_raw_pdf(content):
        _add_url(urls, seen, url)
    return urls


def analyze_pdf(content: bytes, filename: str) -> dict:
    urls = extract_urls_from_pdf(content)
    link_results = []
    max_score = 0

    for url in urls[:40]:
        try:
            assert_scan_http_url(url)
        except UnsafeUrlError:
            link_results.append(
                {
                    "url": url,
                    "puntuacion_riesgo": 0,
                    "nivel_riesgo": "bajo",
                    "alertas": ["No se pudo analizar: direccion interna o no valida"],
                }
            )
            continue
        r = analyze_url(url, slow_signals=False)
        max_score = max(max_score, r["puntuacion_riesgo"])
        link_results.append(
            {
                "url": url,
                "puntuacion_riesgo": r["puntuacion_riesgo"],
                "nivel_riesgo": r["nivel_riesgo"],
                "alertas": r["detalle"].get("resumen", []),
            }
        )

    if not urls:
        nivel = "bajo"
        score = 0
        resumen = ["No se encontraron enlaces en el PDF"]
    else:
        nivel = score_to_level(max_score)
        score = max_score
        risky = [item for item in link_results if item["puntuacion_riesgo"] >= 26]
        resumen = [
            f"Se encontraron {len(urls)} enlace(s) en el documento",
            f"{len(risky)} enlace(s) con riesgo medio o superior",
        ]

    detalle = {
        "tipo": "pdf",
        "archivo": filename,
        "total_enlaces": len(urls),
        "enlaces": link_results,
        "resumen": resumen,
    }
    return {
        "url": f"pdf://{filename}",
        "puntuacion_riesgo": score,
        "nivel_riesgo": nivel,
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
