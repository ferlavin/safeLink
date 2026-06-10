"""Entrena el transformer char-level de URLs y guarda los pesos.

Uso:
    python -m ml.train_url_transformer            # entrenamiento por defecto
    python -m ml.train_url_transformer --epochs 8 --n 8000

El checkpoint se guarda en ml/url_transformer.pt e incluye los hiperparametros
para poder reconstruir el modelo en inferencia.
"""

from __future__ import annotations

import argparse
import time
from pathlib import Path

import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

from ml.dataset import build_dataset
from ml.url_transformer_model import URLCharTransformer, default_hparams, encode_url

CHECKPOINT_PATH = Path(__file__).resolve().parent / "url_transformer.pt"


def _make_tensors(data: list[tuple[str, int]]) -> TensorDataset:
    X = torch.tensor([encode_url(u) for u, _ in data], dtype=torch.long)
    y = torch.tensor([label for _, label in data], dtype=torch.float)
    return TensorDataset(X, y)


def train(epochs: int = 6, n_per_class: int = 6000, batch_size: int = 128, lr: float = 1e-3):
    torch.manual_seed(42)
    data = build_dataset(n_per_class=n_per_class)
    split = int(len(data) * 0.9)
    train_data, val_data = data[:split], data[split:]

    train_ds = _make_tensors(train_data)
    val_ds = _make_tensors(val_data)
    train_dl = DataLoader(train_ds, batch_size=batch_size, shuffle=True)
    val_dl = DataLoader(val_ds, batch_size=batch_size)

    hparams = default_hparams()
    model = URLCharTransformer(**hparams)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.BCEWithLogitsLoss()

    print(f"Dataset: {len(train_data)} train / {len(val_data)} val")
    for epoch in range(1, epochs + 1):
        model.train()
        t0 = time.time()
        total_loss = 0.0
        for xb, yb in train_dl:
            optimizer.zero_grad()
            logits = model(xb)
            loss = criterion(logits, yb)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            total_loss += loss.item() * xb.size(0)

        model.eval()
        correct = 0
        total = 0
        with torch.no_grad():
            for xb, yb in val_dl:
                probs = torch.sigmoid(model(xb))
                preds = (probs >= 0.5).float()
                correct += (preds == yb).sum().item()
                total += yb.size(0)
        acc = correct / max(total, 1)
        print(
            f"Epoch {epoch}/{epochs} - loss {total_loss / len(train_data):.4f} "
            f"- val_acc {acc:.4f} - {time.time() - t0:.1f}s"
        )

    torch.save({"state_dict": model.state_dict(), "hparams": hparams}, CHECKPOINT_PATH)
    print(f"Modelo guardado en {CHECKPOINT_PATH}")
    return acc


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--epochs", type=int, default=6)
    parser.add_argument("--n", type=int, default=6000, help="ejemplos por clase")
    parser.add_argument("--batch-size", type=int, default=128)
    parser.add_argument("--lr", type=float, default=1e-3)
    args = parser.parse_args()
    train(epochs=args.epochs, n_per_class=args.n, batch_size=args.batch_size, lr=args.lr)
