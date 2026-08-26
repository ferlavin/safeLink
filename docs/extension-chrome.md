# Extensión SafeLink para Google Chrome

## Qué hace

- **Pestaña actual:** semáforo en el icono (Seguro / Precaución / Peligroso).
- **Google (.com y .ar):** punto de color junto a cada resultado. No bloquea el clic.
- **Popup:** el mismo lenguaje que la web, resumen corto, “Ver en SafeLink” si hay sesión.
- Si Render está dormido, el popup dice que está calentando y reintenta.

No está publicada en Chrome Web Store salvo que configures `VITE_CHROME_WEB_STORE_URL`.

## Requisitos

1. API SafeLink activa (`uvicorn main:app --reload` en `backend/`, o la de Render).
2. Google Chrome.

## Instalación (modo desarrollador)

1. `chrome://extensions/` → Modo de desarrollador
2. **Cargar descomprimida** → carpeta `extension/` del repo
3. Recargá la extensión tras cada cambio

En la app, `/extension` tiene la misma guía.

## Configuración

- API por defecto: la de producción en `extension/config.js` (cambiable en el popup).
- `POST /analysis/check` — con Bearer token guarda en historial (`analisis_urls` + Mis enlaces).
- CORS: el backend **no** acepta `chrome-extension://*`. Poné el ID (lo muestra el popup) en `CHROME_EXTENSION_ID`.

## Permiso `<all_urls>`

Hace falta para el semáforo en cualquier pestaña. No se piden permisos de bloqueo de navegación.

## Archivos

- `extension/background.js` — check, cache 5 min, cold start
- `extension/popup.js` — UI del semáforo
- `extension/content/inject.js` — puntos en Google
- `extension/content/site-bridge.js` — la web detecta la extensión e invalida cache al reportar
