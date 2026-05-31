import { getCosmosClient } from "./db"
import { config } from "./config"

async function setup() {
  const client = getCosmosClient()

  const { database } = await client.databases.createIfNotExists({
    id: config.databaseName,
  })

  const { container: tasksContainer } = await database.containers.createIfNotExists({
    id: config.containerName,
    partitionKey: { paths: ["/organizationId"] },
  })

  const { container: settingsContainer } = await database.containers.createIfNotExists({
    id: config.settingsContainerName,
    partitionKey: { paths: ["/organizationId"] },
  })

  console.log(`Database "${database.id}" ready`)
  console.log(`Container "${tasksContainer.id}" ready (partition key: /organizationId)`)
  console.log(`Container "${settingsContainer.id}" ready (partition key: /organizationId)`)
}

setup().catch((err) => {
  console.error("Setup failed:", err)
  process.exit(1)
})
