@description('Ubicación donde se desplegarán los recursos')
param location string = resourceGroup().location

@description('Identificador del entorno (dev, test, prod, etc.)')
param environment string = 'dev'

@description('Prefijo común para todos los recursos')
param namePrefix string = 'errors'

@description('SKU del App Service Plan para el backend')
@allowed([ 'B1' 'P1v2' 'P2v2' ])
param appServicePlanSku string = 'B1'

@description('Nombre de la base de datos Mongo principal')
param cosmosDatabaseName string = 'errors'

@description('Nombre de la colección principal de Mongo')
param cosmosCollectionName string = 'logs'

var tags = {
  workload: 'pruebas-a-errores-api'
  environment: environment
}

var normalizedPrefix = toLower(replace(namePrefix, '-', ''))
var storageNameBase = '${normalizedPrefix}${environment}fe'
var storageNameLength = length(storageNameBase) < 24 ? length(storageNameBase) : 24
var storageAccountName = substring(storageNameBase, 0, storageNameLength)

var cosmosNameBase = '${normalizedPrefix}${environment}mongo'
var cosmosNameLength = length(cosmosNameBase) < 44 ? length(cosmosNameBase) : 44
var cosmosAccountName = substring(cosmosNameBase, 0, cosmosNameLength)

var appServicePlanName = '${namePrefix}-${environment}-plan'
var backendWebAppName = '${namePrefix}-${environment}-api'

resource plan 'Microsoft.Web/serverfarms@2022-09-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: appServicePlanSku
    tier: contains(appServicePlanSku, 'P') ? 'PremiumV2' : 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true
  }
  tags: tags
}

resource backend 'Microsoft.Web/sites@2022-09-01' = {
  name: backendWebAppName
  location: location
  kind: 'app,linux'
  properties: {
    serverFarmId: plan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appSettings: [
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'WEBSITES_PORT'
          value: '3333'
        }
        {
          name: 'PORT'
          value: '3333'
        }
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'API_URL'
          value: 'https://${backend.defaultHostName}'
        }
      ]
    }
  }
  tags: tags
}

resource storage 'Microsoft.Storage/storageAccounts@2023-01-01' = {
  name: storageAccountName
  location: location
  sku: {
    name: 'Standard_LRS'
  }
  kind: 'StorageV2'
  properties: {
    accessTier: 'Hot'
    minimumTlsVersion: 'TLS1_2'
    allowBlobPublicAccess: true
    supportsHttpsTrafficOnly: true
  }
  tags: tags
}

resource storageStaticWebsite 'Microsoft.Storage/storageAccounts/blobServices@2023-01-01' = {
  name: 'default'
  parent: storage
  properties: {
    staticWebsite: {
      enabled: true
      indexDocument: 'index.html'
      errorDocument404Path: 'index.html'
    }
  }
}

resource cosmos 'Microsoft.DocumentDB/databaseAccounts@2023-04-15' = {
  name: cosmosAccountName
  location: location
  kind: 'MongoDB'
  properties: {
    apiProperties: {
      serverVersion: '4.0'
    }
    capabilities: [
      {
        name: 'EnableMongo'
      }
    ]
    databaseAccountOfferType: 'Standard'
    locations: [
      {
        locationName: location
        failoverPriority: 0
        isZoneRedundant: false
      }
    ]
    consistencyPolicy: {
      defaultConsistencyLevel: 'Session'
    }
    backupPolicy: {
      type: 'Periodic'
      periodicModeProperties: {
        backupIntervalInMinutes: 240
        backupRetentionIntervalInHours: 8
        backupStorageRedundancy: 'LocallyRedundant'
      }
    }
  }
  tags: tags
}

resource mongoDatabase 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases@2023-04-15' = {
  parent: cosmos
  name: cosmosDatabaseName
  properties: {
    resource: {
      id: cosmosDatabaseName
    }
    options: {
      autoscaleSettings: {
        maxThroughput: 1000
      }
    }
  }
}

resource mongoCollection 'Microsoft.DocumentDB/databaseAccounts/mongodbDatabases/collections@2023-04-15' = {
  parent: mongoDatabase
  name: cosmosCollectionName
  properties: {
    resource: {
      id: cosmosCollectionName
    }
    options: {
      autoscaleSettings: {
        maxThroughput: 1000
      }
    }
  }
}

var cosmosConnectionString = listConnectionStrings(cosmos.id, cosmos.apiVersion).connectionStrings[0].connectionString

resource backendAppSettings 'Microsoft.Web/sites/config@2022-09-01' = {
  parent: backend
  name: 'appsettings'
  properties: union({
    CONNECTION_STRING: cosmosConnectionString
  }, {
    HOST: '0.0.0.0'
  })
}

output backendUrl string = 'https://${backend.defaultHostName}'
output storageStaticWebsiteUrl string = storage.properties.primaryEndpoints.web
output cosmosConnectionString string = cosmosConnectionString
