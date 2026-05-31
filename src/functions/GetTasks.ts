import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateUUID, validateEnum, validateMaxLength, ValidationError } from "../validation"
import { ok, badRequest, serverError, logRequest } from "../response"

function parsePositiveInt(value: string | null, field: string, defaultVal: number): { value: number; error: ValidationError | null } {
  if (!value) return { value: defaultVal, error: null }
  const parsed = parseInt(value, 10)
  if (isNaN(parsed) || parsed < 0) {
    return { value: defaultVal, error: { field, message: `${field} must be a non-negative integer` } }
  }
  return { value: parsed, error: null }
}

export async function GetTasks(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  logRequest(context, request)

  try {
    const organizationId = request.query.get("organizationId")!
    const status = request.query.get("status")
    const priority = request.query.get("priority")
    const title = request.query.get("title")
    const search = request.query.get("search")

    const { value: limit, error: limitError } = parsePositiveInt(request.query.get("limit"), "limit", 10)
    const { value: offset, error: offsetError } = parsePositiveInt(request.query.get("offset"), "offset", 0)

    const errors: ValidationError[] = [
      validateUUID(organizationId, "organizationId"),
      validateEnum(status, "status", ["todo", "in-progress", "completed"]),
      validateEnum(priority, "priority", ["low", "medium", "high"]),
      validateMaxLength(title, "title", 100),
      validateMaxLength(search, "search", 100),
      limitError,
      offsetError,
    ].filter(Boolean)

    if (errors.length) return badRequest(errors)

    const conditions = ["c.organizationId = @orgId"]
    const parameters: { name: string; value: string | number }[] = [
      { name: "@orgId", value: organizationId },
      { name: "@limit", value: limit },
      { name: "@offset", value: offset },
    ]

    if (status) {
      conditions.push("c.status = @status")
      parameters.push({ name: "@status", value: status })
    }
    if (priority) {
      conditions.push("c.priority = @priority")
      parameters.push({ name: "@priority", value: priority })
    }
    if (title) {
      conditions.push("CONTAINS(c.title, @title)")
      parameters.push({ name: "@title", value: title })
    }
    if (search) {
      conditions.push("(CONTAINS(c.title, @search) OR CONTAINS(c.description, @search))")
      parameters.push({ name: "@search", value: search })
    }

    const container = getContainer()
    const { resources } = await container.items
      .query({
        query: `SELECT * FROM c WHERE ${conditions.join(" AND ")} ORDER BY c._ts OFFSET @offset LIMIT @limit`,
        parameters,
      })
      .fetchNext()

    return ok({ data: resources, limit, offset })
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("GetTasks", {
  methods: ["GET", "OPTIONS"],
  authLevel: "anonymous",
  handler: GetTasks,
})
