# Extension SafeLink para Google Chrome

## Que hace

- **Barra de herramientas**: punto de color (verde / amarillo / rojo) segun si el sitio abierto parece seguro.
- **Google Search**: el mismo punto aparece **al lado** de cada resultado. El popup en Google solo explica los colores; no revisa la URL de la busqueda.
- **Popup**: resumen en lenguaje claro, inicio de sesion e historial (Seguros / A revisar / Peligrosos).

## Requisitos

1. Backend SafeLink activo (`uvicorn main:app --reload` en `backend/`).
2. Google Chrome.

## Instalacion

### Produccion (recomendado)

Publica la extension en **Chrome Web Store** y configura en el frontend:

```env
VITE_CHROME_WEB_STORE_URL=https://chrome.google.com/webstore/detail/TU_ID
```

Los usuarios instalan con **Agregar a Chrome** sin descargar ZIP.

### Desarrollo

1. `chrome://extensions/` → Modo de desarrollador
2. **Cargar descomprimida** → carpeta `extension/` del repo
3. Recarga la extension tras cada cambio en el codigo

Paquete ZIP opcional (generar con el script abajo):

```powershell
.\scripts\package-extension.ps1
```

## Configuracion

- API por defecto: `http://localhost:8000` (cambiable en el popup)
- `POST /analysis/check` — con Bearer token guarda en `analisis_urls`

## CORS

El backend acepta origenes `chrome-extension://`.

## Archivos de contenido

- `extension/content/inject.js` — analisis de enlaces en Google
- `extension/content/site-bridge.js` — la web detecta si la extension esta instalada
