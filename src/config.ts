import { CosmosClient } from "@azure/cosmos"

export const config = {
  cosmosConnectionString: process.env.COSMOS_CONNECTION_STRING || "",
  databaseName: process.env.COSMOS_DATABASE_NAME || "TaskApp",
  containerName: process.env.COSMOS_CONTAINER_NAME || "Tasks",
}

if (!config.cosmosConnectionString) {
  throw new Error("COSMOS_CONNECTION_STRING environment variable is required")
}

let client: CosmosClient

export function getCosmosClient(): CosmosClient {
  if (!client) {
    client = new CosmosClient(config.cosmosConnectionString)
  }
  return client
}
