# Kitameraki BE Test

Task management API built on Azure Functions + Cosmos DB.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Azure Functions Core Tools v4](https://learn.microsoft.com/en-us/azure/azure-functions/functions-run-local)
- [Node.js 20.x](https://nodejs.org/)

## Running Locally

**1. Start the Cosmos DB emulator**

```bash
docker compose up -d
```

**2. Install dependencies**

```bash
npm install
```

**3. Create `local.settings.json`** (already gitignored):

```json
{
  "IsEncrypted": false,
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "COSMOS_CONNECTION_STRING": "AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==;",
    "NODE_TLS_REJECT_UNAUTHORIZED": "0"
  }
}
```

**4. Create the database and containers**

```bash
COSMOS_CONNECTION_STRING="AccountEndpoint=https://localhost:8081/;AccountKey=C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==;" npm run db:setup
```

**5. Build the project**

```bash
npm run build
```

**6. Start the Functions host**

```bash
npm start
```

The API is now available at `http://localhost:7071/api`.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `COSMOS_CONNECTION_STRING` | — (required) | Cosmos DB endpoint and key |
| `COSMOS_DATABASE_NAME` | `TaskApp` | Database name |
| `COSMOS_CONTAINER_NAME` | `Tasks` | Tasks container name |
| `COSMOS_SETTINGS_CONTAINER_NAME` | `Settings` | Settings container name |

## API Docs

See [`docs.md`](./docs.md) for all endpoints, request/response formats, and curl examples.
