param tenantName string
@secure()
param adminPassword string
param location string = 'australiaeast'

// App Service Plan
resource appServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${tenantName}-plan'
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
  }
}

// API Web App
resource apiWebApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${tenantName}-api'
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      netFrameworkVersion: 'v8.0'
      appSettings: [
        {
          name: 'ConnectionStrings__DefaultConnection'
          value: 'Host=${postgresServer.properties.fullyQualifiedDomainName};Database=${postgresDatabase.name};Username=pgadmin;Password=${adminPassword}'
        }
      ]
    }
  }
}

// App Service Plan for Frontend
resource frontendAppServicePlan 'Microsoft.Web/serverfarms@2022-03-01' = {
  name: '${tenantName}-frontend-plan'
  location: location
  sku: {
    name: 'F1'
    tier: 'Free'
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2022-03-01' = {
  name: '${tenantName}-app'
  location: location
  properties: {
    serverFarmId: frontendAppServicePlan.id
    httpsOnly: true
  }
}

// PostgreSQL Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2022-12-01' = {
  name: '${tenantName}-postgres'
  location: location
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    administratorLogin: 'pgadmin'
    administratorLoginPassword: adminPassword
    version: '14'
    storage: {
      storageSizeGB: 32
    }
  }
}

// PostgreSQL Database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2022-12-01' = {
  parent: postgresServer
  name: '${tenantName}db'
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Firewall rule for Azure services
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2022-12-01' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}
