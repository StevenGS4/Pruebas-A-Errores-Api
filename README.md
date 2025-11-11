# Pruebas-A-Errores-Api

Solución full-stack para la gestión de bitácoras de error. El repositorio se compone de:

- **BACKEND/** – Servicio SAP CAP + Express que expone APIs OData/REST y persiste en MongoDB.
- **FRONTEND/** – Aplicación React + Vite con soporte PWA para visualizar y operar sobre los registros.
- **infra/azure/** – Plantillas de infraestructura como código para desplegar los recursos en Azure.

## Despliegue en Azure

La plataforma quedó lista para ejecutarse en Azure App Service (backend), Azure Storage Static Website (frontend) y Azure Cosmos DB for MongoDB. Todo el aprovisionamiento y el despliegue continuo se automatizó con Bicep y Azure DevOps.

### 1. Infraestructura como código

Archivo: [`infra/azure/main.bicep`](infra/azure/main.bicep)

El template crea y configura:

- **App Service Plan Linux** y **Web App** para ejecutar el backend Node.js (runtime Node 18, variables de entorno preconfiguradas, HTTPS obligatorio).
- **Azure Cosmos DB for MongoDB** con base de datos y colección autoscalables, exponiendo la cadena de conexión que se inyecta al Web App.
- **Storage Account (Static Website)** para servir el frontend compilado desde el contenedor `$web`.

Parámetros como `environment`, `namePrefix` o `location` permiten reutilizar el template en dev/test/prod. Para lanzar el despliegue manualmente:

```bash
az deployment group create \
  --resource-group <RG_NAME> \
  --template-file infra/azure/main.bicep \
  --parameters environment=dev namePrefix=errors location=eastus
```

### 2. Pipeline en Azure DevOps

Archivo: [`azure-pipelines.yml`](azure-pipelines.yml)

Pipeline multi-stage con tres fases:

1. **Infrastructure** (opcional, controlada por la variable `deployInfra`). Ejecuta el template Bicep con `AzureCLI@2` para aprovisionar/actualizar recursos.
2. **Build**. Compila ambos proyectos:
   - Backend: `npm install`, `npm run lint`, `npm run build`, empaquetado ZIP listo para App Service.
   - Frontend: `npm install`, `npm run build` (inyectando `VITE_API_BASE`), publica el artefacto `dist/`.
3. **Deploy**. Descarga los artefactos y
   - Usa `AzureWebApp@1` para publicar el ZIP en App Service Linux.
   - Usa `AzureCLI@2` para subir el frontend al contenedor `$web` del Storage Account.

> **Configura antes de ejecutar**
>
> - Un *service connection* tipo “Azure Resource Manager” con permisos sobre el grupo de recursos.
> - Variables/pipeline library con los valores reales para `azureServiceConnection`, `resourceGroupName`, `backendWebAppName`, `frontendStorageAccount` y `frontendApiBaseUrl`.
> - Permisos `Storage Blob Data Contributor` al service principal para permitir el upload del sitio estático.

### 3. Variables de entorno

Se añadieron archivos de ejemplo para facilitar la configuración local y el mapping con Azure App Service:

- [`BACKEND/.env.example`](BACKEND/.env.example) – HOST, PORT, API_URL, CONNECTION_STRING, etc.
- [`FRONTEND/.env.example`](FRONTEND/.env.example) – `VITE_API_BASE` con la URL del backend.

Replica estos archivos como `.env` al ejecutar localmente. En Azure, los valores son cargados automáticamente mediante `main.bicep` (backend) y variables de pipeline (frontend).

### 4. Flujo recomendado

1. Ejecutar el stage **Infrastructure** (activar `deployInfra=true`) para crear/actualizar recursos.
2. Ejecutar el pipeline (o dejarlo con trigger en `main`) para construir artefactos y desplegar automáticamente.
3. Validar:
   - Backend: `https://<backendWebAppName>.azurewebsites.net/health`
   - Frontend: `https://<storage-account-name>.z13.web.core.windows.net`
   - Cosmos DB: verificar colección `<cosmosCollectionName>` dentro de la base `<cosmosDatabaseName>`.

Con esto, la aplicación queda lista para CI/CD completo sobre Azure y Azure DevOps.
