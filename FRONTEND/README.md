# FRONTEND

Aplicación React + Vite con soporte PWA para la gestión de errores.

## Scripts

```bash
npm install   # instala dependencias
npm run dev   # modo desarrollo en http://localhost:5173
npm run build # compila el bundle estático en dist/
npm run preview # previsualiza el build
```

## Variables de entorno

- Copia [`./.env.example`](./.env.example) a `.env`.
- Define `VITE_API_BASE` con la URL del backend. El pipeline de Azure DevOps la sobreescribe al valor productivo antes de generar el build.

## Despliegue en Azure

El artefacto `dist/` se publica como sitio estático en el Storage Account definido en [`infra/azure/main.bicep`](../infra/azure/main.bicep). El stage **Deploy** del [`azure-pipelines.yml`](../azure-pipelines.yml) usa `az storage blob upload-batch` para sincronizar el contenido con el contenedor `$web`.
