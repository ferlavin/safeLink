"""Inferencia del clasificador NLP de URLs (transformer char-level).

Carga el modelo entrenado una sola vez (lazy) y clasifica URLs sin consultar
ninguna API. Si torch o el checkpoint no estan disponibles, hace fallback al
clasificador por lexico (`nlp_url_classifier.classify_url_nlp`) para que el
endpoint siga funcionando.
"""

from __future__ import annotations

import json
import threading
import warnings
from pathlib import Path

from services.url_analyzer import score_to_level

# El fast-path de nested tensors de torch emite un UserWarning inofensivo.
warnings.filterwarnings("ignore", message=".*nested tensor.*")

_CHECKPOINT = Path(__file__).resolve().parent.parent / "ml" / "url_transformer.pt"

_model = None
_torch = None
_encode = None
_load_lock = threading.Lock()
_load_failed = False


def _try_load() -> bool:
    global _model, _torch, _encode, _load_failed
    if _model is not None:
        return True
    if _load_failed:
        return False
    with _load_lock:
        if _model is not None:
            return True
        if _load_failed:
            return False
        try:
            import torch

            from ml.url_transformer_model import URLCharTransformer, encode_url

            if not _CHECKPOINT.exists():
                _load_failed = True
                return False

            ckpt = torch.load(_CHECKPOINT, map_location="cpu")
            model = URLCharTransformer(**ckpt["hparams"])
            model.load_state_dict(ckpt["state_dict"])
            model.eval()

            _model = model
            _torch = torch
            _encode = encode_url
            return True
        except Exception:
            _load_failed = True
            return False


def model_available() -> bool:
    return _try_load()


def _predict_proba(url: str) -> float:
    ids = _encode(url)
    x = _torch.tensor([ids], dtype=_torch.long)
    with _torch.no_grad():
        prob = _torch.sigmoid(_model(x)).item()
    return float(prob)


def classify_url_transformer(url: str) -> dict:
    url = url.strip()
    if not _try_load():
        # Fallback transparente al clasificador por lexico.
        from services.nlp_url_classifier import classify_url_nlp

        result = classify_url_nlp(url)
        result["detalle"]["modelo"] = "lexico (fallback, transformer no disponible)"
        result["explicacion"] = json.dumps(result["detalle"], ensure_ascii=False)
        return result

    prob = _predict_proba(url)
    score = int(round(prob * 100))

    if prob >= 0.7:
        categoria, categoria_label = "phishing_probable", "Phishing probable"
    elif prob >= 0.4:
        categoria, categoria_label = "sospechoso", "Sospechoso"
    else:
        categoria, categoria_label = "neutral", "Neutral / legitimo"

    # Confianza = distancia a la frontera de decision (0.5), reescalada.
    confianza = int(round(abs(prob - 0.5) * 2 * 100))

    resumen = [
        f"El modelo estima {score}% de probabilidad de phishing.",
        f"Clasificacion: {categoria_label} (confianza {confianza}%).",
        "Veredicto aprendido a nivel de caracteres, sin consultar listas ni APIs.",
    ]
    if categoria == "phishing_probable":
        resumen.insert(
            0,
            "El patron de caracteres de esta URL se parece al de URLs de phishing.",
        )

    detalle = {
        "tipo": "nlp_url_transformer",
        "modelo": "transformer char-level (PyTorch)",
        "url": url,
        "probabilidad_phishing": round(prob, 4),
        "categoria": categoria,
        "categoria_label": categoria_label,
        "confianza_pct": confianza,
        "resumen": resumen,
    }

    return {
        "url": url,
        "puntuacion_riesgo": score,
        "nivel_riesgo": score_to_level(score),
        "explicacion": json.dumps(detalle, ensure_ascii=False),
        "detalle": detalle,
    }
