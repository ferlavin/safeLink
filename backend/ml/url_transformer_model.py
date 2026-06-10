"""Transformer liviano a nivel de caracteres para clasificar URLs.

El modelo aprende patrones de caracteres directamente de la URL (sin
consultar APIs externas): combinaciones como `banco-...-login`, TLDs raros,
sustituciones de letras por numeros, subdominios largos, etc.

Este modulo define el modelo y utilidades de vocabulario compartidas entre
el entrenamiento (`train_url_transformer.py`) y la inferencia
(`services/nlp_url_transformer.py`).
"""

from __future__ import annotations

import math

import torch
import torch.nn as nn

# Conjunto de caracteres tipico de una URL. Indice 0 = PAD, 1 = UNK.
CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789.-_/:?=&%@+~#"
PAD_IDX = 0
UNK_IDX = 1
MAX_LEN = 128

# vocab: caracter -> indice (empezando en 2, dejando 0/1 para PAD/UNK)
STOI = {ch: i + 2 for i, ch in enumerate(CHARSET)}
ITOS = {i + 2: ch for i, ch in enumerate(CHARSET)}
VOCAB_SIZE = len(CHARSET) + 2


def encode_url(url: str, max_len: int = MAX_LEN) -> list[int]:
    url = (url or "").strip().lower()
    # Quitamos el esquema para que el modelo se enfoque en host/path.
    for prefix in ("https://", "http://"):
        if url.startswith(prefix):
            url = url[len(prefix):]
            break
    ids = [STOI.get(ch, UNK_IDX) for ch in url[:max_len]]
    if len(ids) < max_len:
        ids += [PAD_IDX] * (max_len - len(ids))
    return ids


class PositionalEncoding(nn.Module):
    def __init__(self, d_model: int, max_len: int = MAX_LEN):
        super().__init__()
        pe = torch.zeros(max_len, d_model)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, d_model, 2).float() * (-math.log(10000.0) / d_model)
        )
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer("pe", pe.unsqueeze(0))

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.pe[:, : x.size(1)]


class URLCharTransformer(nn.Module):
    def __init__(
        self,
        vocab_size: int = VOCAB_SIZE,
        d_model: int = 64,
        nhead: int = 4,
        num_layers: int = 2,
        dim_feedforward: int = 128,
        dropout: float = 0.1,
        max_len: int = MAX_LEN,
    ):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, d_model, padding_idx=PAD_IDX)
        self.pos_encoder = PositionalEncoding(d_model, max_len)
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            dim_feedforward=dim_feedforward,
            dropout=dropout,
            batch_first=True,
            activation="gelu",
        )
        self.encoder = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        # El "nested tensor fast path" es muy lento en CPU con padding mask.
        self.encoder.enable_nested_tensor = False
        self.dropout = nn.Dropout(dropout)
        self.classifier = nn.Linear(d_model, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        pad_mask = x == PAD_IDX  # (B, L) True donde hay padding
        emb = self.embedding(x)
        emb = self.pos_encoder(emb)
        encoded = self.encoder(emb, src_key_padding_mask=pad_mask)

        # Mean-pooling ignorando posiciones de padding.
        mask = (~pad_mask).unsqueeze(-1).float()
        summed = (encoded * mask).sum(dim=1)
        counts = mask.sum(dim=1).clamp(min=1.0)
        pooled = summed / counts

        pooled = self.dropout(pooled)
        return self.classifier(pooled).squeeze(-1)  # logit (B,)


def default_hparams() -> dict:
    return {
        "vocab_size": VOCAB_SIZE,
        "d_model": 64,
        "nhead": 4,
        "num_layers": 2,
        "dim_feedforward": 128,
        "dropout": 0.1,
        "max_len": MAX_LEN,
    }
