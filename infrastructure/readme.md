Create Resource Group

```
az group create --name InvoiceRG --location "Australia East"
```

Create Infrastructure

```
az deployment group create --resource-group InvoiceRG --template-file main.bicep --parameters tenantName='invoicepro' adminPassword='1234' --no-wait
```

Destroy Infrastructure
Comment out main.bicep then redeploy??
