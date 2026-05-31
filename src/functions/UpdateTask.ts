import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions"
import { getContainer } from "../db"
import { validateTaskIdAndOrg, validateMaxLength, validateEnum, validateTags, ValidationError } from "../validation"
import { ok, badRequest, serverError, logRequest } from "../response"

const allowedFields = ["title", "description", "dueDate", "priority", "status", "tags"]

export async function UpdateTask(
  request: HttpRequest,
  context: InvocationContext,
): Promise<HttpResponseInit> {
  if (request.method === "OPTIONS") return ok()

  logRequest(context, request)

  try {
    const body = (await request.json()) as Record<string, unknown>
    const taskId = request.query.get("id")
    const organizationId = request.query.get("organizationId")

    const errors: ValidationError[] = [
      ...validateTaskIdAndOrg(taskId, organizationId),
    ]

    if (body.title !== undefined) errors.push(validateMaxLength(body.title, "title", 100))
    if (body.description !== undefined) errors.push(validateMaxLength(body.description, "description", 1000))
    if (body.priority !== undefined) errors.push(validateEnum(body.priority, "priority", ["low", "medium", "high"]))
    if (body.status !== undefined) errors.push(validateEnum(body.status, "status", ["todo", "in-progress", "completed"]))
    if (body.tags !== undefined) errors.push(validateTags(body.tags))

    const filtered = errors.filter(Boolean)
    if (filtered.length) return badRequest(filtered)

    const patchOperations = Object.entries(body)
      .filter(([key]) => allowedFields.includes(key))
      .map(([key, value]) => ({
        op: "set" as const,
        path: `/${key}`,
        value,
      }))

    if (patchOperations.length === 0) {
      return badRequest([{ field: "body", message: "no valid fields to update" }])
    }

    const container = getContainer()
    const { resource } = await container.item(taskId, organizationId).patch(patchOperations)

    return ok(resource)
  } catch (error) {
    return serverError(error, context)
  }
}

app.http("UpdateTask", {
  methods: ["PATCH", "OPTIONS"],
  authLevel: "anonymous",
  handler: UpdateTask,
})
