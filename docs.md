# Kitameraki Task API

Base URL: `http://localhost:7071/api`

---

## Task Object

| Field | Type | Required | Constraints |
|---|---|---|---|
| `id` | `string` (UUID) | ✅ | Valid UUID v4 |
| `organizationId` | `string` (UUID) | ✅ | Valid UUID v4 |
| `title` | `string` | ✅ | Max 100 characters |
| `description` | `string` | ❌ | Max 1000 characters |
| `dueDate` | `string` (date-time) | ❌ | ISO 8601 format |
| `priority` | `string` | ❌ | One of: `low`, `medium`, `high` |
| `status` | `string` | ✅ | One of: `todo`, `in-progress`, `completed` |
| `tags` | `string[]` | ❌ | Each item max 50 characters |

---

## Endpoints

### Insert Task

Creates a new task.

```
POST /api/InsertTask
```

**Request body** (JSON):

```json
{
  "id": "3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d",
  "organizationId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "title": "Fix login bug",
  "description": "Users cannot log in with SSO",
  "dueDate": "2026-06-15T10:00:00Z",
  "priority": "high",
  "status": "todo",
  "tags": ["bug", "auth"]
}
```

**Responses:**
| Status | Body |
|---|---|
| `200` | The created task object |
| `400` | `{ "error": "Validation failed", "details": [...] }` |
| `500` | `{ "error": "Internal server error" }` |

---

### Get Task

Retrieves a single task by ID and organization.

```
GET /api/GetTask?id=<uuid>&organizationId=<uuid>
```

**Query parameters:**
| Param | Type | Required |
|---|---|---|
| `id` | UUID | ✅ |
| `organizationId` | UUID | ✅ |

**Responses:**
| Status | Body |
|---|---|
| `200` | The task object |
| `400` | `{ "error": "Validation failed", "details": [...] }` |
| `404` | `{ "error": "Internal server error" }` (Cosmos DB returns 404 via exception) |
| `500` | `{ "error": "Internal server error" }` |

---

### List Tasks

Retrieves all tasks for an organization with optional filtering.

```
GET /api/GetTasks?organizationId=<uuid>&status=<status>&priority=<priority>&title=<text>&search=<text>
```

**Query parameters:**
| Param | Type | Required | Description |
|---|---|---|---|
| `organizationId` | UUID | ✅ | |
| `status` | enum | ❌ | Filter by status: `todo`, `in-progress`, `completed` |
| `priority` | enum | ❌ | Filter by priority: `low`, `medium`, `high` |
| `title` | string | ❌ | Filter by title (case-insensitive contains) |
| `search` | string | ❌ | Search title and description (case-insensitive contains) |

**Responses:**
| Status | Body |
|---|---|
| `200` | `[ task, task, ... ]` — array of task objects (empty array if none) |
| `400` | `{ "error": "Validation failed", "details": [...] }` |
| `500` | `{ "error": "Internal server error" }` |

---

### Update Task

Partially updates a task. Only provided fields are changed.

```
PATCH /api/UpdateTask?id=<uuid>&organizationId=<uuid>
```

**Query parameters:**
| Param | Type | Required |
|---|---|---|
| `id` | UUID | ✅ |
| `organizationId` | UUID | ✅ |

**Request body** (JSON) — any subset of task fields:

```json
{
  "status": "completed",
  "priority": "low"
}
```

**Responses:**
| Status | Body |
|---|---|
| `200` | The updated task object |
| `400` | `{ "error": "Validation failed", "details": [...] }` |
| `500` | `{ "error": "Internal server error" }` |

---

### Delete Task

Deletes a single task.

```
DELETE /api/DeleteTask?id=<uuid>&organizationId=<uuid>
```

**Query parameters:**
| Param | Type | Required |
|---|---|---|
| `id` | UUID | ✅ |
| `organizationId` | UUID | ✅ |

**Responses:**
| Status | Body |
|---|---|
| `200` | (empty body) |
| `400` | `{ "error": "Validation failed", "details": [...] }` |
| `500` | `{ "error": "Internal server error" }` |

---

### Bulk Delete Tasks

Deletes multiple tasks by their IDs within an organization.

```
DELETE /api/BulkDeleteTasks?organizationId=<uuid>
```

**Query parameters:**
| Param | Type | Required |
|---|---|---|
| `organizationId` | UUID | ✅ |

**Request body** (JSON) — array of task IDs:

```json
[
  "3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d",
  "e7f8a9b0-c1d2-4e3f-8a9b-0c1d2e3f4a5b"
]
```

**Responses:**
| Status | Body |
|---|---|
| `200` | (empty body) — partial failures are logged server-side |
| `400` | `{ "error": "Validation failed", "details": [...] }` |
| `500` | `{ "error": "Internal server error" }` |

---

## Error Response Format

**400 — Validation error:**
```json
{
  "error": "Validation failed",
  "details": [
    { "field": "id", "message": "id must be a valid UUID" },
    { "field": "title", "message": "title must be at most 100 characters" }
  ]
}
```

**500 — Internal error:**
```json
{
  "error": "Internal server error"
}
```

---

## Quick Reference (curl)

```bash
# Insert
curl -s http://localhost:7071/api/InsertTask \
  -H 'content-type: application/json' \
  -d '{"id":"3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d","organizationId":"a1b2c3d4-e5f6-7890-abcd-ef1234567890","title":"Test","status":"todo"}'

# List
curl -s "http://localhost:7071/api/GetTasks?organizationId=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Get one
curl -s "http://localhost:7071/api/GetTask?id=3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d&organizationId=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Update
curl -s -X PATCH "http://localhost:7071/api/UpdateTask?id=3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d&organizationId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H 'content-type: application/json' \
  -d '{"status":"completed"}'

# Delete one
curl -s -X DELETE "http://localhost:7071/api/DeleteTask?id=3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d&organizationId=a1b2c3d4-e5f6-7890-abcd-ef1234567890"

# Bulk delete
curl -s -X DELETE "http://localhost:7071/api/BulkDeleteTasks?organizationId=a1b2c3d4-e5f6-7890-abcd-ef1234567890" \
  -H 'content-type: application/json' \
  -d '["3b241e8b-0c0a-4f9a-8c3e-9a6f0a1b2c3d"]'
```
