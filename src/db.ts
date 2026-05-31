import { CosmosClient } from "@azure/cosmos"
import { config } from "./config"

let client: CosmosClient

export function getCosmosClient(): CosmosClient {
  if (!client) {
    client = new CosmosClient(config.cosmosConnectionString)
  }
  return client
}

export function getContainer() {
  return getCosmosClient().database(config.databaseName).container(config.containerName)
}
