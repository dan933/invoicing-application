# Create Resource Group

```
az group create --name InvoiceRG --location "Australia East"
```

Create Infrastructure

```
az deployment group create --resource-group InvoiceRG --template-file main.bicep --parameters tenantName='invoicepro' adminPassword='{password}' --no-wait
```
