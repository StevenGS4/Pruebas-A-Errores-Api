# BACKEND

Servicio SAP CAP + Express con soporte para MongoDB.

## Scripts disponibles

```bash
npm install       # instala dependencias
npm run lint      # ejecuta ESLint con la configuración de SAP CAP
npm run build     # genera artefactos CAP (si aplica)
npm run start     # inicia CAP en modo estándar
npm run start:server # inicia `server.js` (Express + CAP) – ideal para App Service
```

## Variables de entorno

Duplica [`./.env.example`](./.env.example) como `.env` y completa:

- `CONNECTION_STRING` – Cadena de conexión de Azure Cosmos DB (Mongo API) generada por el Bicep.
- `API_URL` – URL pública del backend (ej. `https://errors-dev-api.azurewebsites.net`).
- `PORT` / `HOST` – Por defecto `3333` y `0.0.0.0`.

En Azure App Service estas variables se inyectan automáticamente desde [`infra/azure/main.bicep`](../infra/azure/main.bicep).
