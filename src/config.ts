export const config = {
  cosmosConnectionString: process.env.COSMOS_CONNECTION_STRING || "",
  databaseName: process.env.COSMOS_DATABASE_NAME || "TaskApp",
  containerName: process.env.COSMOS_CONTAINER_NAME || "Tasks",
  settingsContainerName: process.env.COSMOS_SETTINGS_CONTAINER_NAME || "Settings",
}

if (!config.cosmosConnectionString) {
  throw new Error("COSMOS_CONNECTION_STRING environment variable is required")
}
